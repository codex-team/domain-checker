/**
 * Route which sends domain lookup results to user using WebSocket.
 *
 *  Client          Express
 *    |  -> id        | Checks id
 *    |    tld  <-    | Send results one by one for each tld in a list
 *    |    ...        |
 *    | closes socket |
 */

const { RedisQueue } = require('task-queue');

/**
 * @const {string} Workers' results queue prefix.
 */
const QUEUE_RESULTS_PREFIX = 'queue_results:';

/**
 * @const {number} Queue timeout for blocking Redis client commands in seconds.
 *                 Example: BRPOP(key, timeout) returns null if coudn't pop in a timeout period.
 */
const QUEUE_TIMEOUT = 3;

/**
 * @const {string} Redis valuable which contains current number of tlds available to query.
 *                 Server will count number of responses sent to client and exit if reached this constant.
 */
const REDIS_TLDCOUNT = 'tldCount';

/**
 * @const {string} Redis set which contains current tasks' ids,
 *                       so backend can check if task exists even before
 *                       first response from worker being put in responses queue
 */
const REDIS_SET_TASK_IDS = 'ids';

/**
 * @const {number} WebSocket close code when no errors occurred
 */
const WS_CLOSE_OK = 1000;

/**
 * @const {number} WebSocket close code when error cause by invalid id
 */
const WS_CLOSE_INVALID_ID = 1008;

/**
 * @const {number} WebSocket close code when server error other that errors above occurred
 */
const WS_CLOSE_SERVER_ERROR = 1011;

const wsRoute = async (ws, req) => {
  const { id } = req.params;
  let { redisClient } = req;

  ws.on('open', async () => {
    try {
      if (id.length === 36 && (await redisClient.smember(REDIS_SET_TASK_IDS, id))) {
        ws.send('OK');

        // Get tld count from database
        const tldCount = +(await redisClient.get(REDIS_TLDCOUNT));

        const queueResponse = new RedisQueue({
          queueName: QUEUE_RESULTS_PREFIX + id,
          timeout: QUEUE_TIMEOUT,
          redisClient
        });

        for (let i = 0; i < tldCount; i++) {
          const status = await queueResponse.pop();

          if (status.available === true) {
            ws.send(status.tld);
          } else {
            // If received null in timeout task is done, break out of loop and close websocket
            break;
          }
        }

        ws.close(WS_CLOSE_OK);
      } else {
        ws.close(WS_CLOSE_INVALID_ID);
      }
    } catch (e) {
      ws.close(WS_CLOSE_SERVER_ERROR);
      console.error(e);
    }

    try {
      // Tell db we're done with current task by removing it from set of active tasks
      await redisClient.srem(REDIS_SET_TASK_IDS, id);
    } catch (e) {
      console.error(`Can't tell database we are done with current task ${id}`);
      console.error(e);
    }
  });
};

module.exports = wsRoute;
