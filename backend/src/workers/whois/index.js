const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const { Worker } = require('../lib/worker');
const { checkDomain } = require('./checkDomain');

/**
 * Worker responsible for quering whois to check domain availability.
 * @class WhoisWorker
 * @extends {Worker}
 */
class WhoisWorker extends Worker {
  /**
   * Creates an instance of WhoisWorker.
   */
  constructor() {
    super('whois');
  }

  /**
   * Process tasks
   * @param {Object} task Worker task
   * @param {string} task.id Task id
   * @param {string} task.domain Domain name
   * @param {string} task.tld Tld
   */
  async handle(task) {
    try {
      const available = await checkDomain(task.domain, task.tld);

      await this.pushTask('responder', {
        id: task.id,
        tld: task.tld,
        available
      });
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }
}

new WhoisWorker().start();
