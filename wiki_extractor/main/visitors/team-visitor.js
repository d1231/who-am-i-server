"use strict";

var wikiParser = require('my_wtf_wikipedia');

var Team = require('../../../db/models/team');

class TeamVisitor {

	constructor(based) {
		this.based = based;
	}

	visit(crawler, page) {

		let wikiPage = wikiParser.parse(page.data);

		if (wikiPage.redirect) {
			crawler.addPage(wikiPage.redirect);
			return;
		}

		console.log(wikiPage);

		return new Team({

		})

	}

}

module.exports.visit = function (teamBased) {


};