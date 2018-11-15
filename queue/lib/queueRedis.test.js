const Redis = require('ioredis');
const { QueueFactory } = require('../');

// Url to redis databse with user,password,host and port
const REDIS_URL = 'redis://127.0.0.1:6379';
// Name of testing queue
const QUEUE_NAME = 'queue:test';
// Timeout for queue
const QUEUE_TIMEOUT = 30;
// Redis config for queue
const QUEUE_REDIS_CONFIG = {
  host: '127.0.0.1',
  port: 6379,
  password: null
};

describe('RedisQueue', () => {
  // Database connection
  let db;
  // Test message
  const message = {
    type: 'test',
    args: ['test', 'io']
  };
  // Queue
  let queue;

  // Create redis connection and queue
  beforeAll(() => {
    db = new Redis(REDIS_URL);
    queue = QueueFactory.create('redis', {
      queueName: QUEUE_NAME,
      timeput: QUEUE_TIMEOUT,
      redisConfig: QUEUE_REDIS_CONFIG
    });
  });

  // Close all connections
  afterAll(() => {
    db.quit();
    queue.quit();
  });

  // Send message via queue and check it via another connection
  it('should send a message to queue', async () => {
    try {
      // Send message via queue
      await queue.push(message);
      // Receive it via plain connection
      const response = await db.lindex(QUEUE_NAME, 0);

      expect(JSON.parse(response)).toEqual(message);
    } catch (e) {
      console.error(e);
      return e;
    }
  });

  // Pop created message from Redis queue
  it('should receive a message from the queue', async () => {
    try {
      const received = await queue.pop();

      expect(received).toEqual(message);
    } catch (e) {
      console.error(e);
      return e;
    }
  });
});
