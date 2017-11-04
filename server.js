const _ = require('lodash');
const path = require('path');
const dns = require('dns');

const config = require(path.join(__dirname, '/config/config'));

const mongoose = require('mongoose');

const models = require(path.join(__dirname, '/app/models/'));
const routes = require(path.join(__dirname, '/app/routes/'));

const restify = require('restify');
const server = restify.createServer();
const restifyPlugins = restify.plugins;
const cron = require('node-cron');

server.use(restifyPlugins.bodyParser());
server.use(restifyPlugins.queryParser());
server.use(restifyPlugins.gzipResponse());
server.pre(restify.pre.sanitizePath());

server.use(
  function crossOrigin(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    return next();
  }
);

models();
const Pool = mongoose.model('Pool');
const Node = mongoose.model('Node');
const StatisticEntry = mongoose.model('StatisticEntry');
routes(server);

server.get(/.*/, restifyPlugins.serveStatic({
  directory: './webapp/dist',
  default: 'index.html'
}));

mongoose.connect('mongodb://' + config.db.host + '/' + config.db.name, {useMongoClient: true})
  .then(async () => {

    cron.schedule('*/5 * * * *', async () => {
      await StatisticEntry.create({
        type: 'Miners',
        value: await Pool.sumMiners()
      });
      await StatisticEntry.create({
        type: 'Hashrate',
        value: await Pool.sumHashrate()
      });
      await StatisticEntry.create({
        type: 'AvgEfficency',
        value: await Pool.averageEfficency()
      });
    });

    // Remove Nodes and Pools with err count 5
    cron.schedule('0 * * * *', async () => {
      await Node.remove({
        errCounter: {$gt: 4}
      });
      await Pool.remove({
        errCounter: {$gt: 4}
      });
    });


    console.log('Removing all vertcoin nodes');
    await Node.remove({});
    await Promise.all(_.map(config.vertcoin.seeds, async (it) => {
      let ip = _.head(await (new Promise((resolve, reject) => dns.resolve(it, (err, res) => {
        if (err)
          reject(err);
        else
          resolve(res);
      }))));

      return Node.create({
        ip: ip,
        port: config.vertcoin.port
      });
    }));
    console.log('Seed notes added');

    const nodeUpdateFunc = async () => {
      const nodes = await Node.find({
        errCounter: {$lt: 5}
      }).sort({
        updatedAt: 1
      }).limit(10);
      await Promise.all(_.map(nodes, async (n) => {
        try {
          let peers = await n.updateInfo();
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
    setTimeout(nodeUpdateFunc, 1);

    server.listen(8080, async () => {
      console.log('%s listening at %s', server.name, server.url);

      const updateFunc = async () => {
        const ps = await Pool.getToRefresh();

        await Promise.all(_.map(ps, async (p) => {
          try {
            await new Promise(resolve => {
              setTimeout(resolve, (Math.random() * 5 + 1) * 1000);
            });
            console.log('Update pool status of ' + p._id);

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
        if (await (Pool.count()) > 0)
          await scoreFunc();
        setTimeout(updateFunc, 30000);
      };


      const scoreFunc = async () => {
        const avgPing = await Pool.averagePing();
        const maxMiner = await Pool.maxMiners();
        const maxHashRate = await Pool.maxHashrate();
        const minOffline = (await Pool.aggregate({
          $group: {
            _id: null,
            total: {$min: '$last_offline'}
          }
        }))[0].total;
        const maxOnlineMs = new Date() - minOffline;

        await Promise.all(_.map(await Pool.find({}), (it) => {

          //Ping Score
          let pingScore = 0;
          if (it.ping !== undefined && it.ping !== 0) {
            if (it.ping <= 0.2 * avgPing)
              pingScore = 5;
            else if (it.ping <= 0.5 * avgPing)
              pingScore = 4;
            else if (it.ping <= 0.9 * avgPing)
              pingScore = 3;
            else if (it.ping <= avgPing)
              pingScore = 2;
            else
              pingScore = 1;
          }

          //Miner Score
          let minerScore = 0;
          if (it.active_miners !== undefined) {
            if (it.active_miners <= 0.05 * maxMiner)
              minerScore = 5;
            else if (it.active_miners <= 0.2 * maxMiner)
              minerScore = 4;
            else if (it.active_miners <= 0.4 * maxMiner)
              minerScore = 3;
            else if (it.active_miners <= 0.5 * maxMiner)
              minerScore = 2;
            else
              minerScore = 1;
          }

          //Hashrate Score
          let hashRateScore = 0;
          if (it.hash_rate !== undefined) {
            if (it.hash_rate <= 0.05 * maxHashRate)
              hashRateScore = 5;
            else if (it.hash_rate <= 0.2 * maxHashRate)
              hashRateScore = 4;
            else if (it.hash_rate <= 0.4 * maxHashRate)
              hashRateScore = 3;
            else if (it.hash_rate <= 0.5 * maxHashRate)
              hashRateScore = 2;
            else
              hashRateScore = 1;
          }

          //Uptime Score
          let uptimeScore = 0;
          if (it.last_offline !== undefined) {
            const onlineMs = new Date() - it.last_offline;
            if (onlineMs >= 0.8 * maxOnlineMs)
              uptimeScore = 5;
            else if (onlineMs >= 0.6 * maxOnlineMs)
              uptimeScore = 4;
            else if (onlineMs >= 0.4 * maxOnlineMs)
              uptimeScore = 3;
            else if (onlineMs >= 0.2 * maxOnlineMs)
              uptimeScore = 2;
            else
              uptimeScore = 1;
          }

          it.score = Math.round((pingScore + minerScore + hashRateScore + uptimeScore) / 5);
          return it.save();
        }));
      };

      updateFunc();
    });
  }).catch(console.log);