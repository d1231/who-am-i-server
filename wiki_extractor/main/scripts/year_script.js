"use strict";

/**
 * 
 * Script for updating for each player it's active years
 * 
 */

const winston = require('winston');
const db = require('../../../db/db');
const Player = require('../../../db/models/player');

db.init("mongodb://localhost/whomi").then(function () {

	  winston.info("Successfully connected");


	  return Player.find({}).lean();


  })
  .then(function (players) {

	  let promises = [];

	  for (let player of players) {

		  if (player.endYear >= 0) {
			  //winston.info(player + " already have startYear");
			  continue;
		  }

		  let teams = player.teams;

		  let t = {};

		  while (t && (!t.end) && teams) {
			  t = teams.pop();
		  }

		  let endYear;
		  if (t) {
			  endYear = t.end;
		  } else {

			  endYear = 0;

			  winston.error("Error with: " + player.name);
		  }

		  let promise = Player.findByIdAndUpdate(player._id, {$set: {"endYear": endYear}});
		  promises.push(promise);

	  }

	  return Promise.all(promises);
  })
  .then(function () {
	  db.disconnect();
	  winston.info("Successfully disconnected");
  })
  .catch(function (err) {
	  winston.error(err);
	  db.disconnect();
  });
