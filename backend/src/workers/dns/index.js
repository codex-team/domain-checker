const {Worker} = require('../lib/worker');
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

      await this.pushTask('responder', {
        id: task.id,
        tld: task.tld,
        available
      });
    } catch (e) {
      console.error(e);
    }
  }
}

new DnsWorker().start();
