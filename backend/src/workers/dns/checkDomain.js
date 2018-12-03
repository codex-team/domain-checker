const axios = require('axios');

/**
 * @typedef {object} DoHResponse (DNS over HTTPS)
 * @description - Format of server answer
 * @property {object} data - data from server
 * @property {number} data.Status - Status of the DNS query
 */

/**
 * Checks if domain is available by DNS.
 * @param {string} name Base domain name w/o TLD.
 * @param {string} tld TLD.
 * @returns {boolean} true if available else false.
 * @throws {Error} 'Invalid response from server',
 *                 'HTTPS request error'
 */
const checkDomain = async (name, tld) => {
  /**
   * @const {string} Cloudflare DoH API endpoint
   */
  const API_ENDPOINT = 'https://cloudflare-dns.com/dns-query';

  /**
   * @type {{headers: {accept: string}}} config for DoH request
   */
  const config = {
    headers: {'accept': 'application/dns-json'}, responseType: 'json'
  };

  try {
    /**
     * @type {string} url for sending DoH request
     */
    const url = `${API_ENDPOINT}?name=${name}.${tld}&type=A`;

    /**
     * @const {DoHResponse} response from server
     */
    const response = await axios.get(url, config);

    if (response.data && response.data.Status) {
      // Return false id domain available => can't buy domain
      return !(response.data.Status === 0);
    } else throw new Error('Invalid response from server');
  } catch (e) {
    console.log('HTTPS request error' + e);
  }
};

module.exports = {checkDomain};
