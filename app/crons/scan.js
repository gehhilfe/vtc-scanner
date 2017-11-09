const _ = require('lodash');
const path = require('path');
const mongoose = require('mongoose');

const logger = require('./../lib/logger');

const Pool = mongoose.model('Pool');
const Node = mongoose.model('Node');
const config = require(path.join(__dirname, '../../config/config'));

module.exports = (server) => {
  const updateFunc = async () => {
    const ps = await Pool.getToRefresh();

    await Promise.all(_.map(ps, async (p) => {
      try {
        await new Promise(resolve => {
          setTimeout(resolve, (Math.random() * 5 + 1) * 1000);
        });
        logger.debug('Update pool status of ' + p.ip);

        let startTime = new Date();
        const peers = await p.getPeers();
        let endTime = new Date();

        let diff = endTime - startTime;
        startTime = new Date();
        await p.updateStats();
        endTime = new Date();

        diff += endTime - startTime;
        diff /= 2;
        if (!p.ping || p.ping === 0) {
          p.ping = diff;
        } else {
          // Average over time
          p.ping = Math.floor(p.ping * 0.3 + p.ping * 0.7);
        }
        p.errCounter = 0;
        p.sucCounter += 1;
        await Promise.all(_.map(peers, async (it) => {
          let p = await Pool.findOne({ip: it});
          if (!p) {
            await Pool.create({ip: it});
          }
        }));
      }
      catch (err) {
        p.errCounter += 1;
        p.sucCounter = 0;
        p.last_offline = Date.now();
      }
      finally {
        await p.save();
      }
    }));
    setTimeout(updateFunc, 30000);
  };

  const nodeUpdateFunc = async () => {
    const nodes = await Node.find({
      errCounter: {$lt: 5}
    }).sort({
      updatedAt: 1
    }).limit(10);
    await Promise.all(_.map(nodes, async (n) => {
      logger.debug('Update vertcoin node status of ' + n.ip);
      try {
        let peers = await n.updateInfo();
        n.sucCounter += 1;
        peers = _.sortBy(peers, 'time');
        await Promise.all(_.map(peers, async (it) => {
          let n = await Node.findOne({
            ip: it.ip
          });
          if (!n) {
            n = await Node.create({
              ip: it.ip,
              port: config.vertcoin.port
            });
          }
        }));
      }
      catch (err) {
        n.errCounter += 1;
      }
      finally {
        await n.save();
      }
    }));
    setTimeout(nodeUpdateFunc, 1);
  };

  logger.info('Start scanning of nodes and pools');
  setTimeout(nodeUpdateFunc, 1);
  updateFunc();
};