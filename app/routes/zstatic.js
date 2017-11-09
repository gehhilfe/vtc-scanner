const restify = require('restify');
const restifyPlugins = restify.plugins;

module.exports = (server) => {

  const serveIndex = restifyPlugins.serveStatic({
    directory: './webapp/dist',
    file: 'index.html'
  });

  server.get('/pools', serveIndex);
  server.get('/nodes', serveIndex);
  server.get('/mining', serveIndex);

  server.get(/^\/*(?!api).*/y, restifyPlugins.serveStatic({
    directory: './webapp/dist',
    default: 'index.html'
  }));
};