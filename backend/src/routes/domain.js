/**
 * Main route which puts user domain lookup requests to task queue
 *
 *  Client             Express                                         Queue
 *    |  -> domain        | Checks domain, generates task id             |
 *    |       id <-       | and puts task to queue            -> task    |
 */

const uuid = require('uuid/v4');
const { QueueFactory } = require('queue');

/**
 * @const {string} Tasks queue name
 */
const QUEUE_TASKS_NAME = process.env.QUEUE_TASKS_NAME || 'tasks';

/**
 * @const {string} Task type
 */
const TASK_WHOIS = process.env.TASK_WHOIS || 'whois';

/**
 * @const {RegEx} Domain validation regexp
 */
const DOMAIN_REGEXP = new RegExp(process.env.DOMAIN_REGEXP) || /[a-zA-Z0-9-]+/;

const domainRoute = async (req, res) => {
  const { domain } = req.params;
  const { redisClient } = req;

  try {
    // Check if valid domain
    if (!DOMAIN_REGEXP.test(domain)) {
      res.status(400).send('Invalid domain');
    }
    // Generate unique id for request
    const randId = uuid();

    // Create a queue where we put tasks
    const queueFormer = QueueFactory.create('redis', {
      queueName: QUEUE_TASKS_NAME,
      redisClient: redisClient
    });

    console.log(queueFormer);

    // Put task
    await queueFormer.push({
      type: TASK_WHOIS,
      args: [ domain ],
      id: randId
    });

    res.status(200).send(randId);
  } catch (e) {
    console.error(e);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = domainRoute;
