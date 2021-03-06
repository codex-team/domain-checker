const path = require('path');
const axios = require('axios');

require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const { Worker } = require('./worker');

/**
 * @const {string} Registry API url
 */
const REGISTRY_API_URL = process.env.REGISTRY_API_URL;

describe('Registry', () => {
  // Test task
  const task = {
    type: 'test',
    args: ['test', 'io']
  };

  // Test worker name
  const workerName = 'test';

  // Registry
  let worker;

  // Create redis connection and registry
  beforeAll(() => {
    worker = new Worker(workerName);
  });

  it('should push task to worker', async () => {
    try {
      // Send message via queue
      await worker.pushTask(workerName, task);
      // Receive it via http request
      const response = await axios.get(REGISTRY_API_URL + '/popTask/' + workerName, { responseType: 'json' });

      expect(response.data).toEqual({ task });
    } catch (e) {
      throw e;
    }
  });

  it('should pop task for worker', async () => {
    try {
      // Push task first via http request
      await axios.put(REGISTRY_API_URL + '/pushTask/' + workerName, task);

      // Pop task from registry
      const received = await worker.popTask(workerName);

      expect(received).toEqual({ task });
    } catch (e) {
      throw e;
    }
  });

  it('should return null when popping from empty task queue', async () => {
    // Set big timeout so Jest won't exit
    jest.setTimeout(40000);

    try {
      // Pop task from empty task queue
      const received = await worker.popTask('nonexistantworker');

      expect(received).toEqual(null);
    } catch (e) {
      throw e;
    }
  });
});
