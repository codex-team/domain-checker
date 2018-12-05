const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const fs = require('fs');
const {
  Worker, WorkerError
} = require('../lib/worker');

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
    const { length: tldsLen } = tlds;

    for (let i = 0; i < tldsLen; i = i + +process.env.ZONECHECK_PUSH_TLDS_SIZE) {
      this.pushTask('dns', {
        domain: task.domain,
        tlds: tlds.slice(i, i + +process.env.ZONECHECK_PUSH_TLDS_SIZE),
        id: task.id
      }).catch(err => {
        throw new WorkerError(err);
      });
    }
  }
}

new ZoneCheckWorker().start();
