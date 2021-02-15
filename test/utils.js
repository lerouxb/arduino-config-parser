'use strict';

const Fs = require('fs');
const Path = require('path');

const internals = {
    fixturesPath: './test/fixtures'
};

exports.loadFixtures = function () {

    const fixtures = {};

    const dirnames = Fs.readdirSync(internals.fixturesPath); // assume they are all dirs for now

    for (const dirname of dirnames) {

        const filenames = Fs.readdirSync(Path.join(internals.fixturesPath, dirname));

        for (const filename of filenames) {
            if (!filename.endsWith('.txt')) {
                continue; // skip README
            }

            fixtures[`${dirname}/${filename}`] = Fs.readFileSync(Path.join(internals.fixturesPath, dirname, filename), 'utf8');
        }
    }

    return fixtures;
};
