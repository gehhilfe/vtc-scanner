const _ = require('lodash');
const mongoose = require('mongoose');
const path = require('path');
const geoip = require('geoip-lite');

const Pool = mongoose.model('Pool');

module.exports = function (server) {
  server.get('/api/pools', async (req, res, next) => {
    if (!server.p2poolVersion) {
      res.send([]);
      return next();
    }

    try {
      let pools;

      const reqIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

      let reqGeo = geoip.lookup(reqIp);
      if (!reqGeo) {
        reqGeo = {
          ll: [0, 0]
        };
      }

      let baseQueryDesc = {
        errCounter: 0,
        sucCounter: {$gt: 0},
        $or: [{version: server.p2poolVersion}, {version: server.p2poolVersion + '-dirty'}]
      };

      if(req.query.net) {
        if(req.query.net == 1)
          baseQueryDesc['port'] = 9171;
        else
          baseQueryDesc['port'] = 9181;
      }

      let query = Pool.find(baseQueryDesc);

      if (req.query.sortfee) {
        query = query.sort({fee: req.query.sortfee});
      }

      if (req.query.sortactive_miners) {
        query = query.sort({active_miners: req.query.sortactive_miners});
      }

      if (req.query.sorthash_rate) {
        query = query.sort({hash_rate: req.query.sorthash_rate});
      }

      if (req.query.sortping) {
        query = query.sort({ping: req.query.sortping});
      }


      query.sort({score: -1});

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
          length: await Pool.find(baseQueryDesc).count()
        });
      } else {
        pools = await query
          .limit(10)
          .sort({updatedAt: -1});
        res.send(pools);
      }
      return next();
    } catch (err) {
      return next(err);
    }
  });

  server.get('/api/pools/:id', async (req, res, next) => {
    res.send(await Pool.findOne({_id: req.params.id}));
    return next();
  });

  server.post('/api/pools', async (req, res, next) => {
    let p = await Pool.findOne({ip: req.body.ip});
    if (p) {
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