"use strict";

const db = require('../../../db/db');
const Crawler = require('./../crawler');
const fetcher = require('./../fetcher');
const winston = require('winston');
const visitor = require('./../visitors/team-visitor');
const commandLineArgs = require('command-line-args');
const ErrorHandler = require("../error_handlers/page_error_handler");
const fs = require('fs');

initWinston();

let cmdArgs = initCommandLineArgs();

let crawler = initCrawler();

runCrawler();


function initWinston() {
	winston.add(winston.transports.File, {
		level: "error",
		filename: "log.err"
	});
}


function initCommandLineArgs() {
	const argsOptions = [{
		name: "pages",
		alias: "p",
		multiple: true,
		type: String,
		defaultValue: []
	}, {
		name: "fpp",
		"alias": "f",
		multiple: false,
		type: String,
		defaultValue: "logs/teamsfaultedPages.log"
	}];

	return commandLineArgs(argsOptions);
}

function initCrawler() {

	let errorHandler = ErrorHandler(cmdArgs.fpp);

	let crawler = new Crawler(fetcher, visitor, {
		skipDupilcates: false,
		errorHandler: errorHandler
	});

	cmdArgs.pages.forEach(function (pagesPath) {

		let pages = JSON.parse(fs.readFileSync(pagesPath));


		crawler.addPages(pages);


	});
	return crawler;
}


function runCrawler() {

	db.init("mongodb://localhost/projectt-v2")
		.then(function () {

			winston.info("Successfully connected");

			return crawler.startCrawling();
		})
		.then(function () {

			winston.info("Finished");
			db.disconnect();
			crawler.clean();

		})
		.catch(function (err) {

			winston.error(err);
			db.disconnect();
			crawler.clean();

		});

}