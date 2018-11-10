const Redis = require('ioredis');
const {
  RedisQueue
} = require('task-queue');
const {
  checkDomain
} = require('./utils/checker');

/**
 * Config for Queue and RedisClient.
 */
const REDIS_URL = 'redis://127.0.0.1:6379';
const QUEUE_RESPONSE_PREFIX = 'queue_response:';
const QUEUE_WHOIS_NAME = 'queue:whois';
const QUEUE_TIMEOUT = 3;

/**
 * Callback for `whois` msg type.
 * @param {string} name Domain name.
 * @param {string} tld TLD.
 * @param {string} id Unique request id.
 * @param {RedisClient} redisClient Redis client.
 * @returns {void}
 */
const whoisCallback = async (name, tld, id, redisClient) => {
  let result = {};
  let queueResponse = new RedisQueue({
    queueName: QUEUE_RESPONSE_PREFIX + id,
    timeout: QUEUE_TIMEOUT,
    redisClient
  });

  try {
    const available = await checkDomain(name, tld);

    result = {
      tld,
      available
    };
  } catch (err) {
    result = {
      tld,
      error: err.toString()
    };
  }

  await queueResponse.put(result);
};

/**
 * Functions to be called when received msg.
 */
const CALLBACKS = {
  'whois': whoisCallback
};

/**
 * Redis client. Only one to make less connections.
 */
const client = new Redis(REDIS_URL);

/**
 * Message receive queue.
 */
let queueWhois = new RedisQueue({
  queueName: QUEUE_WHOIS_NAME,
  timeout: QUEUE_TIMEOUT,
  redisClient: client
});

/**
 * Main worker loop.
 * @returns {void}
 */
const main = async () => {
  while (true) {
    try {
      const msg = await queueWhois.pop();

      if (!msg) {
        continue;
      }

      console.log(`Got task ${JSON.stringify(msg, null, 2)}\n`);

      CALLBACKS[msg.type](...msg.args, msg.id, client);
    } catch (err) {
      console.error(err);
    }
  }
};

main();