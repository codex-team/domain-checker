const util = require('util');
const exec = util.promisify(require('child_process').exec);

/**
 * Whois request timeout.
 * @const {number}
 * @default {2000}
 */
const WHOIS_TIMEOUT = process.env.WHOIS_TIMEOUT || 2000;

/**
 * Array of strings which occur in whois response if domain is available(not found).
 * @const {string[]}
 */
const domainWhoisAvailable = [
  'NOT FOUND',
  'The queried object does not exist',
  'No Data Found',
  'No match for domain',
  'No entries found for the selected source(s).'
];

/**
 * Array of strings which occur in whois response if domain is NOT available.
 * @const {string[]}
 */
const domainWhoisNotAvailable = [
  'Domain Name:',
  'domain:'
];

/**
 * Parses given whois response to check availability.
 * @param {string} data Raw whois response.
 * @returns {boolean} True if domain available, false if not.
 * @throws {Error} 'Undefined whois response' else.
 */
const checkAvailability = data => {
  const foundAvailable = domainWhoisAvailable.some(el => data.indexOf(el) >= 0);

  if (foundAvailable) return true;

  const foundNotAvailable = domainWhoisNotAvailable.some(el => data.indexOf(el) >= 0);

  if (foundNotAvailable) return false;

  throw Error('Undefined whois response');
};

/**
 * Checks if domain is available.
 * @param {string} name Base domain name w/o TLD.
 * @param {string} tld TLD.
 * @returns {boolean} true if available else false.
 * @throws {Error} 'Whois timed out' if WHOIS_TIMEOUT reached,
 *                 'Invalid domain' if domain is invalid,
 *                  raw execSync Error otherwise.
 */
const checkDomain = async (name, tld) => {
  /**
   * Regexp to check if domain is valid.
   * @const {RegExp}
   */
  const domainRegexp = /[a-z0-9]+\.[a-z0-9]+/;

  const domain = `${name}.${tld}`;

  if (domainRegexp.test(domain)) {
    try {
      const {
        stdout: rawRes
      } = await exec(`whois ${domain}`, {
        timeout: WHOIS_TIMEOUT
      });

      return checkAvailability(rawRes.toString());
    } catch (e) {
      if (e.code === 'ETIMEDOUT') {
        throw Error('Whois timed out');
      } else if (e.status === 1) {
        // Strange bug in whois for .com domains: it returns 1 code instead of 0, so node throws an exception
        return checkAvailability(e.stdout.toString());
      } else {
        console.log(e.stdout.toString());
        console.log(e.error);
        throw e;
      }
    }
  }
  throw Error(`Invalid domain ${domain}`);
};

module.exports = {
  checkAvailability,
  checkDomain
};