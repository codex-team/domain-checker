/**
 * This file is corresponding to queues.
 *
 * A queue should have `sendMessage` and `receiveMessage` methods
 * and use `Parser` methods to convert messages.
 *
 * Such structure allows us to write queues for many brokers/databases like Redis, ZeroMQ, etc.
 * You can write your own by inheriting from `Queue` and implementing `sendMessage` and `receiveMessage`.
 */
const Redis = require('ioredis');
const {
  JsonParser,
  ParserError
} = require('./parser');

/**
 * Queue base class.
 */
class Queue {
  /**
   *
   * @param {stings} queueName Queue name.
   */
  constructor(queueName) {
    this.queueName = queueName;
  }

  /**
   * Send message.
   * @param {any} msg Message to send.
   * @returns {void}
   */
  sendMessage(msg) {}

  /**
   * Receive message.
   * @returns {void}
   */
  receiveMessage() {}
}

/**
 * Simple redis queue.
 * @property {string} queueName Queue name.
 * @property {number} timeout Timeout for some redis commands like `brpop`
 * @property {Parser} parser Parser used by queue to convert messages to specified data format.
 * @property {IORedis.Redis} dbClient Redis client.
 */
class RedisQueue extends Queue {
  /**
   * Create a RedisQueue.
   * @param {string} queueName Queue name.
   * @param {number} [timeout=30] Timeout for some redis commands.
   * @param {object} [redisConfig] Redis connection config.
   * @param {Parser} [parser=JsonParser] Message parser.
   * @param {Redis} [redisClient] ioredis' client. If present used instead of creatting a new one.
   */
  constructor({
    queueName,
    timeout = 30,
    redisConfig = {
      host: '127.0.0.1',
      port: 6379,
      password: null,
      db: 0
    },
    parser = JsonParser,
    redisClient = null
  }) {
    super(queueName);

    this.queueName = queueName;
    this.timeout = timeout;
    this.parser = parser;

    // If given redis client use it instead of creating new one
    if (typeof (redisClient) === typeof (Redis)) {
      this.dbClient = redisClient;
    } else {
      try {
        this.dbClient = new Redis(redisConfig);
      } catch (e) {
        throw this._handleError(e);
      }
    }
  }

  /**
   * Sends message to queue.
   * @param {object | Array} msg Message to send.
   * @throws {Redis.ReplayError | ParserError} On error.
   * @returns {void}
   */
  async sendMessage(msg) {
    try {
      const prepared = this.parser.prepare(msg);

      await this.dbClient.lpush(this.queueName, prepared);
    } catch (e) {
      throw this._handleError(e);
    }
  }

  /**
   * Receive message from queue.
   * @throws {Redis.ReplayError | ParserError} On error.
   * @returns {void}
   */
  async receiveMessage() {
    try {
      const received = await this.dbClient.brpop(this.queueName, this.timeout);

      // Check if received something
      if (!received) {
        return null;
      }

      // reveived format: [queueName, value]. Hence received[1]
      return this.parser.parse(received[1]);
    } catch (e) {
      throw this._handleError(e);
    }
  }

  /**
   * Closes redis connection.
   * @returns {void}
   */
  quit() {
    this.dbClient.quit();
  }

  /**
   * Handles error in this class.
   * @param {Error} err Error.
   * @returns {Error} Error for user.
   */
  _handleError(err) {
    if (err instanceof Redis.ReplyError) {
      console.error('Redis client error');
    }
    if (err instanceof ParserError) {
      console.error('Error while parsing');
    }

    return err;
  }
}

module.exports = {
  RedisQueue,
  JsonParser,
  ParserError
};