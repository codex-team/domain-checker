const path = require('path');
const env = require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') }).parsed;
const fs = require('fs');
const { Worker } = require('../lib/worker');

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
    super('zoneCheck');
  }

  /**
   * Process tasks
   * @param {any} task Worker task
   * @param {string} task.id Task id
   * @param {string} task.domain Domain name
   */
  async handle(task) {
    try {
      await Promise.all(
        tlds.map(async tld => {
          this.pushTask('whois', {
            domain: task.domain,
            tld: tld,
            id: task.id
          });
        })
      );
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }
}

new ZoneCheckWorker().start();
