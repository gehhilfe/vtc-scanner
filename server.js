const _ = require('lodash');
const path = require('path');

const config = require(path.join(__dirname, '/config/config'));

const mongoose = require('mongoose');

const models = require(path.join(__dirname, '/app/models/'));
const routes = require(path.join(__dirname, '/app/routes/'));

const restify = require('restify');
const server = restify.createServer();
const restifyPlugins = restify.plugins;


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
routes(server);

server.get(/.*/, restifyPlugins.serveStatic({
  directory: './webapp/dist',
  default: 'index.html'
}));

mongoose.connect('mongodb://' + config.db.host + '/' + config.db.name, {useMongoClient: true})
  .then(() => {
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
        await scoreFunc();
        setTimeout(updateFunc, 1);
      };


      const scoreFunc = async () => {
        const avgPing = (await Pool.aggregate({
          $group: {
            _id: null,
            total: {$avg: '$ping'}
          }
        }))[0].total;
        const maxMiner = (await Pool.aggregate({
          $group: {
            _id: null,
            total: {$max: '$active_miners'}
          }
        }))[0].total;
        const maxHashRate = (await Pool.aggregate({
          $group: {
            _id: null,
            total: {$max: '$hash_rate'}
          }
        }))[0].total;
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

          it.score = Math.round((pingScore+minerScore+hashRateScore+uptimeScore)/5);
          return it.save();
        }));
      };

      updateFunc();
    });
  }).catch(console.log);