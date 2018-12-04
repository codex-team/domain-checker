#!/usr/bin/env node
/**
 * Simple script to merge and sort lists of tlds
 *
 * Example:
 *  # node ./mergeTlds.js tlds1.json tlds2.json
 */

const fs = require('fs');

const outFile = 'merged.json';

const files = process.argv.splice(2);

let merged = [];

for (let file of files) {
  let tlds = JSON.parse(fs.readFileSync(file, 'utf-8'));

  for (let tld of tlds) {
    if (!merged.includes(tld)) {
      merged.push(tld);
    }
  }
}

merged = merged.filter(tld => tld.indexOf('.') === -1);

merged.sort();
merged.sort((a, b) => a.length - b.length);

fs.writeFile(outFile, JSON.stringify(merged, null, 2), () => console.log('Done writing'));
