const { Worker } = require('worker');
const { checkDomain } = require('../utils/checkDomain');
const registry = require('../helpers/registry');

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
    super('whois', registry);
  }

  /**
   * Process tasks
   * @param {Object} task Format: {
   *    id,
   *    domain,
   *    tld
   * }
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
