'use strict';

var fsp = require('fs-promise');

var winston = require('winston');

const VISITED_LIST = 'visited.list';

class Crawler {

	constructor(fetcher, visitor, errorHandler) {
		this.pageFetcher = fetcher;
		this.visitor = visitor;
		this.errorHandler = errorHandler;
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
								  winston.info("Skipping: " + page);
								  crawlingWrapper(resolve);
								  return;
							  }

							  winston.info(page);

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

		const errorHandler = this.errorHandler;
		if (errorHandler) {
			errorHandler.onEnd();
		}

	}

}

module.exports = Crawler;