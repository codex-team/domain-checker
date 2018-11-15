const { Registry } = require('worker');

let registry;

const getRegistry = () => {
  if (!registry) {
    registry = new Registry();
  }
  return registry;
};

module.exports = getRegistry();
