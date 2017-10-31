'use strict';

const _ = require('lodash');
const mongoose = require('mongoose');
const addrToIPPort = require('addr-to-ip-port');

const Schema = mongoose.Schema;
const poolSchema = new Schema({
  ip: {
    type: String, required: true, index: true, unique: true
  },
  dns: String,
  port: {
    type: Number,
    index: true
  },
  errCounter: {type: Number, default: 0},
  sucCounter: {type: Number, default: 0},
  version: String,
  fee: Number,
  local_stats: Object,
  country: String,
  uptime: Number,
  active_miners: {
    type: Number,
    default: 0
  },
  hash_rate: {
    type: Number,
    default: 0.0
  },
  efficiency: {
    type: Number,
    default: 0.0
  },
  shares: {
    dead: Number,
    orphan: Number,
    total: Number
  },
  donation_proportion: Number,
  location: {
    'type': {type: String, default: 'Point'},
    coordinates: {type: [Number], default: [0,0]}
  },
  ping: {
    type: Number,
    default: 0.0
  },
  last_offline: { type: Date, default: Date.now }
});

poolSchema.index({location: '2dsphere'});
poolSchema.set('timestamps', true);


const restifyClients = require('restify-clients');
const geoip = require('geoip-lite');
const dns = require('dns');

class PoolClass {

  updateStats() {
    return new Promise((resolve, reject) => {
      const client = restifyClients.createJSONClient({
        url: 'http://' + this.ip,
        connectTimeout: 5*1000,
        requestTimeout: 5*1000
      });

      const ipPortSplit = addrToIPPort(this.ip);

      this.port = ipPortSplit[1];

      const loc = geoip.lookup(ipPortSplit[0]);

      this.country = loc.country;
      this.location.coordinates = [loc.ll[1], loc.ll[0]];

      client.get('/local_stats', (err, clientReq, clientRes, obj) => {
        if (err) {
          reject(err);
        } else {
          // Remove because of possible dotted field in miner address
          let numMiner = 0;
          let hashRate = 0;
          if(obj.miner_hash_rates) {
            numMiner = _.keys(obj.miner_hash_rates).length;
            hashRate = _.reduce(_.values(obj.miner_hash_rates), (acc, it) => acc+it);
          }


          this.hash_rate = hashRate;
          this.active_miners = numMiner;
          this.efficency = obj.efficency;
          this.shares = obj.shares;
          this.donation_proportion = obj.donation_proportion;
          this.fee = obj.fee;
          this.version = obj.version;
          this.uptime = obj.uptime;
          dns.reverse(ipPortSplit[0], (err, hostnames) => {
            if(err) {
              reject(err);
            } else {
              this.dns = hostnames[0];
              resolve(this);
            }
          });
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
          peers = _.filter(_.map(peers, (it) => {
            if(it.indexOf(':') === -1) {
              it = it+':0';
            }
            const addr = addrToIPPort(it);
            if(addr[1] === 0) {
              addr[1] = self.getPort();
            }
            return addr[0]+':'+addr[1];
          }), (it) => {
            const addr = addrToIPPort(it);
            return addr[1] == 9171 || addr[1] == 9181;
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