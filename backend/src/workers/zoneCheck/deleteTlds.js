#!/usr/bin/env node
/**
 * Simple script to delete zones of one file from another
 *
 * Example:
 *  # node ./deleteTlds.js tlds.json toDelete.json
 */

const fs = require('fs');

const outFile = 'd.json';

const fileTlds = process.argv[2];
const fileDelete = process.argv[3];

let tlds = JSON.parse(fs.readFileSync(fileTlds, 'utf-8'));
let toDelete = JSON.parse(fs.readFileSync(fileDelete, 'utf-8'));
let result = [];

for (let tld of tlds) {
  if (!toDelete.includes(tld)) {
    result.push(tld);
  }
}

fs.writeFile(outFile, JSON.stringify(result, null, 2), () => console.log('Done writing'));
