const _ = require('lodash');
const mongoose = require('mongoose');
const path = require('path');

const config = require(path.join(__dirname, '../../config/config'));
const PATH = '/scan-node/:ip';

const restifyClients = require('restify-clients');


const Pool = mongoose.model('Pool');
const geoip = require('geoip-lite');
module.exports = function (server) {

  function scanNode(req, res, next) {
    console.log(req.params.ip);

    const client = restifyClients.createJSONClient({
      url: 'http://'+req.params.ip
    });

    client.get('/local_stats', async (err, clientReq, clientRes, obj) => {
      if(err) {
        res.send(err);
      } else {
        let p = await Pool.findOne({ip: req.params.ip});
        if (p) {
          p.local_stats = obj;
        } else {
          p = Pool({
            ip: req.params.ip,
            local_stats: obj
          });
        }
        let ipSplit = _.split(p.ip, ':');
        ipSplit.pop()
        res.send(geoip.lookup(_.join(ipSplit)));
      }
      return next();
    });
  }

  server.get(PATH, scanNode)
};