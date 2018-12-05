#!/usr/bin/env node
/**
 * Simple script to sort tlds stores in json file as array by length and alphabetically
 *
 * Example:
 *  # ./sortTlds.js tlds.json
 */

const fs = require('fs');

let file = process.argv[2];

let tlds = JSON.parse(fs.readFileSync(file, 'utf-8'));

tlds.sort();
tlds.sort((a, b) => a.length - b.length);

fs.writeFile(file, JSON.stringify(tlds), () => console.log('Done writing'));
