'use strict';

const _ = require('lodash');
const path = require('path');
const config = require(path.join(__dirname, '../../config/config'));

const mongoose = require('mongoose');
const geoip = require('geoip-lite');
const dns = require('dns');

const VertcoinClient = require('./../lib/VertcoinClient');

const Schema = mongoose.Schema;
const nodeSchema = new Schema({
  ip: {
    type: String, required: true, index: true, unique: true
  },
  port: Number,
  dns: String,
  errCounter: {type: Number, default: 0},
  sucCounter: {type: Number, default: 0},
  userAgent: String,
  country: String,
  version: Number,
  location: {
    'type': {type: String, default: 'Point'},
    coordinates: {type: [Number], default: [0, 0]}
  }
});

nodeSchema.index({location: '2dsphere'});
nodeSchema.set('timestamps', true);

class NodeClass {

  updateInfo() {
    const loc = geoip.lookup(this.ip);
    if (loc) {
      this.country = loc.country;
      this.location.coordinates = [loc.ll[1], loc.ll[0]];
    }
    const prom = new Promise(async (resolve, reject) => {
      try {
        this.client = new VertcoinClient();
        this.client.on('message', (msg) => {
          try {
            if (msg.header.command === 'verack')
              this.client.getaddr();
            if (msg.header.command === 'addr') {
              if (this.client) {
                this.client.close();
                delete this.client;
              }
              resolve(msg.getInfo().addrs);
            }
          }catch(err) {
            reject(err);
          }
        });
        this.client.on('close', () => {
          if (this.client) {
            this.client.close();
            delete this.client;
          }
          reject();
        });
        const res = await this.client.connect(this.ip, this.port);
        this.version = res.version;
        this.userAgent = res.userAgent;
        setTimeout(() => {
          if (this.client) {
            this.client.close();
            delete this.client;
          }
          reject('Timeout');
        }, 1000 * 120);
      } catch (err) {
        if (this.client) {
          this.client.close();
          delete this.client;
        }
        reject(err);
      }
    });
    return prom;
  }
}

nodeSchema.loadClass(NodeClass);
const Node = mongoose.model('Node', nodeSchema);
module.exports = Node;