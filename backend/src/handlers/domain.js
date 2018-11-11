const uuid = require('uuid/v4');
const { RedisQueue } = require('task-queue');

/**
 * @const {string} Config for Queue and RedisClient
 */
const QUEUE_WHOIS_NAME = 'queue:whois';

/**
 * @const {string} Task type
 */
const TASK_TYPE = 'whois';

/**
 * @const {RegEx} Domain validation regexp
 */
const DOMAIN_REGEX = /[a-zA-Z0-9-]+/;

const domainHandler = async (req, res) => {
  const { domain } = req.params;
  const { redisClient } = req;

  try {
    // Check if valid domain
    if (!domain.test(DOMAIN_REGEX)) {
      res.status(400).send('Invalid domain');
    }
    // Generate unique id for request
    const randId = uuid();

    // Create a queue where we put tasks
    const queueFormer = new RedisQueue({
      queueName: QUEUE_WHOIS_NAME,
      redisClient: redisClient
    });

    // Put task
    await queueFormer.put({
      type: TASK_TYPE,
      args: [ domain ],
      id: randId
    });

    res.status(200).send(randId);
  } catch (e) {
    console.error(e.error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = domainHandler;
