#!/usr/bin/env node

const Assert = require('assert');
const Fs = require('fs');

const Format = require('../lib/format');


const filename = process.argv[2]
Assert.ok(filename, 'Usage: bin/json-to-txt path/to/boards.json');


const text = Fs.readFileSync(filename, 'utf8');

const obj = JSON.parse(text);
console.log(Format.formatObject(obj).join('\n'));
