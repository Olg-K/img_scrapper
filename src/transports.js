'use strict';

const defaultTransport = 'http';
const supportedTransports = ['http'];
const transports = [defaultTransport].concat(supportedTransports).reduce((t, tName) => {
    t[tName] = require(tName);
    return t;
}, {});

module.exports = {
    defaultTransport,
    getByProtocol: (protocol) => {
        const tr = transports[protocol];
        if(!tr) {
            throw new Error(`Unsupported protocol "${protocol}"`);
        }

        return tr;
    },
};
