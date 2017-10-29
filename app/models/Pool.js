'use strict';

const _ = require('lodash');
const mongoose = require('mongoose');
const addrToIPPort = require('addr-to-ip-port');

const Schema = mongoose.Schema;
const poolSchema = new Schema({
  ip: {
    type: String, required: true, index: true, unique: true
  },
  errCounter: {type: Number, default: 0},
  version: String,
  fee: Number,
  local_stats: Object,
  location: String,
  uptime: Number
});
poolSchema.set('timestamps', true);


const restifyClients = require('restify-clients');
const geoip = require('geoip-lite');

class PoolClass {

  updateStats() {
    return new Promise((resolve, reject) => {
      const client = restifyClients.createJSONClient({
        url: 'http://' + this.ip,
        connectTimeout: 5*1000,
        requestTimeout: 5*1000
      });
      const loc = geoip.lookup(addrToIPPort(this.ip)[0]);

      this.location = loc.country;

      client.get('/local_stats', (err, clientReq, clientRes, obj) => {
        if (err) {
          reject(err);
        } else {
          this.local_stats = obj;
          this.fee = obj.fee;
          this.version = obj.version;
          this.uptime = obj.uptime;
          resolve(this);
        }
      });
    });
  }

  getPort() {
    return addrToIPPort(this.ip)[1];
  }

  getPeers() {
    const self = this;
    return new Promise((resolve, reject) => {
      const client = restifyClients.createJSONClient({
        url: 'http://' + this.ip,
        connectTimeout: 5*1000,
        requestTimeout: 5*1000
      });

      client.get('/peer_addresses', (err, clientReq, clientRes, obj) => {
        if (err) {
          reject(err);
        } else {
          let peers = _.split(obj, ' ');
          peers = _.map(peers, (it) => {
            if(it.indexOf(':') === -1) {
              it = it+':0';
            }
            const addr = addrToIPPort(it);
            if(addr[1] === 0) {
              addr[1] = self.getPort();
            }
            return addr[0]+':'+addr[1];
          });
          resolve(peers);
        }
      });
    });
  }

  static getToRefresh() {
    return this.find({
      errCounter: {$lt: 5}
    }).sort({
      updatedAt: 1
    }).limit(30);
  }
}

poolSchema.loadClass(PoolClass);
const Pool = mongoose.model('Pool', poolSchema);
module.exports = Pool;