'use strict';

const logger = require('./src/logger')();
const config = require('./src/configuration');
const scrapper = require('./src/scrapper');
const downloader = require('./src/fileDownloader');
const urlTranformations = require('./src/urlTransformations');

Promise.all([
        scrapper.parseImgSources({ targetUrl: config.scrap, selector: config.imgFilter }),
        downloader.prepareDir(config.out)
    ])
    .then(([urls,]) => {
        const allUrls = urls.reduce((transformed, url) => {
            transformed.push(...urlTranformations.map((transform) => transform(url)).filter(u => !!u));
            return transformed;
        }, []);

        logger.log(`total image number to download ${allUrls.length}`);
        return downloader.downloadAll(allUrls, config.out);
    })
    .then(() => { process.exit(); }, (err) => {
        logger.error(err.message);
        process.exit(1);
    });
