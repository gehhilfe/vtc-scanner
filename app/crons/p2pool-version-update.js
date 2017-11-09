const _ = require('lodash');
const cron = require('node-cron');
const logger = require('./../lib/logger');

const Github = require('github-api');
const api = new Github();

module.exports = (server) => {
  cron.schedule('*/5 * * * *', async () => {
    logger.info('Updating p2pool version');
    const repo = api.getRepo('vertcoin', 'p2pool-vtc');
    const commits = await repo.listCommits({
      sha: 'master'
    });
    const lastCommitShaShort = commits.data[0].sha.substr(0, 7);
    if(lastCommitShaShort !== server.p2poolVersion)
      logger.info('New p2pool version found: '+lastCommitShaShort);
    server.p2poolVersion = lastCommitShaShort;
  }, true);
};