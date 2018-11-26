// const { Registry } = require('../workers/lib/registry');
const { Worker } = require('../workers/lib/worker');

let registry;

const getRegistry = () => {
  if (!registry) {
    registry = new Worker('backend');
  }
  return registry;
};

module.exports = getRegistry();
