'use strict';

const Promise = require('bluebird');
const cheerio = require('cheerio');
const Uri = require('jsuri');
const logger = require('./logger')('page_scrapper');
const transports = require('./transports');


function toUrl(urlString, pageProtocol = 'http') {
    const url = new Uri(urlString);
    if(!url.protocol()) {
        url.protocol(pageProtocol);
    }

    return url;
}

function parseAttributes(pageBuffer, attrName = 'src', selector = '') {
    const $ = cheerio.load(pageBuffer);
    const nodesBySelector = $(selector);
    const vals = [];
    let i = 0;
    let node;
    while(node = nodesBySelector[i++]) {
        const attrValue = node.attribs[attrName]
        if(!attrValue) {
            continue
        }

        vals.push(attrValue);
    }

    return vals;
}

function scrapPage(targetUrl) {
    const url = new Uri(targetUrl);
    const protocol = url.protocol();
    const transport = transports.getByProtocol(protocol);
    return new Promise((resolve, reject) => {
        transport.get(url.toString(), (res) => {
            //console.log(res.headers);
            const length = parseInt(res.headers['content-length']);
            const buffer = new Buffer(length);
            let offset = 0;
            res.on('data', (chunk) => {
                chunk.reduce((b, c) => {
                    return buffer.fill(c, offset++, offset);
                }, buffer);
            })
            .on('end', () => {
                resolve({ buffer, protocol });
            })
            .on('error', (err) => {
                reject(err);
            });
        });
    });
}

module.exports = {
    parseImgSources: ({targetUrl, selector}) => {
        logger.log(`started "${targetUrl}". Additional filter "${selector}"`);
        return scrapPage(targetUrl)
            .then(({ buffer, protocol }) => {
                const urls = parseAttributes(buffer, 'src', selector).map((src) => toUrl(src, protocol));
                logger.log(`finished "${targetUrl}". Additional filter "${selector}"`);
                logger.log(`found ${urls.length} on ${targetUrl}\n${urls.map((u) => u.toString()).join('\n')}`);
                return urls;
            });
    }
}