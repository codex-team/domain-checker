const Queue = require('./lib/queue');
const Parser = require('./lib/parser');

module.exports = {
  ...Queue,
  ...Parser
};