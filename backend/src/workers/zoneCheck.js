const fs = require('fs');
const { Worker } = require('worker');
const registry = require('../helpers/registry');

/**
 * @const {string} Path to file where tlds are stored
 */
const TLD_FILE = `${__dirname}/tlds.json`;

// load tlds
let tlds = JSON.parse(fs.readFileSync(TLD_FILE, 'utf-8'));

/**
 * Worker responsible for pushing `whois` tasks.
 * After receiving a task, for each tld generates and pushes task to `whois` worker.
 * @class ZoneCheckWorker
 * @extends {Worker}
 */
class ZoneCheckWorker extends Worker {
  /**
   * Creates an instance of ZoneCheckerWorker.
   */
  constructor() {
    super('zoneCheck', registry);
  }

  /**
   * Process tasks
   * @param {any} task Format: {
   *    id,
   *    domain
   * }
   */
  async handle(task) {
    await Promise.all(
      tlds.map(async tld => {
        this.pushTask('whois', {
          domain: task.domain,
          tld: tld,
          id: task.id
        });
      })
    );
  }
}

module.exports = ZoneCheckWorker;
