const path = require('path');
const axios = require('axios');

require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const { Registry } = require('./registry');

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
  let registry;

  // Create redis connection and registry
  beforeAll(() => {
    registry = new Registry();
  });

  it('should push task to worker', async () => {
    try {
      // Send message via queue
      await registry.pushTask(workerName, task);
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
      const received = await registry.popTask(workerName);

      expect(received).toEqual({ task });
    } catch (e) {
      throw e;
    }
  });
});
