const path = require('path');
const { Worker } = require('../lib/worker');
const { QueueFactory } = require('queue');
const broker = require('../../helpers/broker');
const env = require('dotenv').config({ path: path.resolve(__dirname, '../../.env') }).parsed;

/**
 * @const {number} Queue cleaner run interval in milliseconds
 */
const CLEAN_TIMEOUT = 5 * 60 * 1000;

/**
 * Worker responsible for sending results to WebSocket route. Pushes result to results queue.
 * @class ResponderWorker
 * @extends {Worker}
 * @property {Object} queues Map of queues {id: Queue}
 * @property {Object} _timestams Map of queues' creation time {id: timestamp<number>}
 */
class ResponderWorker extends Worker {
  /**
   * Creates an instance of ResponderWorker.
   */
  constructor() {
    super('responder');
    this.queueConfig = {
      timeout: env.QUEUE_TIMEOUT,
      dbClient: broker
    };
    this.queues = {};
    this._timestams = {};

    // Set up unused queues cleaner
    setInterval(this.cleanQueues, CLEAN_TIMEOUT);
  }

  /**
   * Removes unused queue. Every CLEAN_TIMEOUT time loops over queues
   * and deletes queue if it was created more than CLEAN_TIMEOUT time ago.
   */
  cleanQueues() {
    Object.entries(this._timestams).forEach(([id, timestamp]) => {
      if (Date.now() - timestamp > CLEAN_TIMEOUT) {
        delete this.queues[id];
        delete this._timestams[id];
      }
    });
  }

  /**
   * Respond to
   * @param {string} id Task id
   * @param {Object} status Zone status
   * @param {boolean} status.available True if zone available, else false
   * @param {string} status.tld Tld
   */
  async respond(id, status) {
    if (!this.queues[id]) {
      this.queues[id] = QueueFactory.create(env.BROKER, {
        queueName: env.QUEUE_RESULTS_PREFIX + id,
        ...this.queueConfig
      });
      this._timestams[id] = Date.now();
      console.log(`Created queue for ${id}`);
      console.log(`Queues number: ${Object.keys(this.queues).length}`);
    }

    await this.queues[id].push({
      available: status.available,
      tld: status.tld
    });
  }

  /**
   * Process tasks
   * @param {Object} task Worker task
   * @param {string} task.id Task id
   * @param {boolean} task.available Availability status true/false
   * @param {string} task.tld Zone
   */
  async handle(task) {
    await this.respond(task.id, {
      available: task.available,
      tld: task.tld
    });
  }
}

module.exports = ResponderWorker;