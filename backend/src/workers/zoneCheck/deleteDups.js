#!/usr/bin/env node
/**
 * Simple script to sort delete duplicate tlds
 *
 * Example:
 *  # node ./deleteDups.js tlds.json
 */

const fs = require('fs');

let file = process.argv[2];

let tlds = JSON.parse(fs.readFileSync(file, 'utf-8'));

let result = [];

for (let tld of tlds) {
  if (!result.includes(tld)) result.push(tld);
}

fs.writeFile(file, JSON.stringify(result, null, 2), () => console.log('Done writing'));
