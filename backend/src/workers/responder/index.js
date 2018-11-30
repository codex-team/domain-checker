const path = require('path');
const env = require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') }).parsed;
const {
  Worker, WorkerError
} = require('../lib/worker');

/**
 * Worker responsible for sending results to WebSocket route. Pushes result to results queue.
 * @class ResponderWorker
 * @extends {Worker}
 */
class ResponderWorker extends Worker {
  /**
   * Creates an instance of ResponderWorker.
   */
  constructor() {
    super('responder');
  }

  /**
   * Respond to
   * @param {string} id Task id
   * @param {Object} status Zone status
   * @param {boolean} status.available True if zone available, else false
   * @param {string} status.tld Tld
   */
  async respond(id, status) {
    try {
      this.pushTask(env.QUEUE_RESULTS_PREFIX + id, {
        available: status.available,
        tld: status.tld
      });
    } catch (e) {
      throw new WorkerError('Error while pushing response to queue');
    }
  }

  /**
   * Process tasks
   * @param {Object} task Worker task
   * @param {string} task.id Task id
   * @param {boolean} task.available Availability status true/false
   * @param {string} task.tld Zone
   */
  async handle(task) {
    try {
      await this.respond(task.id, {
        available: task.available,
        tld: task.tld
      });
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }
}

new ResponderWorker().start();
