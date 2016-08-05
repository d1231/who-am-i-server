"use strict";

var wikiParser = require('my_wtf_wikipedia');

let teamSet = new Set();
module.exports.teams = teamSet;

function visit(crawler, page) {

	let wikiPage = wikiParser.parse(page.data);

	Object.keys(wikiPage.infobox)
		  .filter(function (value) {

			  return value.startsWith("clubs");

		  })
		  .forEach(function (key) {

			  let teamInfo = wikiPage.infobox[key];

			  let team = teamInfo.links;


			  if (team) {
				  let pg = team[0].page;
				  teamSet.add(pg);
			  }


		  });

}

module.exports.visit = visit;