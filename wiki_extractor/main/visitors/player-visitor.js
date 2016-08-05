"use strict";

var wikiParser = require('my_wtf_wikipedia');

var PlayerRepo = require('../../../db/repository/player_repository');

function parseDates(years) {

    years = String(years);

    let sep = Math.max(years.indexOf("–"), years.indexOf("-"));

    let start;
    let end;

    if (sep > 0) {

        let sVal = years.substring(0, sep);

        start = !Number.isNaN(sVal) ? Number(sVal) : 0;

        sVal = years.substring(sep + 1);
        end = !Number.isNaN(sVal) ? Number(sVal) : 0;

    } else {
        start = !Number.isNaN(years) ? Number(years) : 0;
        end = start;
    }


    let retVal = {start: start, end: end};

    return retVal;
}

function visit(crawler, page) {

    let wikiPage = wikiParser.parse(page.data);

    let player = {
        id: page.id
    };

    player.name = wikiPage.infobox.name ? wikiPage.infobox.name.text : page.id;

    player.fullname = wikiPage.infobox.fullname ? wikiPage.infobox.fullname.text : player.name;
    player.birth_place = wikiPage.infobox.birth_place ? wikiPage.infobox.birth_place.text : "";
    player.birth_date = wikiPage.infobox.birth_date ? wikiPage.infobox.birth_date.text : "";
    player.position = wikiPage.infobox.position ? wikiPage.infobox.position.text : "";

    player.teams = [];
    player.nationalTeams = [];

    Object.keys(wikiPage.infobox)
          .filter(function (value) {

              return value.startsWith("clubs");

          })
          .forEach(function (key) {

              let clubNum = key.substring(5);

              let teamInfo = wikiPage.infobox[key];

              let team = teamInfo.links;

              if (!team) {
                  team = [teamInfo.text];
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

    return PlayerRepo.savePlayer(player);

}

module.exports.visit = visit;