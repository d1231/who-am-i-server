"use strict";

var fs = require("fs");
var winston = require("winston");

class PlayerErrorHandler {


	constructor(errorFilePath) {
		this.errorFilePath = errorFilePath;
		this.faultedPages = [];
	}

	onEnd() {

		if (!this.faultedPages) {
			return;
		}

		const data = JSON.stringify(this.faultedPages);
		fs.writeFile(this.errorFilePath, data, function (err) {

			if (err) {
				winston.error(err);
			} else {
				winston.info("Successfully wrote faulted pages");
			}

		})
	}

	pageFault(faultedPage, err) {

		if (err.message.startsWith("E11000")) {
			return;
		}

		this.faultedPages.push(faultedPage);
	}

}

module.exports = function (path) {
	return new PlayerErrorHandler(path);
};