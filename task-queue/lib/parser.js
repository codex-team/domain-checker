/**
 * This file is corresponding to message parsers.
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
   * Here you convert a message FROM specified data format.
   * Method called when receiving a message.
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
   * Prepare message: convert a JS object to JSON string.
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
   * Parse message: convert a JSON string to JS object.
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

module.exports = {
  Parser,
  JsonParser,
  ParserError
};
