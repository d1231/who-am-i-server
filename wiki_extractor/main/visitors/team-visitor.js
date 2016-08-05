"use strict";

var wikiParser = require('my_wtf_wikipedia');

var Team = require('../../../db/models/team');

var leagueWeights = {
	"Championship": 50,
	"Premier League": 100,
	"MLS": 30,
	"Erdevise": 30,
	"UEFA Champions League": 100,
	"La Liga": 100,
	"Serie A": 100,
	"Bundesliga": 90,
	"Ligue 1": 80
};

function visit(crawler, page) {

	let wikiPage = wikiParser.parse(page.data);

	console.log(JSON.stringify(wikiPage));

	if (wikiPage.redirect) {
		crawler.addPage(wikiPage.redirect);
		return;
	}

	var ranks = [1];

	wikiPage.text.Intro.forEach(function (value) {

		if (!value.links) {
			return;
		}

		value.links.forEach(function (val) {

			let t1 = val.src || "";
			let weight = leagueWeights[t1];
			if (weight) {
				ranks.push(weight);
				return;
			}

			t1 = val.page || "";
			weight = leagueWeights[t1];
			if (weight) {
				ranks.push(weight);
			}

		});

	});

	var rank = numAvg(ranks);

	console.log(rank);

	return new Team({
		id: page.id,
		name: wikiPage.infobox.clubname.text,
		basicRank: rank

	}).save();

}

function numAvg(num) {
	var total = 0;
	var avg = 0;
	for (var i = 0; i < num.length; i++) {
		total += num[i];
	}
	return total / num.length;
}

module.exports.visit = visit;