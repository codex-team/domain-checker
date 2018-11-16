/**
 * Native WebSocketWrapper module
 *
 * @usage
 * const ws = new WebSocketWrapper({
 *  host: 'localhost',
 *  path: 'socket',
 *  port: 8000,
 *  onmessage: messageHandler
 * })
 *
 */
class WebSocketWrapper {
  /**
   * Determining the necessary information for initialization WebSocket connection and open new WebSocket connection
   * @param {Object} options
   *
   * Server properties
   * @param {String} options.url - WebSocket full url for connection
   * @param {String} options.host - WebSocket server host
   * @param {String} options.path - WebSocket server path
   * @param {Number} options.port - WebSocket server port
   * @param {Boolean} options.secure - if True, uses wss protocol, else ws
   *
   * Events handlers
   * @param {Function} options.onopen - fires when connection have been opened
   * @param {Function} options.onmessage - fires when message from server received
   * @param {Function} options.onclose - fires when connection have been closed
   * @param {Function} options.onerror - fires when a connection error occurs
   */
  constructor(options) {
    this.options = options;
    if ('url' in this.options) {
      this.url = this.options.url;
    } else {
      const protocol = 'ws' + (this.options.secure ? 's' : '') + '://';

      const host = this.options.host || 'localhost';

      const path = this.options.path ? '/' + this.options.path : '';

      const port = this.options.port ? ':' + this.options.port : '';

      this.url = protocol + host + port + path;
    }
    this.connect();
  }

  /**
   * Open new WebSocketWrapper connection using native WebSocketWrapper object
   */
  connect() {
    this.ws = new WebSocket(this.url);

    if ('onmessage' in this.options) {
      this.ws.onmessage = this.options.onmessage;
    }
    if ('onclose' in this.options) {
      this.ws.onclose = this.options.onclose;
    }
    if ('onopen' in this.options) {
      this.ws.onopen = this.options.onopen;
    }
    if ('onerror' in this.options) {
      this.ws.onerror = this.options.onerror;
    }
  }

  /**
   * Send data to WebSocketWrapper server in JSON format
   * @param {Object} data - data to send
   */
  send(data) {
    data = JSON.stringify(data);

    this.ws.send(data);
  }

  /**
   * Checks whether the connection is open or not
   * @returns {boolean} - true if WebSocketWrapper connection is open
   */
  get isOpen() {
    return this.ws.readyState === this.ws.OPEN;
  }
}

export default WebSocketWrapper;
