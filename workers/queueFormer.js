const fs = require('fs');
const Redis = require('ioredis');
const { RedisQueue } = require('task-queue');
const dowanloadTlds = require('./utils/downloadTld');

/**
 * @const {string} Redis database url with params.
 */
const REDIS_URL = 'redis://127.0.0.1:6379';

/**
 * @const {string} Queue name responsible for worker tasks
 */
const QUEUE_WHOIS_NAME = 'queue:whois';

/**
 * @constant {string} Queue name from which this script will pop task
 *                    to form new ones for workers
 */
const QUEUE_TASKS_NAME = 'tasks:whois';

/**
 * @const {number} Queue timeout for some Redis client commands
 */
const QUEUE_TIMEOUT = 3;

/**
 * @const {string} Path to file where tlds are stored
 */
const TLD_FILE = `${__dirname}/tlds.json`;

/**
 * @const {string} Redis valuable which contains current number of tlds available to query.
 */
const REDIS_TLD_COUNT = 'tldCount';

/**
 * @const {number} TLD list update time in seconds
 */
const TLD_UPDATE_TIME = 1000 * 60 * 15;

/**
 * @const {string} Redis set key which contains current tasks' ids.
 */
const REDIS_ID_SET = 'ids';

// load tlds
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

    // Add id to set, so backend know that we formed taskes
    await redisClient.sadd(REDIS_ID_SET, id);
  } catch (err) {
    throw err;
  }
};

/**
 * Updates tld list and saves it to file
 * @param {string} tldFile File path for saving file
 * @return {String[]} Array of tlds
 */
const updateTldList = async tldFile => {
  tlds = await dowanloadTlds(tldFile);
  // Sort by length
  tlds.sort((a, b) => a.length - b.length);
  // Save to file
  fs.writeFile(tldFile, JSON.stringify(tlds), () => console.log('Done writing'));
  return tlds;
};

/**
 * @const {Object} Functions to be called when popped a task.
 */
const CALLBACKS = {
  whois: formWhoisTask
};

/**
 * @const {Redis} Redis client. Only one to make less connections.
 */
const client = new Redis(REDIS_URL);

/**
 * @type {RedisQueue} Tasks pop queue.
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
