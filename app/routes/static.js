const restify = require('restify');
const restifyPlugins = restify.plugins;

module.exports = (server) => {
  server.get(/.*/, restifyPlugins.serveStatic({
    directory: './webapp/dist',
    default: 'index.html'
  }));

  const serveIndex = restifyPlugins.serveStatic({
    directory: './webapp/dist',
    file: 'index.html'
  });

  server.on('NotFound', (req, res, err, next) => {
    serveIndex(req, res, next);
  });
};