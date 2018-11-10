const {RedisQueue} = require('task-queue');

/**
 * @const {string} Response queue prefix
 */
const QUEUE_RESPONSE_PREFIX = 'queue_response:';

/**
 * @const {number} Queue timeout
 */
const QUEUE_TIMEOUT = 3;

/**
 * @type {string} Redis valuable which save current tld count
 */
const REDIS_TLDCOUNT = 'tldCount';

/**
 * @type {string} Redis set key which saves available ids
 */
const REDIS_ID_SET = 'ids';

const wsHandler = async (ws, req) => {
  const {id} = req.params;
  let {redisClient} = req;

  ws.on('open', async () => {
    try {
      if (id.length === 36 && await redisClient.smember(REDIS_ID_SET, id)) {
        ws.send('OK');

        // Get tld count from database
        const tldCount = +await redisClient.get(REDIS_TLDCOUNT);

        const queueResponse = new RedisQueue({
          queueName: QUEUE_RESPONSE_PREFIX + id,
          timeout: QUEUE_TIMEOUT,
          redisClient
        });

        // TODO: change exit condition to null pop result
        for (let i = 0; i < tldCount; i++) {
          const status = await queueResponse.pop();

          if (status.available === true) {
            ws.send(status.tld);
          }
        }

        ws.close(1000);
      } else {
        ws.close(1008);
      }
    } catch (e) {
      ws.close(1011);
      console.error(e);
    }
  });
};

module.exports = wsHandler;