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
   * Query DNS servers for domain. If no A and AAAA record is present pushes task to whois worker.
   * @param {string} domain Base domain name w/o TLD.
   * @param {string} tld TLD.
   * @param {string} id Task id.
   * @memberof DnsWorker
   */
  async query(domain, tld, id) {
    try {
      const available = await checkDomain(domain, tld);

      console.log(`Resolved ${domain}.${tld}`);

      // If DNS query is empty, push to whois worker
      if (available) {
        await this.pushTask('whois', {
          domain,
          tld,
          id
        });
      } else {
        await this.pushTask('responder', {
          id,
          tld,
          available
        });
      }
    } catch (e) {
      throw new WorkerError(e);
    }
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
        await this.query(task.domain, tld, task.id);
      });
    }
  }
}

new DnsWorker().start();
