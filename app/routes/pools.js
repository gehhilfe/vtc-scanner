const _ = require('lodash');
const mongoose = require('mongoose');
const path = require('path');

const Pool = mongoose.model('Pool');

module.exports = function (server) {
  server.get('/api/pools', async (req, res, next) => {
    const pools = await Pool.find({
      errCounter: 0,
      local_stats: { $ne: null }
    }).limit(10).sort({updatedAt: -1});
    res.send(pools);
    return next();
  });

  server.get('/api/pools/:id', async (req, res, next) => {
    res.send(await Pool.findOne({_id: req.params.id}));
    return next();
  });

  server.post('/api/pools', async (req, res, next) => {
    let p = await Pool.findOne({ip: req.body.ip});
    if(p) {
      res.send(p);
    } else {
      p = new Pool({
        ip: req.body.ip
      });
      res.send(await p.save());
    }
    return next();
  });
};