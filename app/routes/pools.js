const _ = require('lodash');
const mongoose = require('mongoose');
const path = require('path');

const Pool = mongoose.model('Pool');

module.exports = function (server) {
  server.get('/api/pools', async (req, res, next) => {
    const pools = await Pool.find({});
    res.send(pools);
    return next();
  });

  server.get('/api/pools/:id', async (req, res, next) => {
    res.send(await Pool.findOne({_id: req.params.id}));
    return next();
  });
};