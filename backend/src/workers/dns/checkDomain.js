const axios = require('axios');

/**
 * @typedef {object} DoHResponse (DNS over HTTPS)
 * @description - Format of server answer
 * @property {object} data - data from server
 * @property {number} data.Status - Status of the DNS query
 */

/**
 * Returns DNS status for searching domain
 * @param {string} name Base domain name w/o TLD.
 * @param {string} tld TLD.
 * @param {string} recordType - DNS record type
 * @returns {Promise<number>}
 * @throws {Error} 'Invalid response from server',
 *                 'HTTPS request error'
 */
const getDNSStatus = async (name, tld, recordType) => {
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
    const url = `${API_ENDPOINT}?name=${name}.${tld}&type=${recordType}`;

    /**
     * @const {DoHResponse} response from server
     */
    const response = await axios.get(url, config);

    if ('data' in response && 'Status' in response.data) {
      return response.data.Status;
    } else throw new Error('Invalid response from server');
  } catch (e) {
    console.log('HTTPS request error' + e);
  }
};

/**
 * Checks if domain is available by DNS.
 * @param {string} name Base domain name w/o TLD.
 * @param {string} tld TLD.
 * @returns {boolean} true if available else false.
 * @throws {Error} 'Invalid response from server',
 *                 'HTTPS request error'
 */
const checkDomain = async (name, tld) => {
  try {
    /**
     * @const {{A: string, AAAA: string}} checking DNS record types
     */
    const DNS_RECORD_TYPES = {
      A: 'A',
      AAAA: 'AAAA'
    };

    let dnsStatus = await getDNSStatus(name, tld, DNS_RECORD_TYPES.A);

    if (dnsStatus === 0) {
      return false;
    }
    dnsStatus = await getDNSStatus(name, tld, DNS_RECORD_TYPES.AAAA);
    return !(dnsStatus === 0);
  } catch (e) {
    console.log('Error in DoH request' + e);
    throw e;
  }
};

module.exports = {checkDomain};
