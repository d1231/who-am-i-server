'use strict';

var fsp = require('fs-promise');

var winston = require('winston');

const VISITED_LIST = 'visited.list';

class Crawler {

	constructor(fetcher, visitor, options) {
		this.pageFetcher = fetcher;
		this.visitor = visitor;
		options = options || {};
		this.errorHandler = options.errorHandler;
		this.skipDuplicates = options.skipDuplicates;
		this.pageQueue = [];
		this.visited = new Set();
	}

	startCrawling() {

		var crawler = this;

		return fsp.readFile(VISITED_LIST)
			.then(function (data) {

				return new Promise(function (resolve, reject) {

					function crawlingWrapper(resolve, reject) {

						if (crawler.pageQueue.length == 0) {
							return resolve();
						}


						const pageStruct = crawler.pageQueue.pop();

						const page = pageStruct.page;

						const duplicate = crawler.visited.has(page);

						pageStruct.data.duplicate = duplicate;

						if (duplicate && crawler.skipDuplicates) {;
							winston.info("Skipping: " + page);
							crawlingWrapper(resolve);
							return;
						}

						winston.info(page);

						crawler.pageFetcher.fetch(page)
							.then(function (res) {

								return crawler.visitor.visit(crawler, {
									data: res,
									metadata: pageStruct.data,
									id: page
								});

							})
							.then(function () {

								crawler.visited.add(page);
								crawlingWrapper(resolve);

							})
							.catch(function (err) {

								winston.error(err);
								winston.error("Error page: " + page);

								if (crawler.errorHandler) {
									crawler.errorHandler.pageFault(page, err);
								}


								crawlingWrapper(resolve);

							});

					}

					crawlingWrapper(resolve, reject);

				});

			});
	}

	addPage(page, data) {

		data = data || {};

		this.pageQueue.push({
			page: page,
			data: data
		});

	}

	addPages(pages) {

		this.pageQueue = this.pageQueue.concat(pages.map(function (page) {
			return {
				page: page,
				data: {}
			}
		}));

	}

	clean() {

		let visitedArr = Array.from(this.visited);
		let data = JSON.stringify(visitedArr);
		fsp.writeFile(VISITED_LIST, data);

		const errorHandler = this.errorHandler;
		if (errorHandler) {
			errorHandler.onEnd();
		}

	}

}

module.exports = Crawler;