// const { Registry } = require('../workers/lib/registry');
const { Worker } = require('../workers/lib/worker');

let worker;

const getWorker = () => {
  if (!worker) {
    worker = new Worker('backend');
  }
  return worker;
};

module.exports = getWorker();
