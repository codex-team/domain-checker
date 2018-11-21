const axios = require('axios');

/**
 * Registry error.
 * @extends {Error}
 */
class RegistryError extends Error {}

/**
 * Registry. Used to manage worker tasks.
 * Put tasks by calling `Registry.putTask(workerName, payload)`.
 * Pop tasks by calling `Registry.popTask(workerName)`.
 * @property {string} registryUrl Registry API url, taken from env.REGISTRY_API_URL. E.g. http://registry.com/api
 * @property {string} popTaskUrl URL of Registry API's popTask method
 * @property {string} pushTask URL of Registry API's pushTask method
 */
class Registry {
  /**
   * Creates an instance of Registry.
   * Gets `BROKER` env var to create broker connection.
   */
  constructor() {
    this.registryApiUrl = process.env.REGISTRY_API_URL;
    this.popTaskUrl = this.registryApiUrl + '/popTask/';
    this.pushTaskUrl = this.registryApiUrl + '/pushTask/';
  }

  /**
   * Pop task from worker's queue
   * @param {string} workerName Name of worker
   * @returns {Object} Task from registry
   */
  async popTask(workerName) {
    const resp = await axios.get(this.popTaskUrl + workerName, { responseType: 'json' });

    if (resp.status == 505) {
      throw new RegistryError('Registry server error');
    }
    if (resp.status == 202) {
      return null;
    }

    return resp.data;
  }

  /**
   * Push task to registry
   * @param {string} workerName Name of worker
   * @param {any} payload Task
   */
  async pushTask(workerName, payload) {
    const resp = await axios.put(this.pushTaskUrl + workerName, payload);

    if (resp.status === 500) {
      throw new RegistryError("Can't push task to registry");
    }
  }
}

module.exports = {
  Registry,
  RegistryError
};
