/**
 * Main route which puts user domain lookup requests to task queue
 *
 *  Client             Express                                         Queue
 *    |  -> domain        | Checks domain, generates task id             |
 *    |       id <-       | and puts task to queue            -> task    |
 */

const path = require('path');
const uuid = require('uuid/v4');
const env = require('dotenv').config({ path: path.resolve(__dirname, '../../.env') }).parsed;
const registry = require('../helpers/registry');

// Generates random id for user request and pushes tasks to zoneCheck worker
const domainRoute = async (req, res) => {
  const { domain } = req.params;

  try {
    // Generate unique id for request
    const answersSocketId = uuid();

    registry.pushTask('zoneCheck', {
      domain,
      id: answersSocketId
    });

    res.status(200).json({
      sucess: 1,
      data: {
        channelId: answersSocketId
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = domainRoute;
