'use strict';

var bot = require('nodemw');

var client = new bot({
    server: 'en.wikipedia.org', // host name of MediaWiki-powered site
    path: '/w', // path to api.php script
    debug: false // is more verbose when set to true
});

class WikipediaFetcher {

    constructor() {

    }

    fetch(page) {

        return new Promise(function (resolve, reject) {

            try {
                client.getArticle(page, function (err, data) {

                    if (err) {
                        return reject(err);
                    }

                    resolve(data);

                });
            } catch (e) {

                reject(e);
                
            }

        });

    }

    links(page) {

        return new Promise(function (resolve, reject) {

            client.getPagesInCategory(page, function (err, data) {

                if (err) {
                    return reject(err);
                }

                resolve(data);

            });

        });

    }

}

module.exports = new WikipediaFetcher();