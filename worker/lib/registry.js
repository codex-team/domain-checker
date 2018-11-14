const Redis = require('ioredis');
const { QueueFactory } = require('queue');

/**
 * Registry. Used to manage worker tasks.
 * Put tasks by calling `Registry.putTask(workerName, payload)`.
 * Pop tasks by calling `Registry.popTask(workerName)`.
 * @property {broker} broker Broker name
 * @property {Object} queueConfig Queue config which is passed to QueueFactory.create(broker, queueConfig)
 * @property {any} dbClient Database/broker connection client. Passed to Queue to reuse existent connection
 */
class Registry {
  /**
   *Creates an instance of Registry.
   * @param {string} broker Broker name. E.g. 'redis'
   * @param {Obejct} queueConfig Queue config passed to new Queue(queueConfig)
   * @param {Obejct | string} [dbConfig] Database/broker connection config.
   */
  constructor({ broker, queueConfig, dbConfig = null }) {
    this.broker = broker;
    this.queueConfig = queueConfig;

    if (broker === 'redis') {
      if (!queueConfig.dbClient) {
        this.dbClient = new Redis(dbConfig);
        this.queueConfig.dbClient = this.dbClient;
      } else {
        this.dbClient = queueConfig.redisClient;
      }
    }
  }

  /**
   * Pop task from registry
   * @param {string} workerName Name of worker
   * @returns {Object} Task from registry
   */
  async popTask(workerName) {
    const queue = QueueFactory.create(this.broker, { ...this.queueConfig, queueName: workerName });
    const task = await queue.pop();

    return task;
  }

  /**
   * Push task to registry
   * @param {string} workerName Name of worker
   * @param {any} payload Task
   */
  async pushTask(workerName, payload) {
    const queue = QueueFactory.create(this.broker, { ...this.queueConfig, queueName: workerName });

    await queue.push(payload);
  }
}

module.exports = {
  Registry
};
