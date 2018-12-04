#!/usr/bin/env node
/**
 * Simple script to sort tlds stores in json file as array by length and alphabetically
 *
 * Example:
 *  # node ./sortTlds.js tlds.json
 */

const fs = require('fs');

let file = process.argv[2];

let tlds = JSON.parse(fs.readFileSync(file, 'utf-8'));

tlds = tlds.filter(tld => tld.indexOf('.') === -1);

tlds.sort();
tlds.sort((a, b) => a.length - b.length);

fs.writeFile(file, JSON.stringify(tlds, null, 2), () => console.log('Done writing'));
