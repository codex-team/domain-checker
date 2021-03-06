const axios = require('axios');
const PQueue = require('p-queue');

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
 * @property {PQueue} promiseQueue Concurrency limiting promise queue for task handling
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

    this.promiseQueue = new PQueue({ concurrency: +process.env.TASKS_CONCURRENT_MAX });
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
    /**
     * Async sleep function.
     * Used to sleep when there are more pending tasks than set maximum, so that queue could free.
     * @param {number} ms Sleep time in ms
     */
    const sleep = ms => {
      return new Promise(resolve => setTimeout(resolve, ms));
    };

    console.log(`Worker ${this.name} started`);

    while (true) {
      try {
        if (this.promiseQueue.pending >= +process.env.TASKS_CONCURRENT_MAX) {
          console.log("Too many pending tasks, don't taking more");
          await sleep(+process.env.WORKERS_SLEEP_TIME);
          continue;
        }

        const task = await this.popTask(this.name);

        if (!task) {
          continue;
        }

        this.promiseQueue.add(async () => {
          this.handle(task);
        });
        console.log(`New task, pending ${this.promiseQueue.pending}`);
      } catch (e) {
        console.error(`Worker ${this.name} error`);
        console.error(e);
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
      if (!e.response) {
        throw new WorkerError('Undefined error on push');
      }
      resp = e.response;
    }

    if (resp.status >= 500) {
      throw new WorkerError('Registry API error');
    }
  }
}

module.exports = {
  WorkerError,
  Worker
};
