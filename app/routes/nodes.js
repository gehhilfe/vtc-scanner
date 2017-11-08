const _ = require('lodash');
const mongoose = require('mongoose');

const Node = mongoose.model('Node');

module.exports = (server) => {
  server.get('/api/nodes', async (req, res, next) => {
    res.send(await Node.find({
      sucCounter: {$gt: 0},
      userAgent: {$ne: null},
      'location.coordinates': {$ne: [0,0]}
    }).select({
      userAgent: 1,
      location: 1
    }));
    return next();
  });
};