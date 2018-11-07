const Redis = require('ioredis');
const {
  RedisQueue,
  JsonParser,
  ParserError
} = require('./queue');

const REDIS_URL = 'redis://127.0.0.1:6379';
const QUEUE_NAME = 'test';
const QUEUE_TIMEOUT = 30;
const QUEUE_PREFIX = 'queue:';
const QUEUE_REDIS_CONFIG = {
  host: '127.0.0.1',
  port: 6379,
  password: null
};

describe('RedisQueue', () => {
  let db;
  const message = {
    type: 'test',
    args: [
      'test',
      'io'
    ]
  };
  let queue;

  beforeAll(() => {
    db = new Redis(REDIS_URL);
    queue = new RedisQueue({
      queueName: QUEUE_NAME,
      prefix: QUEUE_PREFIX,
      timeput: QUEUE_TIMEOUT,
      redisConfig: QUEUE_REDIS_CONFIG
    });
  });

  afterAll(() => {
    db.quit();
    queue.quit();
  });

  it('should send a message to queue', async () => {
    try {
      await queue.sendMessage(message);
      const response = await db.lindex(`${QUEUE_PREFIX}${QUEUE_NAME}`, 0);

      expect(JSON.parse(response)).toEqual(message);
    } catch (e) {
      console.error(e);
      return e;
    }
  });

  it('should receive a message from the queue', async () => {
    try {
      const received = await queue.receiveMessage();

      expect(received).toEqual(message);
    } catch (e) {
      console.error(e);
      return e;
    }
  });
});

describe('JsonParser', () => {
  const obj = {
    type: 'test',
    args: [ 'test' ],
    flag: true,
    num: 32197361
  };
  const corruptStr = '{"type": "test" ,}';
  let parser = JsonParser;

  it('should stringify an object', () => {
    expect(parser.prepare(obj)).toBe(JSON.stringify(obj));
  });

  it('should parse an object', () => {
    expect(parser.parse(JSON.stringify(obj))).toEqual(obj);
  });

  it('should throw ParserError on corrupt string', () => {
    expect(() => parser.parse(corruptStr)).toThrowError(ParserError);
  });
});