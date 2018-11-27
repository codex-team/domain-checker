/**
 * Route which sends domain lookup results to user using WebSocket.
 *
 *  Client          Express
 *    |  -> id        | Checks id
 *    |    tld  <-    | Send results one by one for each tld in a list
 *    |    ...        |
 *    | closes socket |
 */

const debug = require('debug')('wsHandler');
const path = require('path');
const env = require('dotenv').config({ path: path.resolve(__dirname, '../../.env') }).parsed;
const registry = require('../helpers/registry');

/**
 * @const {number} Channel id length. Used to check user provided channel id in route.
 */
const CHANNEL_ID_LENGTH = 36;

/**
 * Websockets can close connection with one of these codes
 */
const statusCodes = {
  OK: 1000,
  INVALID_ID: 1008,
  SERVER_ERROR: 1011,
  TIMEOUT: 3001
};

// Gets responses from workers via queue and pushes them to client via WebSocket
const wsRoute = async (ws, req) => {
  const { id } = req.params;

  try {
    if (id.length === CHANNEL_ID_LENGTH) {
      let sent = false;

      let status;

      while ((status = await registry.popTask(env.QUEUE_RESULTS_PREFIX + id))) {
        // Workers response format: {
        //  available: true || false,
        //  tld
        // }

        status = status.task;

        debug(status);

        if (status.available) {
          ws.send(status.tld);
          sent = true;
        }
      }

      if (sent) {
        console.log(`Closing ${id}`);
        ws.close(statusCodes.OK);
      } else {
        console.log(`Timeout reached ${id}`);
        ws.close(statusCodes.TIMEOUT);
      }
    } else {
      console.log(`Invalid id ${id}`);
      ws.close(statusCodes.INVALID_ID);
    }
  } catch (e) {
    ws.close(statusCodes.SERVER_ERROR);
    console.error(e);
  }
};

module.exports = wsRoute;
