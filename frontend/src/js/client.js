import WebSocketWrapper from './webSocketWrapper';
import ajax from '@codexteam/ajax';

/**
 * @typedef {object} checkDomainResponse
 * @description - Format of server answer
 * @property {number} success - 1 or 0
 * @property {string} channelId - Id of channel that will get available domains
 */

/**
 * Client for domain-checker
 */
class Client {
  /**
   *
   */
  constructor() {
    this.API_ENDPOINT = 'http://localhost:3000/api';
    this.WS_ENDPOINT = 'ws://localhost:3000/api/ws';
  }

  /**
   * Called when new information about available domains comes from a socket
   * @callback newAvailableDomain
   * @param {String} domainZone - available domain zone for requested domain
   */

  /**
   * Main method of the Client class. Return available domains through the callback function.
   * @param {String} domainName - domain name to check
   * @param {Function} zoneAvailableCallback - called when we got a response with available zone
   * @returns {Promise<void>} - resolved after closing the WebSocketWrapper connection
   * @throws will throw an error if the AJAX request fail
   */
  async checkDomain(domainName, zoneAvailableCallback) {
    try {
      if (this.socket && this.socket.isOpen) {
        this.socket.close();
      }
      /**
       * Send name to server, get WebSocketWrapper id for accepting free zones
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
      throw e;
    }
  }

  /**
   * Create WS connection
   * @param {String} id - id for WebSocketWrapper connection
   * @param {newAvailableDomain} callback - called when new information about available domains comes from a socket
   * @return {Promise<any>}
   */
  waitAnswers(id, callback) {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocketWrapper({
        url: `${this.WS_ENDPOINT}/${id}`,
        onopen() {
        },
        onclose(event) {
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

export default Client;
