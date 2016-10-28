"use strict";

var wikiParser = require('my_wtf_wikipedia');

var PlayerRepo = require('../../../db/repository/player_repository');

function getKeysStartingWith(object, searchString) {

	return Object.keys(object)
				 .filter(function (value) {

					 return value.startsWith(searchString);

				 });
}

function parseDates(years) {

	years = String(years);

	years = years.trim();

	years = years.replace("&ndash;", "-");

	let sep = Math.max(years.indexOf("–"), years.indexOf("-"));

	let start;
	let end;

	if (sep > 0) {

		let sVal = years.substring(0, sep);
		start = safeNumber(sVal);

		sVal = years.substring(sep + 1);
		end = safeNumber(sVal);

	} else {

		start = safeNumber(years);
		end = start;
	}

	//start = Number.isNaN(start) ? 0 : start;
	//end = Number.isNaN(end) ? 0 : end;

	return {start: start, end: end};
}
function getPlayerBirthplace(wikiPage) {

	if (wikiPage.infobox.birth_place) {

		const birthPlace = wikiPage.infobox.birth_place.text;

		const commaIndex = birthPlace.indexOf(",");

		if (commaIndex > 0) {
			return birthPlace.substring(commaIndex + 1).trim();
		} else {
			return birthPlace;
		}

	} else {
		return "UNKNOWN";
	}
}
function safeNumber(val) {

	if (!Number.isNaN(Number(val))) {
		return Number(val);
	} else {
		return 0;
	}

}
function getPlayerBirthDate(wikiPage) {

	if (wikiPage.infobox.birth_date) {

		let birthDateRaw = wikiPage.infobox.birth_date.text;

		if (Number.isInteger(birthDateRaw)) {
			return birthDateRaw;
		}

		if (birthDateRaw.indexOf("Birth date and age") >= 0) {

			const splitted = birthDateRaw.split('|');

			let base = splitted.length > 4 ? 1 : 0;

			let birthDate = new Date();

			birthDate.setDate(splitted[base + 3]);
			birthDate.setMonth(splitted[base + 2]);
			birthDate.setYear(splitted[base + 1]);

			return Number(splitted[base + 1]);

		} else {

			var re = /[\d]{4}/;

			const matched = birthDateRaw.match(re);

			if (matched) {
				return matched[0];
			} else {
				return -1;
			}


		}


	} else {
		return -1;
	}
}

function parseTeams2(wikiPage, player) {

	const teamsArray = getKeysStartingWith(wikiPage.infobox, "years");

	teamsArray.forEach(function (key) {

		let info = wikiPage.infobox[key];

		let team = info.links;

		let data = info.text.split('|');


		let loan = data[1].indexOf("(loan)") >= 0;

		let parsedYears = parseDates(data[0]);

		let leagueApps = safeNumber(data[2].substring(data[2].indexOf('=') + 1).trim());
		let leagueGoals = safeNumber(data[3].substring(data[3].indexOf('=') + 1).trim());

		player.teams.push({
			"info": team[0],
			"years": {
				start: parsedYears.start,
				end: parsedYears.end
			},
			"leagueStats": {
				"goals": leagueGoals,
				"apps": leagueApps
			},
			"loan": loan
		});
	});

}
function parseTeams(wikiPage, player) {

	player.teams = [];

	const teamsArray = getKeysStartingWith(wikiPage.infobox, "clubs");

	if (teamsArray.length === 0) {
		parseTeams2(wikiPage, player);
	}

	teamsArray
		.forEach(function (key) {

			let clubNum = key.substring(5);

			let teamInfo = wikiPage.infobox[key];

			let team = teamInfo.links;

			if (!team) {
				team = [{
					src: teamInfo.text,
					page: ""
				}];
			}

			let loan = teamInfo.text.indexOf("(loan)") >= 0;

			let parsedYears;
			if (wikiPage.infobox["years" + clubNum]) {
				let years = wikiPage.infobox["years" + clubNum].text;
				parsedYears = parseDates(years);
			} else {
				parsedYears = {
					start: 0, end: 0
				};
			}

			let leagueApps = wikiPage.infobox["caps" + clubNum] ? wikiPage.infobox["caps" + clubNum].text : 0;
			leagueApps = Number.isSafeInteger(leagueApps) ? leagueApps : 0;

			let leagueGoals = wikiPage.infobox["goals" + clubNum] ? wikiPage.infobox["goals" + clubNum].text : 0;
			leagueGoals = Number.isSafeInteger(leagueGoals) ? leagueGoals : 0;

			player.teams.push({
				"info": team[0],
				"years": {
					start: parsedYears.start,
					end: parsedYears.end
				},
				"leagueStats": {
					"goals": leagueGoals,
					"apps": leagueApps
				},
				"loan": loan
			});


		});
}

function parseNationalTeams(wikiPage, player) {

	player.nationalTeams = [];

	Object.keys(wikiPage.infobox)
		  .filter(function (value) {

			  return value.startsWith("nationalteam");

		  })
		  .forEach(function (key) {

			  let nationalTeamNum = key.substring(12);

			  let nationalTeamInfo = wikiPage.infobox[key];

			  if (!nationalTeamInfo.links || !nationalTeamInfo.text) {
				  return;
			  }

			  let team = nationalTeamInfo.links;

			  let parsedYears;
			  if (wikiPage.infobox["nationalyears" + nationalTeamNum]) {
				  let years = wikiPage.infobox["nationalyears" + nationalTeamNum].text;
				  parsedYears = parseDates(years);
			  } else {
				  parsedYears = {
					  start: 0, end: 0
				  };
			  }


			  let caps = wikiPage.infobox["nationalcaps" + nationalTeamNum] ? wikiPage.infobox["nationalcaps" + nationalTeamNum].text : "";
			  let goals = wikiPage.infobox["nationalgoals" + nationalTeamNum] ? wikiPage.infobox["nationalgoals" + nationalTeamNum].text : "";

			  player.nationalTeams.push({
				  "info": team[0],
				  "years": {
					  start: parsedYears.start,
					  end: parsedYears.end
				  },
				  "stats": {
					  "goals": goals,
					  "apps": caps
				  }
			  });

		  });
}
function visit(crawler, page) {

	let wikiPage = wikiParser.parse(page.data);

	let player = {
		id: page.id
	};

	player.name = wikiPage.infobox.name ? wikiPage.infobox.name.text : page.id;

	player.fullname = wikiPage.infobox.fullname ? wikiPage.infobox.fullname.text : player.name;
	player.birth_place = getPlayerBirthplace(wikiPage);
	player.birth_date = getPlayerBirthDate(wikiPage);

	player.position = wikiPage.infobox.position ? wikiPage.infobox.position.text : "";

	parseTeams(wikiPage, player);
	parseNationalTeams(wikiPage, player);

	return PlayerRepo.savePlayer(player);

}

module.exports.visit = visit;