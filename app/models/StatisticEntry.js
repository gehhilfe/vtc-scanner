'use strict';


const _ = require('lodash');
const path = require('path');
const config = require(path.join(__dirname, '../../config/config'));
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const statisticEntrySchema = new Schema({
  type: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  }
});

const StatisticEntry = mongoose.model('StatisticEntry', statisticEntrySchema);
module.exports = StatisticEntry;
