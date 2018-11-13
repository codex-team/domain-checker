import WebSocket from './websocket';

/**
 * Client for domain-checker
 */
class Client {
  /**
   * @param {String} API_GET_WS_ID - URI to API to get ID for WS connection
   * @param {String} API_WS_ENDPOINT - URI to WS
   */
  constructor(API_GET_WS_ID, API_WS_ENDPOINT) {
    this.API_GET_WS_ID = API_GET_WS_ID;
    this.API_WS_ENDPOINT = API_WS_ENDPOINT;
  }

  /**
   * Called when new information about available domains comes from a socket
   * @callback newAvailableDomain
   * @param {String} domainZone - available domain zone for requested domain
   */

  /**
   * Create WS connection
   * @param {String} id - id for WebSocket connection
   * @param {newAvailableDomain} callback - called when new information about available domains comes from a socket
   */
  createWebSocketConnection(id, callback) {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket({
        url: this.API_WS_ENDPOINT + '/' + id,
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

  /**
   * Main method of the Client class. Return available domains through the callback function.
   * @param {String} domainName - domain name to check
   * @param {Function} callback - called when response new available domain zone
   * @returns {Promise<void>} - resolved after closing the WebSocket connection
   * @throws will throw an error if the AJAX request fail
   */
  async getDomainInfo(domainName, callback) {
    let id;

    try {
      id = await this.getWebSocketId(domainName);
    } catch (e) {
      throw e;
    }
    return this.createWebSocketConnection(id, callback);
  }
  /**
   * Get an WebSocket id to connect to the server
   * @param {String} domainName
   * @returns {Promise<String>} - promise object represents the id of WebSocket connection
   */
  getWebSocketId(domainName) {
    return new Promise((resolve, reject) => {
      if (this.socket && this.socket.readyState === this.socket.OPEN) {
        this.socket.close();
      }
      const xhr = new XMLHttpRequest();

      xhr.open('GET', `${this.API_GET_WS_ID}/${domainName}`);
      xhr.addEventListener('load', (event) => {
        try {
          const data = JSON.parse(event.currentTarget.response);

          if ('id' in data) {
            resolve(data.id);
          }
        } catch (e) {
          reject(e);
        }
      });
      xhr.addEventListener('error', (e) => {
        reject(e);
      });
      xhr.addEventListener('abort', () => reject(new Error('request aborted')));

      xhr.send();
    });
  }
}

export default Client;