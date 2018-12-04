const { WorkerError } = require('../lib/worker');
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
   * @type {{headers: {accept: string, responseType: string}}} config for DoH request
   */
  const DOH_CONFIG = {
    headers: { accept: 'application/dns-json' },
    responseType: 'json'
  };

  /**
   * @type {string} url for sending DoH request
   */
  const url = `${API_ENDPOINT}?name=${name}.${tld}&type=${recordType}`;

  /**
   * @const {DoHResponse} response from server
   */
  let response;

  try {
    response = await axios.get(url, DOH_CONFIG);
  } catch (e) {
    console.error('HTTPS request error');
    throw WorkerError(e);
  }

  if ('data' in response && 'Status' in response.data) {
    return response.data.Status;
  } else {
    throw new WorkerError('Invalid response from server');
  }
};

/**
 * Checks if domain is available by DNS.
 * First queries for ipv4 address(A record), if domain doesn't have it queries ipv6(AAAA record)
 * @param {string} name Base domain name w/o TLD.
 * @param {string} tld TLD.
 * @returns {Promise<boolean>} true if available else false.
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

    /**
     * @const {{SUCCESS: number}} DNS response status codes
     */
    const DNS_RESPONSE_STATUS = { SUCCESS: 0 };

    let dnsStatus = await getDNSStatus(name, tld, DNS_RECORD_TYPES.A);

    if (dnsStatus === DNS_RESPONSE_STATUS.SUCCESS) {
      return false;
    }

    // If domain doesn't have A record, maybe it has AAAA (available only by ipv6)
    dnsStatus = await getDNSStatus(name, tld, DNS_RECORD_TYPES.AAAA);
    return !(dnsStatus === 0);
  } catch (e) {
    console.error('Error in DoH request');
    throw e;
  }
};

module.exports = { checkDomain };
