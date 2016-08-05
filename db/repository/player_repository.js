"use strict";

var Player = require("../models/player");
var PlayerRank = require("../models/player_rank");

var mongoose = require('mongoose');

function randomSample(sampleSize, level) {

	level = level || 0;

	console.log('HHH"');

	return PlayerRank.aggregate(
		{$match: {rank: {$gte: 10000 - 1000 * level}}},
		{$sample: {size: sampleSize}}
					 )
					 .then(function (players) {

						 let ids = [];

						 players.forEach(function (player) {

							 ids.push(player.id);

						 });


						 return Player.find()
									  .where("id").in(ids)
									  .select("-__v")
									  .lean();

					 });

}

function savePlayer(player) {

	var teams = [];

	player.teams.forEach(function (team) {

		let teamModel = {};

		teamModel.team = team.info.page;
		teamModel.start = team.years.start;
		teamModel.end = team.years.end;
		teamModel.loan = team.loan;
		teamModel.leagueStats = {
			"apps": team.leagueStats.apps,
			"goals": team.leagueStats.goals
		};

		teams.push(teamModel);

	});

	return new Player({
		id: player.id,
		name: player.name,
		fullname: player.fullname,
		position: player.position,
		placeOfBirth: player.birth_place,
		dateOfBirth: player.birth_date,
		teams: teams
	}).save();

}

function getById(id) {

	return Player.findOne({"_id": id}).lean();

}

module.exports.savePlayer = savePlayer;
module.exports.randomSample = randomSample;
module.exports.getById = getById;