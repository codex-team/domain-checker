const EventEmitter = require('events');
const Redis = require('ioredis');

/**
 * Praser error class.
 */
class ParserError extends Error {}

/**
 * Parser base class.
 */
class Parser {
  /**
   * Prepare message
   * @param {any} msg Message.
   * @throws {Error} Not implemented.
   * @returns {void}
   */
  prepare(msg) {
    throw new Error('Not implemented');
  }

  /**
   * Parse message
   * @param {any} msg Message.
   * @throws {Error} Not implemented.
   * @returns {void}
   */
  parse() {
    throw new Error('Not implemented');
  }
}

/**
 * Json message parser for Queue
 */
class JsonParser extends Parser {
  /**
   * Prepare message
   * @param {object} msg Message.
   * @returns {string} Prepared message.
   * @throws {Error}
   */
  static prepare(msg) {
    try {
      return JSON.stringify(msg);
    } catch (e) {
      throw new ParserError('Serialization error, can not stringify to json');
    }
  }

  /**
   * Parse message
   * @param {object} msg Message.
   * @returns {string} Parsed message.
   */
  static parse(msg) {
    try {
      return JSON.parse(msg);
    } catch (e) {
      throw new ParserError('Parsing error, can not parse json');
    }
  }
}

/**
 * Queue base class.
 */
class Queue extends EventEmitter {
  /**
   *
   * @param {stings} queueName Queue name.
   */
  constructor(queueName) {
    super();
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
 */
class RedisQueue extends Queue {
  /**
   * Create a RedisQueue.
   * @param {string} queueName Queue name.
   * @param {string} [prefix='queue:'] Prefix.
   * @param {number} [timeout=30] Timeout for some redis commands.
   * @param {object} [redisConfig] Redis connection config.
   * @param {Parser} [parser=JsonParser] Message parser.
   * @param {Redis} [redisClient] ioredis' client. If present used instead of creatting a new one.
   */
  constructor({
    queueName,
    prefix = 'queue:',
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
    this.prefix = prefix;
    this._fullName = prefix + queueName;
    this.timeout = timeout;
    this.parser = parser;
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

      await this.dbClient.lpush(this._fullName, prepared);
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
      const received = await this.dbClient.brpop(this._fullName, this.timeout);

      if (!received) {
        return null;
      }

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