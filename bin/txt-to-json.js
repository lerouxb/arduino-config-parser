#!/usr/bin/env node
'use strict';

const Assert = require('assert');
const Fs = require('fs');

const Parse = require('../lib/parse');


const filename = process.argv[2];
Assert.ok(filename, 'Usage: bin/txt-to-json path/to/boards.txt');


const text = Fs.readFileSync(filename, 'utf8');

const obj = Parse.parseToObject(text);
console.log(JSON.stringify(obj, null, 4));
