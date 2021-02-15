'use strict';

const Assert = require('assert');

const internals = {};


exports.parseLine = function (line) {

    // whitespace and comments will be type "comment"
    // everything else should be type "value"

    // Doesn't look like starting or trailing whitespace needs to be kept and trimming it makes the steps below easier.
    line = line.trim();

    if (!line || line[0] === '#') {
        return { type: 'comment', text: line };
    }

    const index = line.indexOf('=');
    Assert.notEqual(index, -1, 'Must be comment, whitespace or a dotpath followed by = then value.');

    const pathString = line.substr(0, index);
    const value = line.slice(index + 1);

    // Doesn't look like it is necessary to handle something like escaped dots inside paths, so should be good enough to just split it.
    const path = pathString.split('.');

    // You can use variables inside values. Might be useful in some cases to have them extracted.
    // ie. we could try and validate them to make sure they either point elsewhere in the file or to the built-in parameters specified in https://arduino.github.io/arduino-cli/latest/platform-specification/
    const properties = internals.extractProperties(value);

    return { type: 'value', path, value, properties };
};

exports.linesToObject = function (parsedLines, includeComments = false, includeProperties = false) {

    // Setting both includeComments and includeProperties to false will give you a JSON-like structure that represents the meat of the file.
    // That should be convenient for most cases if you want to just validate things or extract data, but not enough if you want to format the file back out and get exactly what went in.

    const result = { __order: [] };

    // Group all adjacent comments (including whitespace) together and make that the next value's comments.
    let comments = [];

    for (const line of parsedLines) {
        if (line.type === 'comment') {
            comments.push(line.text);
            continue;
        }

        internals.addValueToObject(result, line, comments, includeComments, includeProperties);
        comments = [];
    }

    return result;
};


exports.parseToObject = function (text) {

    // This exists for convenience

    const lineEnding = exports.getLineBreakChar(text);
    const inputLines = text.split(new RegExp(lineEnding));
    const parsedLines = inputLines.map(exports.parseLine);
    return exports.linesToObject(parsedLines, true, true);
};


exports.getLineBreakChar = function (string) {

    // from https://stackoverflow.com/questions/34820267/detecting-type-of-line-breaks

    const indexOfLF = string.indexOf('\n', 1); // No need to check first-character

    if (indexOfLF === -1) {
        if (string.indexOf('\r') !== -1) {
            return '\r';
        }

        return '\n';
    }

    if (string[indexOfLF - 1] === '\r') {
        return '\r\n';
    }

    return '\n';
};


internals.extractProperties = function (value) {

    // '{compiler.path}{compiler.c.cmd}' will give you [['compiler', 'path'], ['compiler', 'c', 'cmd']]

    const matches = value.match(/{(.*?)}/g);

    if (!matches) {
        return [];
    }

    return matches.map((match) => match.substr(1, match.length - 2).split('.'));
};


internals.addValueToObject = function (result, line, comments, includeComments, includeProperties) {

    const { type, path, value, properties } = line;

    Assert.equal(type, 'value', 'Line must be type value');

    let parent = result;

    for (const branch of path) {
        if (!parent[branch]) {
            parent[branch] = { __order: [] };
            parent.__order.push(branch);
        }

        parent = parent[branch];
    }

    // comments, value and properties will just have to be special-cased as leaves

    if (includeComments) {
        // JSON doesn't have the concept of comments so just come up with a convention.
        // (only relevant for tests or debugging - JSON will just be a thing that exists internally)
        parent.__comments = comments;
    }

    parent.__value = value;

    if (includeProperties) {
        // similar comment to __comments above
        parent.__properties = properties;
    }
};
