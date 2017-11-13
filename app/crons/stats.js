const _ = require('lodash');
const mongoose = require('mongoose');
const cron = require('node-cron');

const logger = require('./../lib/logger');

const Pool = mongoose.model('Pool');
const StatisticEntry = mongoose.model('StatisticEntry');

module.exports = (server) => {
  cron.schedule('*/5 * * * *', async () => {
    logger.info('Creating 5min statistics');
    await StatisticEntry.create({
      type: 'Miners',
      value: await Pool.sumMiners()
    });
    await StatisticEntry.create({
      type: 'Hashrate',
      value: await Pool.sumHashrate()
    });
    await StatisticEntry.create({
      type: 'AvgEfficiency',
      value: await Pool.averageEfficiency()
    });
  });

  cron.schedule('0 * * * *', async () => {
    logger.info('Creating 1h statistics');
    const currentDate = new Date();
    const fromDate = new Date(currentDate - 1000 * 3600); // minus 1 hour
    await StatisticEntry.create({
      type: 'Miners1h',
      value: await StatisticEntry.avgCombine('Miners', fromDate, currentDate)
    });
    await StatisticEntry.create({
      type: 'Hashrate1h',
      value: await StatisticEntry.avgCombine('Hashrate', fromDate, currentDate)
    });
    await StatisticEntry.create({
      type: 'AvgEfficiency1h',
      value: await StatisticEntry.avgCombine('AvgEfficiency', fromDate, currentDate)
    });
  });

  cron.schedule('0 0 * * *', async () => {
    logger.info('Creating 1d statistics');
    const currentDate = new Date();
    const fromDate = new Date(currentDate - 1000 * 3600 * 24); // minus 24 hours
    await StatisticEntry.create({
      type: 'Miners1d',
      value: await StatisticEntry.avgCombine('Miners1h', fromDate, currentDate)
    });
    await StatisticEntry.create({
      type: 'Hashrate1d',
      value: await StatisticEntry.avgCombine('Hashrate1h', fromDate, currentDate)
    });
    await StatisticEntry.create({
      type: 'AvgEfficiency1d',
      value: await StatisticEntry.avgCombine('AvgEfficiency1h', fromDate, currentDate)
    });
  });

  cron.schedule('*/5 * * * *', async () => {
    if (await (Pool.count()) === 0)
      return;
    logger.info('Updating pool score');

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
  });
};