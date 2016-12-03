"use strict";

var wikiParser = require('my_wtf_wikipedia');

var Team = require('../../../db/models/team');

let savedTeams = [];

let nations = new Set(["Italy", "England", "France", "Spain", "Israel", "Switzerland", "Netherlands", "Croatia", "Germany", "Portugal", "Austria", "Ukraine", "Russia",
	"Slovakia", "Slovenia", "Cyprus", "Finland", "Belarus", "USA", "Canada", "Mexico", "Chile", "Colombia", "Paraguay", "Uruguay", "Serbia", "Wales", "Ireland",
	"Norway", "Sweden", "Denmark", "Brazil", "Argentina", "Bosnia and Herzogovina", "Scotland", "Iran", "Iraq", "New Zealand", "Australia", "Romania", "Hungary",
	"Bulgaria", "Turkey", "Greece", "Belgium", "Japan", "China", "Iceland", "Poland", "Armenia", "Egypt", "South Africa", "India", "Bolivia", "Kazakhstan",
	"Latvia", "Albania", "Northern Ireland", "Estonia", "Lithuania", "Montenegro", "Moldova", "Malta", "Azerbaijan", "Andorra", "South Korea", "Ghana",
	"Ivory Coast", "Saudi Arabia", "Georgia"
]);



function getTeamNation(wikiPage) {

	for (let cat of wikiPage.categories) {
		if (cat.startsWith("Football clubs in ")) {
			let nation = cat.replace("Football clubs in ", "");
			if (nations.has(nation)) {
				return nation;
			}
		}
	}

	for (let nation of nations) {
		for (let cat of wikiPage.categories) {
			if (cat.indexOf(nation) >= 0) {
				console.log("Found nation with: " + cat);
				return nation;
			}
		}
	}

	let introText = wikiPage.text.Intro[0].text;

	for (let nation of nations) {
		if (introText.indexOf(introText) >= 0) {
			console.log("Found nation from introText: " + introText);
			return nation;
		}
	}

}

function saveTeam(wikiPage, page) {

	let clubNation = getTeamNation(wikiPage);

	if (!clubNation) {
		throw new Error("Could find nation for : " + page.id);
	}

	let metadata = page.metadata;

	if (!wikiPage.infobox || Object.keys(wikiPage.infobox).length === 0) {
		throw new Error("No infomation for : " + page.id);
	}

	let names = new Set(metadata.additionalNames.concat(page.id));
	if (wikiPage.infobox.clubname && wikiPage.infobox.clubname.text) {
		names.add(wikiPage.infobox.clubname.text);
	}

	if (wikiPage.infobox.fullname && wikiPage.infobox.fullname.text) {
		names.add(wikiPage.infobox.fullname.text);
	}

	let ground;
	if (wikiPage.infobox.ground) {
		ground = wikiPage.infobox.ground.text;
	}

	return new Team({
			id: page.id,
			name: page.id,
			names: Array.from(names),
			ground: ground,
			nation: clubNation
		})
		.save();
}



function updateTeam(id, names) {

	if (!names) {
		return;
	}

	return Team.update({
		id: id
	}, {
		$push: {
			names: {
				$each: names
			}
		}
	});
}

function visit(crawler, page) {

	let wikiPage = wikiParser.parse(page.data);

	let metadata = page.metadata || {};
	metadata.additionalNames = metadata.additionalNames || [];

	if (wikiPage.redirect) {

		metadata.additionalNames.push(page.id);
		crawler.addPage(wikiPage.redirect, metadata);
		return;

	}

	return Team.findOne({
			id: page.id
		})
		.then(function (team) {

			if (team) {

				let names = team.names.concat(metadata.additionalNames);
				names = new Set(names);
				team.names = Array.from(names);
				return team.save();
			} else {
				return saveTeam(wikiPage, page);
			}

		})
		.catch(function (err) {

			console.error(err);
		});

}

module.exports.visit = visit;