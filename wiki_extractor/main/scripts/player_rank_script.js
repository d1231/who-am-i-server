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

db.init("mongodb://localhost/projectt").then(function () {

	winston.info("Successfully connected");

	Player.find({}, function (err, players) {

		players.forEach(function (player) {

			if (player.teams.length === 0) {
				return;
			}

			Rx.Observable.from(player.teams)
			  .flatMap(function (team) {

				  return Rx.Observable.fromPromise(Team.findOne({id: team.team}).then(function (team2) {

					  return Promise.resolve({
						  t1: team,
						  t2: team2
					  });

				  }));

			  })
			  .map(function (team) {

				  let basicRank;
				  if (team.t2) {
					  basicRank = team.t2.basicRank || 1;
				  } else {
					  basicRank = 1;
				  }

				  basicRank *= team.t1.leagueStats.apps;

				  return basicRank;

			  }).reduce(function (acc, val) {

				  acc = acc || 0;
				  return acc + val;

			  })
			  .subscribe(function (t) {

				  new PlayerRank({
					  rank: t,
					  id: player.id
				  }).save();
			  });

		});

	});

});
