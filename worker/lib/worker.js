const { Registry } = require('./registry');

/**
 * Worker error.
 * @extends {Error}
 */
class WorkerError extends Error {}

/**
 * Base class for workers. Used to inherit from it and write your own worker.
 * Inherited worker should implement `handle` method.
 * Start worker by calling `Worker.start()`
 * @property {string} name Worker name
 * @property {Registry} registry Worker registry
 */
class Worker {
  /**
   *Creates an instance of Worker.
   * @param {string} broker Broker name. E.g. 'redis'
   * @param {Obejct} queueConfig Queue config passed to new Queue(queueConfig)
   * @param {Obejct | string} [dbConfig] Database/broker connection config.
   */
  constructor(name, { broker, queueConfig, dbConfig = null }) {
    this.name = name;
    this.registry = new Registry({ broker, queueConfig, dbConfig });
  }

  /**
   * Task handler. Main logic of your worker.
   * @param {any} Task
   */
  async handle(task) {}

  /**
   * Start tasks processing
   */
  async start() {
    while (true) {
      try {
        const task = await this.registry.popTask(this.name);

        if (!task) {
          continue;
        }

        await this.handle(task);
      } catch (e) {
        throw new WorkerError(e);
      }
    }
  }
}

module.exports = {
  WorkerError,
  Worker
};
