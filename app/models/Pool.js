/*jslint node: true */
'use strict';
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

}

poolSchema.loadClass(PoolClass);
const Pool = mongoose.model('Pool', poolSchema);
module.exports = Pool;