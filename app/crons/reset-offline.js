const _ = require('lodash');
const mongoose = require('mongoose');
const cron = require('node-cron');

const logger = require('./../lib/logger');

const Node = mongoose.model('Pool');
const Pool = mongoose.model('Pool');

module.exports = () => {
  // Remove Nodes and Pools with err count 5
  cron.schedule('0 * * * *', async () => {
    logger.info('Resetting offline nodes and pools');
    await Node.remove({
      errCounter: {$gt: 4}
    });
    await Pool.remove({
      errCounter: {$gt: 4}
    });
  });
};