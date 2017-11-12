/*jslint node: true */
'use strict';

const path = require('path');

const rootPath = path.normalize(__dirname + '/..');

const NODE_ENV = process.env.NODE_ENV || 'development';
const NODE_HOST = process.env.NODE_HOST || '127.0.0.1';
const NODE_PORT = process.env.NODE_PORT || 8080;
const MONGO_HOST = process.env.MONGO_HOST || '127.0.0.1';
const MONGO_PORT = process.env.MONGO_PORT || 27017;
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const APP_NAME = 'vtc-scanner-';

const config = {
  development: {
    root: rootPath,
    app: {
      name: APP_NAME + NODE_ENV,
      address: NODE_HOST,
      port: NODE_PORT
    },
    db: {
      host: MONGO_HOST,
      port: MONGO_PORT,
      name: APP_NAME + NODE_ENV
    },
    log: {
      name: APP_NAME + NODE_ENV,
      level: LOG_LEVEL,
      exceptions: true
    },
    p2pool: {
      net1: {
        seeds: 'vtc.alwayshashing.com crypto.office-on-the.net pool.vtconline.org p2pool.kosmoplovci.org uk1.vtconline.org pool.boxienet.net'.split(' '),
        port: 9171
      },
      net2: {
        seeds: 'vtc2.alwayshashing.com pool.vtconline.org uk1.vtconline.org pool.boxienet.net'.split(' '),
        port: 9181
      }
    },
    vertcoin: {
      seeds: [
        'useast1.vtconline.org',
        'fr1.vtconline.org',
        'uk1.vtconline.org',
        'vtc.alwayshashing.com',
        'explorer.vertcoin.info',
        'p2pool.kosmoplovci.org',
        'crypto.office-on-the.net',
        'mail.hoosieryouth.org'
      ],
      port: 5889,
      magic: [0xfa, 0xbf, 0xb5, 0xda]
    }
  },
  test: {
    root: rootPath,
    app: {
      name: APP_NAME + NODE_ENV,
      address: NODE_HOST,
      port: NODE_PORT
    },
    db: {
      host: MONGO_HOST,
      port: MONGO_PORT,
      name: APP_NAME + NODE_ENV
    },
    log: {
      name: APP_NAME + NODE_ENV,
      level: LOG_LEVEL,
      exceptions: true
    },
    p2pool: {
      net1: {
        seeds: 'vtc.alwayshashing.com crypto.office-on-the.net pool.vtconline.org p2pool.kosmoplovci.org uk1.vtconline.org pool.boxienet.net'.split(' '),
        port: 9171
      },
      net2: {
        seeds: 'vtc2.alwayshashing.com pool.vtconline.org uk1.vtconline.org pool.boxienet.net'.split(' '),
        port: 9181
      }
    },
    vertcoin: {
      seeds: [
        'useast1.vtconline.org',
        'fr1.vtconline.org',
        'uk1.vtconline.org',
        'vtc.alwayshashing.com',
        'explorer.vertcoin.info',
        'p2pool.kosmoplovci.org',
        'crypto.office-on-the.net',
        'mail.hoosieryouth.org'
      ],
      port: 5889,
      magic: [0xfa, 0xbf, 0xb5, 0xda]
    }
  },
  production: {
    root: rootPath,
    app: {
      name: APP_NAME + NODE_ENV,
      address: NODE_HOST,
      port: NODE_PORT
    },
    db: {
      host: MONGO_HOST,
      port: MONGO_PORT,
      name: APP_NAME + NODE_ENV
    },
    log: {
      name: APP_NAME + NODE_ENV,
      level: LOG_LEVEL,
      exceptions: true
    },
    p2pool: {
      net1: {
        seeds: 'vtc.alwayshashing.com crypto.office-on-the.net pool.vtconline.org p2pool.kosmoplovci.org uk1.vtconline.org pool.boxienet.net'.split(' '),
        port: 9171
      },
      net2: {
        seeds: 'vtc2.alwayshashing.com pool.vtconline.org uk1.vtconline.org pool.boxienet.net'.split(' '),
        port: 9181
      }
    },
    vertcoin: {
      seeds: [
        'useast1.vtconline.org',
        'fr1.vtconline.org',
        'uk1.vtconline.org',
        'vtc.alwayshashing.com',
        'explorer.vertcoin.info',
        'p2pool.kosmoplovci.org',
        'crypto.office-on-the.net',
        'mail.hoosieryouth.org'
      ],
      port: 5889,
      magic: [0xfa, 0xbf, 0xb5, 0xda]
    }
  }
};

module.exports = config[NODE_ENV];