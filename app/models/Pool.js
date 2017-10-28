/*jslint node: true */
'use strict';

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var poolSchema = new Schema({
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

var Pool = mongoose.model('Pool', poolSchema)
module.exports = Pool;