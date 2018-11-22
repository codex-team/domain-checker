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
 * Event that contain information about available tlds
 * @class NewAvailableTldEvent
 * @extends CustomEvent
 */
class NewAvailableTldEvent extends CustomEvent {
  /**
   * @param {string} domainName - checked domain name
   * @param {string} tld - available tld for domain name
   */
  constructor(domainName, tld) {
    super('message', {
      detail: {
        domainName: domainName,
        'tld': tld
      }
    });
  }
}

/**
 * DomainCheckerClient for domain-checker server
 */
class DomainCheckerClient extends EventTarget {
  /**
   * Setup necessary variables
   */
  constructor() {
    super();
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
      console.log('Terminate existing connection');
      this.dispatchEvent(new Event('breakSearch'));
      this.socket.terminate();
    }

    this.checkingDomainName = domainName;
    if (validateDomainName(domainName) !== true) {
      this.dispatchEvent(new Event('breakSearch'));
      return;
    }

    try {
      this.dispatchEvent(new Event('startSearch'));
      /**
       * Send name to server, get WebSocket id for accepting free zones
       * @type {checkDomainResponse}
       */
      const response = await ajax.get({
        url: this.API_ENDPOINT + `/checkDomain/${domainName}`
      });

      if (response.success !== 1) {
        this.dispatchEvent(new CustomEvent('error', {
          detail: 'Server error'
        }));
      }

      if ('data' in response && 'channelId' in response.data) {
        this.waitAnswers(response.data.channelId);
      } else {
        this.dispatchEvent(new CustomEvent('error', {
          detail: 'Invalid response from server'
        }));
      }
    } catch (e) {
      this.dispatchEvent(new CustomEvent('error', {
        detail: 'Server error'
      }));
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
          this.dispatchEvent(new Event('endSearch'));
        } else {
          this.dispatchEvent(new CustomEvent('error', {
            detail: 'Connection break'
          }));
          this.dispatchEvent(new Event('breakSearch'));
        }
      },
      onmessage: (event) => {
        this.dispatchEvent(new NewAvailableTldEvent(this.checkingDomainName, event.data));
      },
      onerror: () => {
        this.dispatchEvent(new CustomEvent('error', {
          detail: 'WebSocket error'
        }));
      }
    });
  }
}

export default DomainCheckerClient;
