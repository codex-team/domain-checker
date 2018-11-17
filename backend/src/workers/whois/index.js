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
    const available = await checkDomain(task.domain, task.tld);

    await this.registry.pushTask('responder', {
      id: task.id,
      tld: task.tld,
      available
    });
  }
}

module.exports = WhoisWorker;