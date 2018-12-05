const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const PQueue = require('p-queue');
const {
  Worker, WorkerError
} = require('../lib/worker');
const { checkDomain } = require('./checkDomain');

/**
 * Worker responsible for querying dns to check domain availability.
 * @class DnsWorker
 * @extends {Worker}
 * @property {PQueue} dnsQueue Concurrency limiting promise queue for querying DNS servers.
 *                             Since we have many tlds in one task, we can run queries concurrently
 */
class DnsWorker extends Worker {
  /**
   * Creates an instance of DnsWorker.
   */
  constructor() {
    super('dns');
    this.dnsQueue = new PQueue({ concurrency: +process.env.TASKS_CONCURRENT_MAX });
  }

  /**
   * Process tasks
   * @param {Object} task Worker task
   * @param {string} task.id Task id
   * @param {string} task.domain Domain name
   * @param {Array<string>} task.tlds Tlds array
   */
  async handle(task) {
    console.log(task);
    for (let tld of task.tlds) {
      this.dnsQueue.add(async () => {
        try {
          const available = await checkDomain(task.domain, tld);

          console.log(`Resolved ${task.domain}.${tld}`);

          // If DNS query is empty, push to whois worker
          if (available) {
            await this.pushTask('whois', {
              domain: task.domain,
              tld,
              id: task.id
            });
          } else {
            await this.pushTask('responder', {
              id: task.id,
              tld,
              available
            });
          }
        } catch (e) {
          throw new WorkerError(e);
        }
      });
    }
  }
}

new DnsWorker().start();
