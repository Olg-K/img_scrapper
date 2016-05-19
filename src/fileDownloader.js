'use strict';

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const transports = require('./transports');
const Uri = require('jsuri');
const isString = require('lodash/isString');
const isArray = require('lodash/isArray');
const logger = require('./logger')('file_downloader');


function nameFromPath(url) {
    if(isString(url)) {
        url = new Uri(url);
    }

    return url.path().replace(/\//g, '_');
}

function cleanDir(location) {
    return fs.readdirAsync(location)
        .then((fileNames) => {
            return Promise.all(fileNames.map((fName) => {
                const fullLoc = path.join(location, fName);
                return fs.statAsync(fullLoc)
                    .then((stat) => {
                        if(stat.isDirectory()) {
                            return cleanDir(fullLoc);
                        }

                        return fs.unlinkAsync(fullLoc);
                    });
            }));
        })
        .then(() => fs.rmdirAsync(location));
}

function prepareDir(outDir) {
    return fs.statAsync(outDir)
        .then((stat) => {
            if(!stat.isDirectory()) {
                throw new Error(`Invalid download folder: ${outDir}`);
            }

            return cleanDir(outDir);
        }, (err) => {
            if(err.code !== 'ENOENT') {
                throw err;
            }

            logger.log(`Folder does not exist, creating ${outDir}`);
            // return grabDir;
        })
        .then(() => {
            return fs.mkdirAsync(outDir);
        });
}

function downloadOne(url, outDir, getFileName = nameFromPath) {

    const fileLocation = path.join(outDir, getFileName(url));
    const transport = transports.getByProtocol(url.protocol());
    logger.log(`started "${fileLocation}" from "${url.toString()}"`);

    return new Promise((resolve, reject) => {
        transport.get(url.toString(), res => {
            const fileStream = fs.createWriteStream(fileLocation);
            //logger.log(`file stream created "${fileLocation}"`);
            res.on('data', (chunk) => {
                fileStream.write(chunk);
            })
            .on('end', () => {
                fileStream.end();
                logger.log(`finished "${fileLocation}"`);
                resolve();
            })
            .on('error', (err) => {
                logger.error(`cannot write to "${fileLocation}": ${err.message}`);
                reject(err);
            });
        });
    });

}

const downloader = {
    prepareDir,
    downloadOne,
    downloadAll: (urls, outDir, delay = 0) => {
        if(!isArray(urls)) {
            return Promise.reject(new Error('Invalid url collection'));
        }

        urls = urls.slice();
        let resolve, reject;
        let wait = new Promise((res, rej) => { resolve = res; reject = rej; });
        const nextTick = () => {
            const url = urls.pop();
            if(!url) {
                logger.log('all finished');
                resolve();
                return;
            }

            downloadOne(url, outDir)
                .finally(() => {
                    if(delay) {
                        setTimeout(nextTick, delay);
                        return;
                    }

                    nextTick();
                })
        }

        prepareDir(outDir).then(nextTick);
        return wait;
    }
}

module.exports = downloader;