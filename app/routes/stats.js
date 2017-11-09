const _ = require('lodash');
const mongoose = require('mongoose');

const StatisticEntry = mongoose.model('StatisticEntry');

module.exports = (server) => {

  server.get('/api/stats/:type', async (req, res, next) => {
    try {
      res.send(_.reverse(await StatisticEntry.find({
        type: req.params.type
      }).sort({
        date: -1
      }).limit(24)));
    }
    catch (err) {
      res.send([]);
    }
    return next();
  });

};