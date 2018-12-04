const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const { Worker } = require('../lib/worker');
const { checkDomain } = require('./checkDomain');

/**
 * Worker responsible for querying dns to check domain availability.
 * @class DnsWorker
 * @extends {Worker}
 */
class DnsWorker extends Worker {
  /**
   * Creates an instance of DnsWorker.
   */
  constructor() {
    super('dns');
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

      if (available) {
        await this.pushTask('responder', {
          id: task.id,
          tld: task.tld,
          available
        });
      } else {
        await this.pushTask('whois', {
          domain: task.domain,
          tld: task.tld,
          id: task.id
        });
      }
    } catch (e) {
      console.error(e);
    }
  }
}

new DnsWorker().start();
