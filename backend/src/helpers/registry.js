const { Registry } = require('../workers/lib/registry');

let registry;

const getRegistry = () => {
  if (!registry) {
    registry = new Registry();
  }
  return registry;
};

module.exports = getRegistry();
