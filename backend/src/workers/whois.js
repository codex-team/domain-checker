const { Worker } = require('worker');
const { checkDomain } = require('../utils/checkDomain');

/**
 * Worker for whois task
 * @class WhoisWorker
 * @extends {Worker}
 */
class WhoisWorker extends Worker {
  /**
   *Creates an instance of WhoisWorker.
   * @param {string} broker Broker name. E.g. 'redis'
   * @param {Obejct} queueConfig Queue config passed to new Queue(queueConfig)
   * @param {Obejct | string} [dbConfig] Database/broker connection config.
   */
  constructor({
    broker, queueConfig, dbConfig = null
  }) {
    super('whois', {
      broker, queueConfig, dbConfig
    });
  }

  /**
   * Process tasks
   * @param {any} task
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
