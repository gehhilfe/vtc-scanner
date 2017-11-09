/*jslint node: true */
'use strict';

const fs = require('fs');

module.exports = function () {
  fs.readdirSync('./app/crons').forEach(function (file) {
    if (file.substr(-3, 3) === '.js' && file !== 'index.js') {
      require('./' + file.replace('.js', ''))();
    }
  });
};