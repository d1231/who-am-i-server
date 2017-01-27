'use strict';

let i = 0;

const db = require('../../../db/db');

let fetcher = require('../fetcher.js');
var wikiParser = require('wtf_wikipedia');

let Team = require('../../../db/models/team');

db.init("mongodb://localhost/projectt-v2")
    .then(
        () => Team.find({
            names: /Chelsea/
        })
    )
    .then(function (teams) {

        teams = teams.slice(1, 2);

        for (let team of teams) {



            fetcher.fetch(team.id)
                .then(function (page) {

                    console.log(`Team: ${team.id} ${i++}`);
                    let wikiPage = wikiParser.parse(page.data);

                    let league = getTeamLeague(wikiPage, page);

                    console.log(league);

                    if (league) {

                        console.log(`Team: ${team.id}, league: ${league}, updating`);

                        team.league = league;

                        team.save().then(() => console.log("Saved")).catch((err) => console.error(err));
                    }


                })
                .catch(function (err) {
                    console.error(err);
                })

        }

    })
    .catch(function (err) {
        console.error(err);
    });

function getTeamLeague(wikiPage, page) {


    let leagueRegex = /\| *league *= *((?:\[\[|\{\{)(.*?)\|(.*?)(?:\]\]|\}\}))/;

    let matcher = leagueRegex.exec(page);

    return matcher[2];

}