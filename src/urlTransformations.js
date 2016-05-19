'use strict';

const Uri = require('jsuri');

function preset(sourceUrl) {
    if(!sourceUrl.getQueryParamValue('preset')) {
        return null;
    }

    const transformed = sourceUrl.clone();
    transformed.replaceQueryParam('preset', 'tt');
    return transformed;
}

function echoTransform(url) {
    return url;
}

module.exports = [
    preset,
    //echoTransform,
];