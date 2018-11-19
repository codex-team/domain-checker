import Socket from './utils/socket';
import ajax from '@codexteam/ajax';

/**
 * @typedef {object} checkDomainResponse
 * @description - Format of server answer
 * @property {number} success - 1 or 0
 * @property {object} data - data from server
 * @property {string} data.channelId - Id of channel that will get available domains
 */

/**
 * DomainCheckerClient for domain-checker server
 */
class DomainCheckerClient {
  /**
   * Setup necessary variables
   */
  constructor() {
    this.API_ENDPOINT = process.env.API_ENDPOINT;
    this.WS_ENDPOINT = process.env.WS_ENDPOINT;
  }

  /**
   * Called when new information about available domains comes from a socket
   * @callback newAvailableDomain
   * @param {String} domainZone - available domain zone for requested domain
   */

  /**
   * Main method of the DomainCheckerClient class. Return available domains through the callback function.
   * @param {String} domainName - domain name to check
   * @param {Function} zoneAvailableCallback - called when we got a response with available zone
   * @returns {Promise<void>} - resolved after closing the Socket connection
   * @throws will throw an error if the AJAX request fail
   */
  async checkDomain(domainName, zoneAvailableCallback) {
    try {
      if (this.socket && this.socket.isOpen) {
        this.socket.close();
      }
      /**
       * Send name to server, get WebSocket id for accepting free zones
       * @type {checkDomainResponse}
       */
      const response = await ajax.get({
        url: this.API_ENDPOINT + `/checkDomain/${domainName}`
      });

      if (response.success !== 1) {
        throw new Error('Server error');
      }

      if ('data' in response && 'channelId' in response.data) {
        return new Promise((resolve, reject) => {
          this.waitAnswers(response.data.channelId, zoneAvailableCallback)
            .then(() => {
              console.log('All zones checked');
              resolve();
            }).catch((error) => {
              reject(error);
            });
        });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (e) {
      console.log('Can\'t check domain\n' + e);
      throw e;
    }
  }

  /**
   * Create WS connection and sends free zones through callback
   * @param {String} id - id for Socket connection
   * @param {newAvailableDomain} callback - called when new information about available domains comes from a socket
   * @return {Promise<any>}
   */
  waitAnswers(id, callback) {
    return new Promise((resolve, reject) => {
      /**
       * Create WebSocket connection, setup event handlers.
       * Save the Socket object to break the connection if necessary.
       */
      this.socket = new Socket({
        url: `${this.WS_ENDPOINT}/${id}`,
        onclose(event) {
          // if connection closed without any errors such as server interruption or loss of internet connection
          if (event.wasClean) {
            resolve();
          } else {
            reject(new Error('Connection break'));
          }
        },
        onmessage(event) {
          callback(event.data);
        },
        onerror(error) {
          reject(error);
        }
      });
    });
  }
}

export default DomainCheckerClient;
