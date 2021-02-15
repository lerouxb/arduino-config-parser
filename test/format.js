'use strict';

const Fs = require('fs-extra');
const Path = require('path');

const Code = require('@hapi/code');
const Lab = require('@hapi/lab');

const Parse = require('../lib/parse');
const Format = require('../lib/format');

const Utils = require('./utils');

const internals = {};

const { describe, it } = exports.lab = Lab.script();
const { expect, fail } = Code;


describe('Format', () => {

    const fixtures = Utils.loadFixtures();

    for (const [name, text] of Object.entries(fixtures)) {

        it(`${name}`, () => {

            const lineEnding = Parse.getLineBreakChar(text);

            const inputLines = text.split(/\r?\n/);
            const parsedLines = inputLines.map(Parse.parseLine);
            const result = Parse.linesToObject(parsedLines, true, true);
            const outputLines = Format.formatObject(result);

            // comparing the lines for now rather than the text just so different line endings won't confuse matters just yet
            internals.compareLines(inputLines.map((l) => l.trim()), outputLines.map((l) => l.trim()));

            const outputText = outputLines.join(lineEnding);

            const dirname = Path.join('./output', Path.dirname(name));
            Fs.ensureDirSync(dirname);
            const filename = Path.join(dirname, Path.basename(name));

            Fs.writeFileSync(filename, outputText, 'utf8');
        });
    }
});


internals.compareLines = function (inputLines, outputLines) {

    // TODO: probably makes more sense to move this elsewhere as it is only useful until the fixtures are valid

    const sortedLines = inputLines.slice();
    sortedLines.sort();

    const duplicateLines = [];
    const duplicatePaths = [];
    const uniquePaths = {};

    let previous;
    for (const line of sortedLines) {

        if (!line) {
            continue;
        }

        if (line[0] === '#') {
            continue;
        }

        expect(line).to.include('='); // everything that remains has to be path=value

        const path = line.split('=')[0];

        if (uniquePaths[path]) {
            duplicatePaths.push(path);
        }
        else {
            uniquePaths[path] = true;
        }

        if (line === previous) {
            duplicateLines.push(line);
        }

        previous = line;
    }

    expect(duplicatePaths, 'duplicate paths').to.be.empty();
    expect(duplicateLines, 'duplicate lines').to.be.empty();

    // all the lines in the input must exist in the output
    let inputBlanks = 0;
    for (const line of inputLines) {
        if (!line) {
            ++inputBlanks;
            continue;
        }

        if (!outputLines.includes(line)) {
            fail(`missing from input: ${line}`);
        }
    }

    // all the lines in the output must exist in the input
    let outputBlanks = 0;
    for (const line of outputLines) {
        if (!line) {
            ++outputBlanks;
            continue;
        }

        if (!inputLines.includes(line)) {
            fail(`missing from input: ${line}`);
        }
    }

    // remove blanks so as not to worry about blank line at the end of the file for now
    expect(outputLines.length - outputBlanks).to.equal(inputLines.length - inputBlanks);
};
