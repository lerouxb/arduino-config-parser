'use strict';

const Assert = require('assert');

exports.formatObject = function (result, path = []) {

    // TODO: requires test now that I removed the only fixture
    /* $lab:coverage:off$ */
    if (Object.keys(result).length === 1) {
        Assert.fail('The input does not contain any values.');
    }
    /* $lab:coverage:on$ */

    const lines = [];

    if (result.__comments) {
        lines.push(...result.__comments);
    }

    if (result.__value !== undefined) {
        lines.push(`${path.join('.')}=${result.__value}`);
    }

    let isBranch = false;

    for (const key of result.__order) {
        const value = result[key];
        lines.push(...exports.formatObject(value, [...path, key]));
        isBranch = true;
    }

    // add anything that might have gotten added to the object without being added to __order to the end
    // (You can only get here if you manipulated the object manually)
    // TODO: requires tests that manipulate the data
    /* $lab:coverage:off$ */
    for (const [key, value] of Object.entries(result)) {
        if (key.startsWith('__')) {
            continue;
        }

        if (result.__order.includes(key)) {
            continue; // already added above
        }

        // This should probably warn somehow?
        lines.push(...exports.formatObject(value, [...path, key]));
        isBranch = true;
    }
    /* $lab:coverage:on$ */

    // This assertion can only fail if you manipulated the object manually and forgot something.
    // OR if the input is an empty file
    Assert.ok(isBranch || result.__value !== undefined, `Looks like __value was not set. ${Object.keys(result)}`);

    return lines;
};
