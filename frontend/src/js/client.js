/**
 * Client for domain-checker
 */
class Client {
  /**
   * @param {String} apiID - URI to API to get ID for WS connection
   * @param {String} apiWS - URI to WS
   */
  constructor(apiID, apiWS) {
    this.apiID = apiID;
    this.apiWS = apiWS;
  }

  /**
   * Create WS connection
   * @param {String} id - id for WS connection
   * @param {Function} callback
   */
  createWebSocketConnection(id, callback) {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(this.apiWS);

      this.socket.addEventListener('open', () => {
        this.socket.send(id);
      });

      this.socket.addEventListener('close', (event) => {
        if (event.wasClean) {
          resolve();
        } else {
          reject(new Error('Connection break'));
        }
      });

      this.socket.addEventListener('message', (event) => {
        const data = event.data;

        if (data !== 'OK' && data !== 'Wrong id') {
          callback(data);
        }
      });

      this.socket.addEventListener('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Main method of the Client class
   * @param {String} domainName
   * @param {Function} callback - called when response new free domain zone
   * @returns {Promise<void>}
   */
  async getDomainInfo(domainName, callback) {
    let id;

    try {
      id = await this.getWebSocketId(domainName);
    } catch (e) {
      throw e;
    }
    alert();
    return this.createWebSocketConnection(id, callback);
  }
  /**
   * Get an id to connect to the server
   * @param {String} domainName
   * @returns {Promise<String>}
   */
  getWebSocketId(domainName) {
    return new Promise((resolve, reject) => {
      if (this.socket && this.socket.readyState === this.socket.OPEN) {
        this.socket.close();
      }
      const xhr = new XMLHttpRequest();

      xhr.open('GET', `${this.apiID}/${domainName}`);
      xhr.addEventListener('load', (event) => {
        resolve(JSON.parse(event.currentTarget.response).id);
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