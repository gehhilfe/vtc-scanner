const winston = require('winston');
const path = require('path');
const config = require(path.join(__dirname, '../../config/config'));
winston.emitErrs = true;

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: config.log.level,
      handleExceptions: config.log.exceptions,
      json: false,
      colorize: true
    })
  ],
  exitOnError: false
});

module.exports = logger;
module.exports.stream = {
  write: (msg, enc) => {
    logger.info(msg);
  }
};