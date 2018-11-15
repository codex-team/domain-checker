const path = require('path');
const env = require('dotenv').config({ path: path.resolve(__dirname, '../../.env') }).parsed;
const Redis = require('ioredis');

let brokerClient;

const getBrokerClient = () => {
  if (!brokerClient) {
    if (env.BROKER === 'redis') {
      brokerClient = new Redis(env.REDIS_URL);
    }
  }
  return brokerClient;
};

module.exports = getBrokerClient();
