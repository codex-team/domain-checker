const uuid = require('uuid/v4');
const {RedisQueue} = require('task-queue');

// Config for Queue and RedisClient.
const QUEUE_WHOIS_NAME = 'queue:whois';

// Domain validation regexp
const DOMAIN_REGEX = /[a-zA-Z0-9-]+/;

const domainHandler = async (req, res) => {
  const {domain} = req.params;
  const {redisClient} = req;

  try {
    // Check if valid domain
    if (!domain.test(DOMAIN_REGEX)) {
      res.status(400).send('Bad Request');
    }
    // Generate unique id for request
    const randId = uuid();

    // Create a queue where we put tasks
    const queueFormer = new RedisQueue({
      queueName: QUEUE_WHOIS_NAME,
      redisClient: redisClient
    });

    queueFormer.on('error', (err) => {
      console.error(err);
      res.status(500).send('Internal Server Error');
    });

    // Put task
    await queueFormer.put({
      type: 'whois',
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