'use strict';

const path = require('path');
const config = require(path.join(__dirname, '/config/config'));

const VertcoinClient = require('./app/lib/VertcoinClient');


const client = new VertcoinClient();

client.on('message', (msg) => {
  console.log(msg.getInfo());
});

client.connect('172.17.0.2', 5889).then((info) => {
  console.log(info);
  client.getaddr();
}).catch((err) => {
  console.log(err);
});