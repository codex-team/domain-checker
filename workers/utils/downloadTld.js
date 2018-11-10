#!/usr/bin/env node

const https = require('https');

/**
 *
 * @param {string} filepath Path to tld file(.json).
 */
const downloadTlds = async (filepath) => {
  let tlds = [];

  try {
    https.get('https://data.iana.org/TLD/tlds-alpha-by-domain.txt', (res) => {
      if (res.statusCode === 200) {
        res.on('data', (d) => {
          tlds.push(d);
        }).on('end', () => {
          tlds = Buffer.concat(tlds).toString().split('\n');
          tlds = tlds.slice(1, -1); // Cut first commend and last newline
          tlds = tlds.map(x => x.toLowerCase());
        });
      }
    });
  } catch (e) {
    throw new Error('Error while downloading tld list');
  }

  return tlds;
};

module.exports = downloadTlds;