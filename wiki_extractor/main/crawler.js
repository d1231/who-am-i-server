'use strict';

var fsp = require('fs-promise');


const VISITED_LIST = 'visited.list';

class Crawler {

    constructor(fetcher, visitor) {
        this.pageFetcher = fetcher;
        this.visitor = visitor;
        this.pageQueue = [];
        this.visited = new Set();
    }

    startCrawling() {

        var crawler = this;

        return fsp.readFile(VISITED_LIST)
                  .then(function (data) {

                      crawler.visited = new Set(JSON.parse(data));

                      return new Promise(function (resolve, reject) {

                          function crawlingWrapper(resolve, reject) {

                              if (crawler.pageQueue.length == 0) {
                                  return resolve();
                              }


                              const page = crawler.pageQueue.pop();

                              if (crawler.visited.has(page)) {
                                  console.log("Skipping: " + page);
                                  crawlingWrapper(resolve);
                                  return;
                              }

                              console.log(page);

                              crawler.pageFetcher.fetch(page)
                                     .then(function (res) {

                                         return crawler.visitor.visit(crawler, {
                                             data: res,
                                             id: page
                                         });

                                     })
                                     .then(function () {


                                         crawlingWrapper(resolve);

                                     })
                                     .catch(function (err) {

                                         console.error(err);
                                         console.error("Error page: " + page);

                                         crawlingWrapper(resolve);

                                     });

                          }

                          crawlingWrapper(resolve, reject);

                      });

                  });
    }

    addPage(page) {

        this.pageQueue.push(page);

    }

    addPages(pages) {

        this.pageQueue = this.pageQueue.concat(pages);

    }

    clean() {

        let visitedArr = Array.from(this.visited);
        let data = JSON.stringify(visitedArr);
        fsp.writeFile(VISITED_LIST, data);

    }

}

module.exports = Crawler;