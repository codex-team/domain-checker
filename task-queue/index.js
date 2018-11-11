const Queue = require('./lib/queue');
const Parser = require('./lib/parser');
const RedisQueue = require('./lib/queueRedis');
const JsonParser = require('./lib/parserJson');

module.exports = {
  ...Queue,
  ...Parser,
  ...RedisQueue,
  ...JsonParser
};