const Registry = require('./lib/registry');
const Worker = require('./lib/worker');

module.exports = {
  ...Registry,
  ...Worker
};
