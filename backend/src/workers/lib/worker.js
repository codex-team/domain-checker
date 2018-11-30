const axios = require('axios');

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
 * @property {string} registryUrl Registry API url, taken from env.REGISTRY_API_URL. E.g. http://registry.com/api
 * @property {string} popTaskUrl URL of Registry API's popTask method
 * @property {string} pushTask URL of Registry API's pushTask method
 */
class Worker {
  /**
   *Creates an instance of Worker.
   * @param {string} name Worker name
   */
  constructor(name) {
    this.name = name;

    this.registryApiUrl = process.env.REGISTRY_API_URL;
    this.popTaskUrl = this.registryApiUrl + '/popTask/';
    this.pushTaskUrl = this.registryApiUrl + '/pushTask/';
  }

  /**
   * Task handler. Main logic of your worker.
   * @param {any} task Task payload
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
        process.exit(1);
      }
    }
  }

  /**
   * Pop task from worker's queue
   * @param {string} workerName Name of worker
   * @returns {Object} Task from registry
   */
  async popTask(workerName) {
    let resp;

    try {
      resp = await axios.get(this.popTaskUrl + workerName, { responseType: 'json' });
    } catch (e) {
      resp = e.response;
    }

    if (resp.status >= 500) {
      throw new WorkerError('Registry API error');
    }
    if (resp.status == 202) {
      return null;
    }

    return resp.data.task;
  }

  /**
   * Push task to another worker
   * @param {string} workerName Name of worker
   * @param {any} payload Task
   */
  async pushTask(workerName, payload) {
    let resp;

    try {
      resp = await axios.put(this.pushTaskUrl + workerName, payload);
    } catch (e) {
      throw new WorkerError(e);
    }

    if (resp.status === 500) {
      throw new WorkerError("Can't push task to registry");
    }
  }
}

module.exports = {
  WorkerError,
  Worker
};
