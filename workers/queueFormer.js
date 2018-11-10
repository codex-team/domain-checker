const fs = require('fs');
const Redis = require('ioredis');
const {
  RedisQueue
} = require('task-queue');
const dowanloadTlds = require('./utils/downloadTld');

const REDIS_URL = 'redis://127.0.0.1:6379';
const QUEUE_WHOIS_NAME = 'queue:whois';
const QUEUE_TASKS_NAME = 'tasks:whois';
const QUEUE_TIMEOUT = 3;

const TLD_FILE = `${__dirname}/tlds.json`;
const REDIS_TLD_COUNT = 'tldCount';
const TLD_UPDATE_TIME = 1000 * 60 * 15;

/**
 * @type {string} Redis set key which saves available ids
 */
const REDIS_ID_SET = 'ids';

let tlds = JSON.parse(fs.readFileSync(TLD_FILE, 'utf-8'));

/**
 * Callback for `whois` task type.
 * @param {string} name Domain name.
 * @param {string} id Unique request id.
 * @param {RedisClient} redisClient Redis client.
 * @returns {void}
 */
const formWhoisTask = async (name, id, redisClient) => {
  try {
    let queueWhois = new RedisQueue({
      queueName: QUEUE_WHOIS_NAME,
      timeout: QUEUE_TIMEOUT,
      redisClient
    });

    redisClient.sadd(REDIS_ID_SET, id);

    await Promise.all(
      tlds.map(async tld => {
        try {
          await queueWhois.sendMessage({
            type: 'whois',
            args: [name, tld],
            id
          });
        } catch (e) {
          throw new Error('Error while pushing to queue');
        }
      })
    );
  } catch (err) {
    throw err;
  }
};

const updateTldList = async tldFile => {
  tlds = await dowanloadTlds(tldFile);
  tlds.sort((a, b) => a.length - b.length);
  fs.writeFile(tldFile, JSON.stringify(tlds), () => console.log('Done writing'));
  return tlds;
};

/**
 * Functions to be called when received msg.
 */
const CALLBACKS = {
  whois: formWhoisTask
};

/**
 * Redis client. Only one to make less connections.
 */
const client = new Redis(REDIS_URL);

/**
 * Message receive queue.
 */
let queueTasks = new RedisQueue({
  queueName: QUEUE_TASKS_NAME,
  timeout: QUEUE_TIMEOUT,
  redisClient: client
});

/**
 * Main worker loop.
 * @returns {void}
 */
const main = async () => {
  // Update tld list
  await setInterval(async () => {
    try {
      tlds = await updateTldList(TLD_FILE);
      await client.set(REDIS_TLD_COUNT, tlds.length);
    } catch (e) {
      console.error(e);
    }
  }, TLD_UPDATE_TIME);

  while (true) {
    try {
      const msg = await queueTasks.pop();

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