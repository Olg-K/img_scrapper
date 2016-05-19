'use strict';

function getTs() {
    return (new Date()).toISOString();
}

module.exports = (name = '') => {
    const prefix = name ? `[${name}]` : name;
    return {
        log: (msg) => {
            process.stdout.write(`${getTs()} ${prefix}: ${msg}\n`);
        },
        debug: (...args) => this.log(...args),
        error: (msg) => {
            process.stderr.write(`${getTs()} ${prefix}: ${msg}`);
        },
    }
}