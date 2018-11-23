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
    Object.assign(this, handlers);

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

    this.checkingDomainName = domainName;

    // check domain name for correctness
    if (validateDomainName(domainName) !== true) {
      this.onSearchError('Invalid domain name');
      return;
    }

    try {
      this.onSearchStart();
      /**
       * Send name to server, get WebSocket id for accepting free zones
       * @type {checkDomainResponse}
       */
      const response = await ajax.get({
        url: this.API_ENDPOINT + `/checkDomain/${domainName}`
      });

      if (response.success !== 1) {
        this.onSearchError('Server error');
      }

      if ('data' in response && 'channelId' in response.data) {
        this.waitAnswers(response.data.channelId);
      } else {
        this.onSearchError('Invalid response from server');
      }
    } catch (e) {
      this.onSearchError('Server error');
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
          this.onSearchEnd('searchEnd');
        } else {
          this.onSearchError('Connection break');
        }
      },
      onmessage: (event) => {
        this.onSearchMessage(this.checkingDomainName, event.data);
      },
      onerror: () => {
        this.onSearchError('WebSocket error');
      }
    });
  }
}

export default DomainCheckerClient;
