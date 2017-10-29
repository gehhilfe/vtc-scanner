/*jslint node: true */
'use strict';

const fs = require('fs');
const path = require('path');

module.exports = function (server) {
  fs.readdirSync(path.join(__dirname, '.')).forEach(function (file) {
    if (file.substr(-3, 3) === '.js' && file !== 'index.js') {
      require('./' + file.replace('.js', ''))(server);
    }
  });
};