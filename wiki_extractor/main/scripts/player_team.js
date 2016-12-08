'use strict';

/**
 * 
 * Script to append teams id and nations to each player
 * 
 */

const db = require('../../../db/db');

let fetcher = require('../fetcher.js');
var wikiParser = require('wtf_wikipedia');

let Team = require('../../../db/models/team');
let Player = require('../../../db/models/player');

let Rx = require('rx');

let i = 1;

Rx.Observable.fromPromise(db.init("mongodb://localhost/projectt-v2")
        .then(() => {
            return Player.find({}).sort({
                name: 1
            }).skip(0).batchSize(1000);
        }))
    .concatMap(function (players) {

        return Rx.Observable.from(players);
    })
    .concatMap(function (player) {

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
            .concatMap(function (team) {

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

    // cleanTeamName(team);

    return Rx.Observable.zip(
            Rx.Observable.fromPromise(Team.find({
                names: team.identifier
            }).lean()),
            Rx.Observable.fromPromise(Team.find({
                names: team.text
            }).lean()))
        .concatMap(function (result) {

            let teamsDb;
            if (result[0].length == 0) {
                teamsDb = result[1];
            } else {
                teamsDb = result[0];
            }


            let teamDb;
            if (teamsDb.length !== 1) {
                console.error(`Found ${teamsDb.length} for ${team}, player id=${player._id}`);

                let gT = null;
                for (let t of teamsDb) {
                    if (gT && t.nation !== gT) {
                        gT = null;
                        break;
                    }
                    gT = t.nation;
                }

                if (gT) {
                    playersNations.add(gT);
                }

                return Rx.Observable.just();
            } else {
                teamDb = teamsDb[0];
            }

            if (teamDb.nation === "Unknown") {
                console.error(`No nation for ${team}, player id=${player._id}`);
                return Rx.Observable.just();
            }

            team.id = teamDb._id;
            playersNations.add(teamDb.nation);

            return Rx.Observable.just();
        });

}

function cleanTeamName(team) {

    let cleanIdentifier = team.identifier.replace(/\\'/, "'")
    team.identifier = cleanIdentifier;

    let cleanName = team.name.replace(/\\'/, "'");
    team.name = cleanName;
}