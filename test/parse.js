'use strict';

const Code = require('@hapi/code');
const Lab = require('@hapi/lab');

const Parse = require('../lib/parse');

const Utils = require('./utils');

const internals = {};

const { describe, it } = exports.lab = Lab.script();
const { expect } = Code;


describe('Parse', () => {

    const fixtures = Utils.loadFixtures();

    for (const [name, text] of Object.entries(fixtures)) {

        it(`${name}`, () => {

            // can just split on /\r?\n/ but might as well test getLineBreakChar while at it
            const lineEnding = Parse.getLineBreakChar(text);
            const lines = text.split(new RegExp(lineEnding));

            const parsedLines = lines.map(Parse.parseLine);
            const withoutExtras = Parse.linesToObject(parsedLines);
            const withExtras = Parse.linesToObject(parsedLines, true, true);

            expect(withoutExtras, name).to.be.an.object();
            expect(withExtras, name).to.be.an.object();

            const flattenedWithoutExtras = internals.flatten(withoutExtras);
            expect(flattenedWithoutExtras.filter((item) => !!(item.__comments || item.__properties))).to.be.empty();

            const flattenedWithExtras = internals.flatten(withExtras);
            const leaves = flattenedWithExtras.filter((item) => item.__value !== undefined);
            expect(flattenedWithExtras.filter((item) => !!item.__comments)).to.have.length(leaves.length);
            expect(flattenedWithExtras.filter((item) => !!item.__properties)).to.have.length(leaves.length);

            // convenience method
            const result = Parse.parseToObject(text);
            expect(result).to.equal(withExtras);
        });
    }
});

describe('getLineBreakChar', () => {

    it('can detect \\r', () => {

        expect(Parse.getLineBreakChar('foo\rbar')).to.equal('\r');
    });

    it('can detect \\n', () => {

        expect(Parse.getLineBreakChar('foo\nbar')).to.equal('\n');
    });

    it('can detect \\r\\n', () => {

        expect(Parse.getLineBreakChar('foo\r\nbar')).to.equal('\r\n');
    });

    it('defaults to \\n for empty files', () => {

        expect(Parse.getLineBreakChar('')).to.equal('\n');
    });

    it('defaults to \\n for non-empty files', () => {

        expect(Parse.getLineBreakChar('foo')).to.equal('\n');
    });
});

internals.flatten = function (result, flattened = [], path = []) {

    const { __value, __comments, __properties } = result;

    flattened.push({
        path,
        __value,
        __comments, // might be undefined
        __properties // might be undefined
    });

    for (const [key, value] of Object.entries(result)) {
        if (key.startsWith('__')) {
            continue;
        }

        internals.flatten(value, flattened, [...path, key]);
    }

    return flattened;
};
