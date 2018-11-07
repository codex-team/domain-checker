/**
 * This file contains Queue.
 *
 * A queue should have `sendMessage` and `receiveMessage` methods
 * and use `Parser` methods to convert messages.
 *
 * Such structure allows us to write queues for many brokers/databases like Redis, ZeroMQ, etc.
 * You can write your own by inheriting from `Queue` and implementing `sendMessage` and `receiveMessage`.
 */

/**
 * Queue base class.
 * Used to inherit from it and create new queue for different broker, e.g. RedisQueue, ZeroMQueue.
 * Inherited Queue should implement `sendMessage` and `receiveMessage`.
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

module.exports = {
  Queue
};