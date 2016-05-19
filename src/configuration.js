'use strict';

const minimist = require('minimist');

// TODO: read defaults from file
const defaults = {
    scrap: 'http://localhost:9876',
    imgFilter: 'img',
    out: './grabbed',
}

const opts = {
    string: ['scrap', 'out', 'imgFilter'],
    alias: {
        scrap: 's',
        out: 'o',
    },
    default: defaults,
}

module.exports = minimist(process.argv.slice(2), opts);