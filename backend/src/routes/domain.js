/**
 * Main route which puts user domain lookup requests to task queue
 *
 *  Client             Express                                         Queue
 *    |  -> domain        | Checks domain, generates task id             |
 *    |       id <-       | and puts task to queue            -> task    |
 */

const uuid = require('uuid/v4');
const { RedisQueue } = require('task-queue');

/**
 * @const {string} Queue name of `whois` tasks
 */
const QUEUE_WHOIS_NAME = 'tasks';

/**
 * @const {string} Task type
 */
const TASK_TYPE = 'whois';

/**
 * @const {RegEx} Domain validation regexp
 */
const DOMAIN_REGEX = /[a-zA-Z0-9-]+/;

const domainRoute = async (req, res) => {
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

module.exports = domainRoute;
