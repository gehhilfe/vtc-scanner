/*jslint node: true */
'use strict';
const _ = require('lodash');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const poolSchema = new Schema({
  ip: {
    type: String, required: true, index: true, unique: true
  },
  name: String,
  fee: Number,
  local_stats: Object,
  location: String,
  uptime: Number
});
poolSchema.set('timestamps', true);


const restifyClients = require('restify-clients');
const geoip = require('geoip-lite');

class PoolClass {

  async updateStats() {
    const client = restifyClients.createJSONClient({
      url: 'http://' + this.ip
    });

    let ipSplit = _.split(this.ip, ':');
    ipSplit.pop();
    this.location = geoip.lookup(_.join(ipSplit)).country;

    client.get('/local_stats', async (err, clientReq, clientRes, obj) => {
      if (err) {
        throw(err);
      } else {
        this.local_stats = obj;
      }
    });
  }

}

poolSchema.loadClass(PoolClass);
const Pool = mongoose.model('Pool', poolSchema);
module.exports = Pool;