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

class StatisticEntryClass {

  static async avgCombine(type, from, to) {
    const res = await StatisticEntry.aggregate([
      {
        $match:
          {
            type: type,
            date:
              {
                $gt: from, $lt: to
              }
          }
      },
      {
        $group: {
          _id: null,
          total:
            {
              $avg: '$value'
            }
        }
      }]);
    if (res && res.length !== 0)
      return res[0].total;
    else
      return 0;
  }
}

statisticEntrySchema.loadClass(StatisticEntryClass);
const StatisticEntry = mongoose.model('StatisticEntry', statisticEntrySchema);
module.exports = StatisticEntry;
