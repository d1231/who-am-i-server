'use strict';

const db = require('../../../db/db');

let fetcher = require('../fetcher.js');
var wikiParser = require('wtf_wikipedia');

let Team = require('../../../db/models/team');
let Player = require('../../../db/models/player');

let Rx = require('rx');

let i = 1;

Rx.Observable.fromPromise(db.init("mongodb://localhost/projectt-v2")
        .then(() => {
            return Player.find({}).limit(100);
        }))
    .flatMap(function (players) {

        return Rx.Observable.from(players);
    })
    .flatMap(function (player) {

        return updatePlayer(player);

    })
    .subscribe(function (player) {
        console.log(`Finished ${player.id}, number: ${i++}`);
    }, (err) => console.error(err), function () {

    });

function updatePlayer(player) {

    console.log(`Working on ${player.name}`);

    let teamsArr = player.teams.map((team) => team.team);

    let playerNationsArr = player.nations || [];
    let playersNations = new Set(playerNationsArr);

    return Rx.Observable.onErrorResumeNext(Rx.Observable.from(teamsArr)
            .flatMap(function (team) {

                return updatePlayerFromTeam(team, player, playersNations);

            }), Rx.Observable.just())
        .last()
        .flatMap(function () {
            player.nations = Array.from(playersNations);
            return Rx.Observable.fromPromise(player.save())
                .flatMap(function () {
                    console.log(`Saved ${player.name}`);
                    return Rx.Observable.just(player);
                });
        });



}

function updatePlayerFromTeam(team, player, playersNations) {

    return Rx.Observable.fromPromise(Team.find({
            names: team.identifier
        }).lean())
        .flatMap(function (teamsDb) {

            if (teamsDb.length !== 1) {
                throw new Error(`Found only ${teamsDb.length} for ${team}`);
            }

            let teamDb = teamsDb[0];

            if (teamsDb.nation === "Unknown") {
                throw new Error(`No nation for ${team}`)
            }

            team.id = teamDb._id;
            playersNations.add(teamDb.nation);

            return Rx.Observable.just();
        });

}