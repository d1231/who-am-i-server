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

db.init("mongodb://localhost/whomi").then(function() {

    console.log("LL");

    Player.find({}).limit(1).then(function(players) {

        console.log("FFF")

        console.log(players);

        players.forEach(function(player) {

            if (player.teams.length === 0) {
                return;
            }

            console.log(player);

            Rx.Observable.from(player.teams)
                .flatMap(function(team) {

                    cosnole.log("FFF")

                    return Rx.Observable.fromPromise(Team.findOne({
                        names: team.team
                    }).then(function(team2) {

                        return Promise.resolve({
                            playerTeam: team,
                            dbTeam: team2
                        });

                    }));

                })
                .map(function(teams) {

                    console.log(teams.playerTeam);

                    let rank = teamRank[teams.dbTeam.id] || 0.1;

                    return basicRank;

                }).reduce(function(acc, val) {

                    acc = acc || 0;
                    return acc + val;

                })
                .subscribe(function(t) {

                    //   new PlayerRank({
                    // 	  rank: t,
                    // 	  id: player.id
                    //   }).save();
                });

        });

    });

}).catch(function(err) {

    console.error(err);

})})
  .catch(function (err) {

	  winston.error(err);

	  disconnect();

  });