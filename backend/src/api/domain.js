/**
 * Main route which puts user domain lookup requests to task queue
 *
 *  Client             Express                                                 Registry
 *    |  -> domain        | Checks domain, generates task id                     |
 *    |       id <-       | and pushes task to registry via worker    -> task    |
 */

const uuid = require('uuid/v4');
const worker = require('../helpers/worker');

// Generates random id for user request and pushes tasks to zoneCheck worker
const domainRoute = async (req, res) => {
  const { domain } = req.params;

  try {
    // Generate unique id for request
    const answersSocketId = uuid();

    worker.pushTask('zoneCheck', {
      domain,
      id: answersSocketId
    });

    res.status(200).json({
      success: 1,
      data: { channelId: answersSocketId }
    });
  } catch (e) {
    console.error(e);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = domainRoute;
