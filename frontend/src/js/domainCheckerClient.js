import Socket from './utils/socket';
import validateDomainName from './utils/validateDomainName';
import ajax from '@codexteam/ajax';

/**
 * @typedef {object} checkDomainResponse
 * @description - Format of server answer
 * @property {number} success - 1 or 0
 * @property {object} data - data from server
 * @property {string} data.channelId - Id of channel that will get available domains
 */

/**
 * @typedef {object} DomainCheckerClientHandlers
 * @description - handlers for the DomainCheckerClient events
 * @property {function} onSearchStart - fires when new search started
 * @property {function} onSearchMessage - fires when comes new information about available domain zone
 * @property {function} onSearchEnd - fires when search ends successfully
 * @property {function} onSearchError - fires when any error occurs
 */

/**
 * DomainCheckerClient for domain-checker server
 */
class DomainCheckerClient {
  /**
   * Setup necessary variables and handlers
   * @param {DomainCheckerClientHandlers} handlers - handlers for the DomainCheckerClient events
   */
  constructor(handlers) {
    this.handlers = handlers;
    this.API_ENDPOINT = process.env.API_ENDPOINT;
    this.WS_ENDPOINT = process.env.WS_ENDPOINT;
  }

  /**
   * Main method of the DomainCheckerClient class. Return information about available domains through the message event.
   * @param {String} domainName - domain name to check
   */
  async checkDomain(domainName) {
    // close socket connection if exist
    if (this.socket && this.socket.isOpen) {
      this.socket.terminate();
    }

    // check domain name for correctness
    if (validateDomainName(domainName) !== true) {
      this.handlers.onSearchError('Invalid domain name');
      return;
    }

    this.handlers.onSearchStart();

    try {
      const socketId = await this.getSocketId(domainName);

      this.waitAnswers(socketId);
    } catch (e) {
      this.handlers.onSearchError(e);
    }
  }

  /**
   * Send name to server, get WebSocket id for accepting free zones
   * @param {string} domainName - domain name to check
   * @returns {Promise<string>}
   * @throws {Error} - throws if an any server error occurs or server sent invalid data
   */
  async getSocketId(domainName) {
    /**
     * @const {checkDomainResponse} - server answer
     */
    const response = await ajax.get({
      url: this.API_ENDPOINT + `/checkDomain/${domainName}`
    });

    if (response.success !== 1) {
      throw new Error('Server error');
    }

    if ('data' in response && 'channelId' in response.data) {
      throw new Error('Invalid response from server');
    }
  }

  /**
   * Create WS connection and waiting for answers
   * @param {String} id - id for Socket connection
   */
  waitAnswers(id) {
    /**
     * Create WebSocket connection, setup event handlers.
     * Save the Socket object to break the connection if necessary.
     */
    this.socket = new Socket({
      url: `${this.WS_ENDPOINT}/${id}`,
      onclose: (event) => {
        // if connection closed without any errors such as server interruption or loss of internet connection
        if (event.wasClean) {
          this.handlers.onSearchEnd();
        } else {
          this.handlers.onSearchError('Connection break');
        }
      },
      onmessage: (event) => {
        this.handlers.onSearchMessage(event.data);
      },
      onerror: () => {
        this.handlers.onSearchError('WebSocket error');
      }
    });
  }
}

export default DomainCheckerClient;
