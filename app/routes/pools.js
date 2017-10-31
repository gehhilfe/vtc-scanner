const _ = require('lodash');
const mongoose = require('mongoose');
const path = require('path');
const geoip = require('geoip-lite');

const Pool = mongoose.model('Pool');

module.exports = function (server) {
  server.get('/api/pools', async (req, res, next) => {
    try {
      let pools;

      let reqGeo = geoip.lookup(req.connection.remoteAddress);
      if(!reqGeo) {
        reqGeo = {
          ll: [0,0]
        };
      }

      let query = Pool.find({
        errCounter: 0,
        sucCounter: {$gt: 0}
      });

      if(req.query.sortfee) {
        query = query.sort({fee: req.query.sortfee});
      }

      if(req.query.sortactive_miners) {
        query = query.sort({active_miners: req.query.sortactive_miners});
      }

      if(req.query.sorthash_rate) {
        query = query.sort({hash_rate: req.query.sorthash_rate});
      }

      if(req.query.sortping) {
        query = query.sort({ping: req.query.sortping});
      }

      if (reqGeo && reqGeo.ll) {
        query = query.where('location')
          .near({
            center: [reqGeo.ll[1], reqGeo.ll[0]],
            spherical: true
          });
      }

      if (req.query.pageIndex) {
        const actualPageSize = Math.max(Math.min(req.query.pageSize, 25), 5);
        pools = await query
          .limit(actualPageSize)
          .skip(actualPageSize * req.query.pageIndex);
        res.send({
          result: pools,
          length: await Pool.find({
            errCounter: 0,
            sucCounter: {$gt: 0}
          }).count()
        });
      } else {
        pools = await query
          .limit(10)
          .sort({updatedAt: -1});
        res.send(pools);
      }
      return next();
    }catch (err) {
      return next(err);
    }
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