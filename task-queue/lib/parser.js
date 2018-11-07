/**
 * This file contains message parser.
 *
 * Whenever Queue sends or receives a message, it gets processed using Parsers's methods.
 * For example, if we receive a message, we call `parser.parse(msg)`.
 * This allows us to use many data formats like json, msgpack, binary, etc.
 * You can write your own parser just by inheriting from `Parser` and implementing `prepare` and `parse`.
 */

/**
 * Praser error class
 */
class ParserError extends Error {}

/**
 * Parser base class
 */
class Parser {
  /**
   * Prepare message.
   * Here you convert a message to specified data format.
   * Method called when sending a message.
   * @param {any} msg Message.
   * @throws {Error} Not implemented.
   * @returns {void}
   */
  prepare(msg) {
    throw new Error('Not implemented');
  }

  /**
   * Parse message.
   * Here you convert a message from specified data format.
   * Method called when receiving a message.
   * @param {any} msg Message.
   * @throws {Error} Not implemented.
   * @returns {void}
   */
  parse(msg) {
    throw new Error('Not implemented');
  }
}

module.exports = {
  Parser,
  ParserError
};