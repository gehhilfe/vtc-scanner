'use strict';

const EventEmitter = require('events');
const net = require('net');
const ip = require('ipaddr.js');

const crypto = require('crypto');

const _ = require('lodash');
const path = require('path');
const config = require(path.join(__dirname, '../../config/config'));

const logger = require('./logger');

const STATE_READ_HEADER = 0;
const STATE_READ_MSG = 1;

class MessageHeader {
  constructor(headerBuffer) {
    let offset = 0;
    const validMagic = _.reduce(_.map(config.vertcoin.magic, (it) => it === headerBuffer.readUInt8(offset++)), (acc, it) => acc && it);

    this.invalidMaigc = !validMagic;

    const cmdBuf = headerBuffer.slice(4, 4 + 12);

    this.command = cmdBuf.toString('ascii');
    // Remove trailing \0
    this.command = this.command.substr(0, this.command.indexOf('\0'));

    this.payloadSize = headerBuffer.readUInt32LE(4 + 12);
    this.checksum = headerBuffer.slice(4 + 12 + 4);
  }
}

class Message {
  constructor(header, body) {
    this.header = header;
    this.body = body;
  }

  getInfo() {
    if (this.header.command === 'version') {
      let version = this.body.readUInt32LE(0);
      let userAgent = '';
      if (version >= 106) {
        // Extract user agent
        const length = this.body.readUInt8(80);
        userAgent = this.body.toString('utf8', 81, 81 + length);

      }
      return {
        command: 'version',
        version: version,
        userAgent: userAgent
      };
    } else if (this.header.command === 'ping') {
      return {
        command: 'ping',
        nonce: this.body.readUInt32LE(0) << 32 + this.body.readUInt32LE(4)
      };
    } else if (this.header.command === 'verack') {
      return {
        command: 'verack'
      };
    } else if (this.header.command === 'addr') {
      let offset = 0;
      let length = this.body.readUInt8(offset++);
      if (length === 0xFD) {
        length = this.body.readUInt16LE(offset);
        offset += 2;
      }
      let addrs = [];
      for (let i = 0; i < length; i++) {
        let e = this._extractAddr(this.body, offset);
        offset = e.nextOffset;
        delete e.nextOffset;
        addrs.push(e);
      }
      return {
        command: 'addr',
        count: length,
        addrs: addrs
      };
    }
    return {
      err: 'Unkown command ' + this.header.command
    };
  }

  _extractAddr(buffer, offset) {
    const timestamp = buffer.readUInt32LE(offset);
    offset += 4;
    const serviceHigh = buffer.readUInt32LE(offset);
    offset += 4;
    const serviceLow = buffer.readUInt32LE(offset);
    offset += 4;

    let addr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    addr = _.map(addr, () => {
      return buffer.readUInt8(offset++);
    });

    let ipAddr = ip.fromByteArray(addr);
    const flag = _.reduce(_.take(addr, 10), (acc, it) => acc && it === 0, true);
    if (flag && addr[10] === 255 && addr[11] === 255) {
      ipAddr = ip.fromByteArray(_.takeRight(addr, 4));
    }


    const port = buffer.readUInt16BE(offset);
    offset += 2;
    return {
      time: new Date(timestamp * 1000),
      ip: ipAddr.toString(),
      port: port,
      nextOffset: offset
    };
  }
}

class VertcoinClient extends EventEmitter {

  constructor(options) {
    super();

    this.connectionTimeout = 10000;
    this.tcpSocket = new net.Socket();
    this.currentState = STATE_READ_HEADER;
    this.headerBuffer = Buffer.alloc(24);
    this.headerOffset = 0;
    this.bodyOffset = 0;
    this.currentState = STATE_READ_HEADER;
    this.tcpSocket.on('data', this._recvBuffer(this));

    this.tcpSocket.on('close', (buf) => {
      this.emit('close');
    });

    this.tcpSocket.on('error', () => {
      this.emit('close');
    });

    this.on('message', (msg) => {
      if (msg.header.command === 'version') {
        const info = msg.getInfo();
        delete info.command;
        this.peerInfo = info;
        this._sendPacket('verack');
      }
      if (msg.header.command === 'ping') {
        this._sendPacket('pong', msg.body);
      }
      if (msg.header.command === 'sendheaders') {
        this._sendPacket('headers', Buffer.alloc(1));
      }
      if (msg.header.command === 'verack') {
        this.emit('connected', this.peerInfo);
      }

    });

    this.PROTOCOL_VERSION = 70012;
  }

  _recvBuffer(self) {
    return (buf) => {
      if (self.currentState === STATE_READ_HEADER) {
        const headerToRead = 24 - self.headerOffset;
        if (buf.length >= headerToRead) {
          buf.copy(self.headerBuffer, self.headerOffset, 0, headerToRead);
          self.headerOffset = 24;
          self.currentState = STATE_READ_MSG;
          buf = buf.slice(headerToRead);

          // Parse header
          self.lastHeader = new MessageHeader(self.headerBuffer);
          if (!self.lastHeader.invalidMaigc)
            self.bodyBuffer = Buffer.alloc(self.lastHeader.payloadSize);
          self.bodyOffset = 0;

          if (self.lastHeader.payloadSize === 0) {
            self.emit('message', new Message(self.lastHeader, self.bodyBuffer));
            self.currentState = STATE_READ_HEADER;
            self.headerOffset = 0;
            return;
          }
        } else {
          buf.copy(self.headerBuffer, self.headerOffset);
          self.headerOffset += buf.length;
        }
      }

      if (self.currentState === STATE_READ_MSG) {
        const bodyToRead = self.lastHeader.payloadSize - self.bodyOffset;
        if (buf.length >= bodyToRead && bodyToRead > 0) {
          if (!self.lastHeader.invalidMaigc)
            buf.copy(self.bodyBuffer, self.bodyOffset, 0, bodyToRead);
          self.bodyOffset = self.lastHeader.payloadSize;

          if (!self.lastHeader.invalidMaigc)
            self.emit('message', new Message(self.lastHeader, self.bodyBuffer));
          self.currentState = STATE_READ_HEADER;
          self.headerOffset = 0;

          if (buf.length > bodyToRead)
            self._recvBuffer(self)(buf.slice(bodyToRead));
        } else {
          if (!self.lastHeader.invalidMaigc)
            buf.copy(self.bodyBuffer, self.bodyOffset);
          self.bodyOffset += buf.length;
        }
      }
    };
  }

  /**
   * Connects to Vertcoin Node
   * @param host hostname or ip
   * @param port port to connect to
   * @returns {Promise} resolves when connected
   */
  connect(host, port) {
    return new Promise((resolve, reject) => {
      try {
        this.once('connected', resolve);
        this.once('close', reject);

        this.tcpSocket.connect(port, host, () => {
          this.sendVersion();
        });

        setTimeout(() => {
          reject();
          this.emit('connectionTimeout');
        }, this.connectionTimeout);
      }
      catch (err) {
        reject(err);
      }
    });
  }

  close() {
    this.tcpSocket.end();
  }

  sendVersion() {
    const buf = Buffer.alloc(85);
    let offset = 0;

    // Protocol Version
    buf.writeUInt32LE(this.PROTOCOL_VERSION, offset);
    offset += 4;

    // Services None
    offset += 8;

    // Epoch
    const epoch = new Date() / 1000;
    buf.writeUInt32LE(epoch, offset);
    offset += 4;
    buf.writeUInt32LE(0, offset);
    offset += 4;

    // addr_recv services
    offset += 8;

    // addr_recv ip
    buf.write('::ffff:127.0.0.1', offset);
    offset += 16;

    // addr_recv port
    buf.writeUInt16BE(config.vertcoin.port & 0xFFFF, offset);
    offset += 2;

    // addr_trans services
    offset += 8;

    // addr_trans IP address
    buf.write('::ffff:127.0.0.1', offset);
    offset += 16;

    // addr_trans port
    buf.writeUInt16BE(this.tcpSocket.localPort & 0xFFFF, offset);
    offset += 2;

    // nonce
    offset += 8;

    // agent
    offset += 1;

    // start_height
    offset += 4;
    this._sendPacket('version', buf);
  }

  getaddr() {
    this._sendPacket('getaddr');
  }

  /**
   * Adds message header to message
   * @param command message type
   * @param buffer byte buffer with message contens
   * @private
   */
  _sendPacket(command, buffer) {
    logger.debug('Sending ' + command);
    let length = 0;
    if (buffer)
      length = buffer.length;
    const buf = Buffer.alloc(length + 24);
    let offset = 0;

    if (command.length > 12)
      throw new Error('VertcoinClient command is to long');

    // Magic
    _.forEach(config.vertcoin.magic, (it) => {
      buf.writeUInt8(it, offset++);
    });

    // Command

    buf.write(command, offset, command.length, 'ascii');
    offset += 12;
    buf.writeUInt32LE(length, offset);
    offset += 4;

    if (buffer) {
      // Checksum
      let hash256 = crypto.createHash('sha256');
      let hash2562 = crypto.createHash('sha256');
      hash256.update(buffer);
      hash2562.update(hash256.digest());

      hash2562.digest().copy(buf, offset, 0, 4);
      offset += 4;

      buffer.copy(buf, offset);
    } else {
      buf.writeUInt32BE(0x5DF6E0E2, offset);
    }
    this.tcpSocket.write(buf);
  }

}

module.exports = VertcoinClient;