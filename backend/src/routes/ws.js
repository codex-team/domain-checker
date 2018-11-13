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
const QUEUE_RESULTS_PREFIX = process.env.QUEUE_RESULTS_PREFIX || 'queue_results:';

/**
 * @const {number} Queue timeout for blocking Redis client commands in seconds.
 *                 Example: BRPOP(key, timeout) returns null if coudn't pop in a timeout period.
 */
const QUEUE_TIMEOUT = +process.env.QUEUE_TIMEOUT || 10;

/**
 * @const {number} WebSocket close code when no errors occurred
 */
const WS_CLOSE_OK = +process.env.WS_CLOSE_OK || 1000;

/**
 * @const {number} WebSocket close code when error cause by invalid id
 */
const WS_CLOSE_INVALID_ID = +process.env.WS_CLOSE_INVALID_ID || 1008;

/**
 * @const {number} WebSocket close code when server error other that errors above occurred
 */
const WS_CLOSE_SERVER_ERROR = +process.env.WS_CLOSE_SERVER_ERROR || 1011;

/**
 * @const {number} WebSocket close code when within timeout no results from worker has been received
 */
const WS_CLOSE_TIMEOUT = +process.env.WS_CLOSE_TIMEOUT || 3001;

const wsRoute = async (ws, req) => {
  const { id } = req.params;
  let { redisClient } = req;

  try {
    if (id.length === 36) {
      let sent = false;

      ws.send('OK');

      const queueResponse = new RedisQueue({
        queueName: QUEUE_RESULTS_PREFIX + id,
        timeout: QUEUE_TIMEOUT,
        redisClient
      });

      let status;

      while ((status = await queueResponse.pop())) {
        if (status.available) {
          ws.send(status.tld);
          sent = true;
        }
      }

      if (sent) {
        console.log(`Closing ${id}`);
        ws.close(WS_CLOSE_OK);
      } else {
        console.log(`Timeout reached ${id}`);
        ws.close(WS_CLOSE_TIMEOUT);
      }
    } else {
      console.log(`Invalid id ${id}`);
      ws.close(WS_CLOSE_INVALID_ID);
    }
  } catch (e) {
    ws.close(WS_CLOSE_SERVER_ERROR);
    console.error(e);
  }
};

module.exports = wsRoute;
