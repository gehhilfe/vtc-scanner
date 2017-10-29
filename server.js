const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test', {useMongoClient: true});

const path = require('path');

const config = require(path.join(__dirname, '/config/config'));
const models = require(path.join(__dirname, '/app/models/'));
const routes = require(path.join(__dirname, '/app/routes/'));

const restify = require('restify');
const server = restify.createServer();
const restifyPlugins = restify.plugins;


server.use(restifyPlugins.bodyParser());
server.use(restifyPlugins.queryParser());
server.use(restifyPlugins.gzipResponse());
server.pre(restify.pre.sanitizePath());

server.use(
  function crossOrigin(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    return next();
  }
);

models();
routes(server);

server.get(/.*/, restifyPlugins.serveStatic({
  directory: './webapp/dist',
  default: 'index.html'
}));

server.listen(8080, async () => {
  console.log('%s listening at %s', server.name, server.url);
});