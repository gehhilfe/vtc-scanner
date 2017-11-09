const _ = require('lodash');
const path = require('path');
const dns = require('dns');

const config = require(path.join(__dirname, '/config/config'));

const mongoose = require('mongoose');

const models = require(path.join(__dirname, '/app/models/'));
const routes = require(path.join(__dirname, '/app/routes/'));
const crons = require(path.join(__dirname, '/app/crons/'));

const restify = require('restify');
const server = restify.createServer();
const restifyPlugins = restify.plugins;

const logger = require('./app/lib/logger');

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
routes(server);

mongoose.connect('mongodb://' + config.db.host + '/' + config.db.name, {useMongoClient: true})
  .then(async () => {

    if((await Node.count()) === 0) {
      logger.info('Bootstrapping node search with seeds');
      await Promise.all(_.map(config.vertcoin.seeds, async (it) => {
        let ip = _.head(await (new Promise((resolve, reject) => dns.resolve(it, (err, res) => {
          if (err)
            reject(err);
          else
            resolve(res);
        }))));

        if ((await Node.find({ip: ip}).count()) === 0)
          Node.create({
            ip: ip,
            port: config.vertcoin.port
          });
      }));
      logger.info('Seed notes added');
    }

    if((await Pool.count()) === 0) {
      logger.info('Bootstrapping pool search with seeds');
      await Promise.all(_.map(config.p2pool.net1.seeds, async (it) => {
        let ip = _.head(await (new Promise((resolve, reject) => dns.resolve(it, (err, res) => {
          if (err)
            reject(err);
          else
            resolve(res);
        }))));

        if ((await Pool.find({ip: ip+':'+config.p2pool.net1.port}).count() === 0)) {
          Pool.create({
            ip: ip+':'+config.p2pool.net1.port,
            dns: it
          });
        }
      }));

      await Promise.all(_.map(config.p2pool.net2.seeds, async (it) => {
        let ip = _.head(await (new Promise((resolve, reject) => dns.resolve(it, (err, res) => {
          if (err)
            reject(err);
          else
            resolve(res);
        }))));

        if ((await Pool.find({ip: ip+':'+config.p2pool.net2.port}).count() === 0)) {
          Pool.create({
            ip: ip+':'+config.p2pool.net2.port,
            dns: it
          });
        }
      }));
    }

    server.listen(config.app.port, async () => {
      logger.info('%s listening at %s', server.name, server.url);

      crons(server);
    });
  }).catch(logger.debug);