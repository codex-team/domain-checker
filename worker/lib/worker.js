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
  constructor(name) {
    this.name = name;
    this.registry = new Registry();
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
    console.log(`Worker ${this.name} started`);
    while (true) {
      try {
        const task = await this.popTask(this.name);

        if (!task) {
          continue;
        }

        await this.handle(task);
      } catch (e) {
        console.error(`Worker ${this.name} error`);
        console.error(e);
        throw new WorkerError(e);
      }
    }
  }

  /**
   * Pop task from worker's queue
   * @param {string} workerName Name of worker
   * @returns {Object} Task from registry
   */
  async popTask(workerName) {
    const task = await this.registry.popTask(workerName);

    return task;
  }

  /**
   * Push task to another worker
   * @param {string} workerName Name of worker
   * @param {any} payload Task
   */
  async pushTask(workerName, payload) {
    await this.registry.push(workerName, payload);
  }
}

module.exports = {
  WorkerError,
  Worker
};
