"use strict";


/**
 * 
 * Basic ranking script
 * 
 */

var Rx = require('rx');
var db = require('./../../../db/db');

var Team = require('./../../../db/models/team');

var Player = require('./../../../db/models/player');

var PlayerRank = require('./../../../db/models/player_rank');

var teamRank = require('./team_ranker.1');

console.log("START")

db.init("mongodb://localhost/whomi").then(function() {

    Player.find({ serve: { $exists: false }, "teams.team.text": { $in: ["Barcelona"] } })
        .then(function(players) {

            console.log("STARTING PLAYERS")

            players.forEach(function(player) {

                if (player.teams.length === 0) {
                    return;
                }

                Rx.Observable.from(player.teams)
                    .flatMap(function(team) {

                        return Rx.Observable.fromPromise(Team.findOne({
                                _id: team.team.id
                            })
                            .then(function(team2) {

                                return {
                                    playerTeam: team,
                                    dbTeam: team2
                                };

                            }));

                    })
                    .map(function(teamData) {

                        let rank = 0;
                        if (teamData.dbTeam) {


                            rank = 0.05;

                            let dbTeam = teamData.dbTeam;

                            for (let name of dbTeam.names) {
                                if (teamRank[name]) {
                                    rank = teamRank[name];
                                }
                            }

                        }

                        if (rank <= 0.1) {
                            // console.log(`Missing ${teamData.playerTeam}`);
                        }

                        teamData.rank = rank;
                        return teamData;

                    })
                    .map(function(obj) {


                        let teamEnd = (obj.playerTeam.end || 2018);
                        let teamStart = obj.playerTeam.start || (teamEnd);
                        let numberOfYearsInTeam = teamEnd - teamStart + 1;

                        let finalTeamRank = (numberOfYearsInTeam * 15) * Math.pow(obj.rank, 3) +
                            (obj.playerTeam.leagueStats.apps / (Math.max(numberOfYearsInTeam - 1, 1))) * Math.pow(obj.rank, 4);

                        if (!obj.playerTeam.end || !obj.playerTeam.start) {
                            finalTeamRank = finalTeamRank / 4;
                        }

                        if (obj.playerTeam.leagueStats.apps <= 5) {
                            if (obj.playerTeam.leagueStats.apps === 0) {
                                finalTeamRank = finalTeamRank / 10;
                            } else {
                                finalTeamRank = finalTeamRank / 2.5;
                            }
                        }

                        if (obj.rank >= 0.8 && obj.playerTeam.leagueStats.goals >= 10) {
                            finalTeamRank *= 1000;
                        }

                        if (teamEnd <= 1995) {
                            finalTeamRank = finalTeamRank / 2;
                        }

                        if (teamEnd <= 1980) {
                            finalTeamRank = finalTeamRank / 500;
                        }

                        if (teamEnd > 2014) {
                            finalTeamRank = finalTeamRank * 1.5;
                        }



                        return finalTeamRank;

                    })
                    .reduce(function(acc, val) {

                        acc = acc || 0;
                        return acc + val;

                    })
                    .subscribe(function(rank) {

                        if (rank >= 50) {

                            console.log(`Player: ${player.wikiId} Rank: ${rank} `);
                            player.serve = true;
                            player.save();

                        } else {


                            if (rank >= 25) {
                                console.log(`Player: ${player.wikiId} Rank: ${rank} | NOT SERVED`);
                            }
                        }


                    }, function(err) {

                        console.log(err);

                    });

            });

        }).catch(function(err) {


            console.log(err)

        })

}).catch(function(err) {

    console.error(err);

    console.log("ERROR")

})