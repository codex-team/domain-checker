const fs = require('fs');
const { Worker } = require('worker');

/**
 * @const {string} Path to file where tlds are stored
 */
const TLD_FILE = `${__dirname}/tlds.json`;

// load tlds
let tlds = JSON.parse(fs.readFileSync(TLD_FILE, 'utf-8'));

/**
 * Worker for zoneCheck task
 * @class ZoneCheckWorker
 * @extends {Worker}
 */
class ZoneCheckWorker extends Worker {
  /**
   *Creates an instance of ZoneCheckerWorker.
   * @param {string} broker Broker name. E.g. 'redis'
   * @param {Obejct} queueConfig Queue config passed to new Queue(queueConfig)
   * @param {Obejct | string} [dbConfig] Database/broker connection config.
   */
  constructor({
    broker, queueConfig, dbConfig = null
  }) {
    super('zoneCheck', {
      broker, queueConfig, dbConfig
    });
  }

  /**
   * Process tasks
   * @param {any} task
   */
  async handle(task) {
    await Promise.all(
      tlds.map(async tld => {
        this.registry.pushTask('whois', {
          domain: task.domain,
          tld: task.tld,
          id: task.id
        });
      })
    );
  }
}

module.exports = ZoneCheckWorker;
