"use strict";


const winston = require('winston');
const db = require('../../../db/db');
const Player = require('../../../db/models/player');

let globalMap_text = new Map();
let globalMap_identifier = new Map();

let l = new Set();

function disconnect() {
	db.disconnect();
	winston.info("Successfully disconnected");
}

function updateCount(map, key) {
	let cnt = (map.get(key) || 0) + 1;
	map.set(key, cnt);
}

db.init("mongodb://localhost/projectt-v2").then(function () {

	  winston.info("Successfully connected");


	  return Player.find({}).lean();


  })
  .then(function (players) {

	  for (let player of players) {

		  for (let team of player.teams) {

			  team = team.team;

			  if (team.identifier === "") {
				  l.add(team.text);
			  }

			  updateCount(globalMap_text, team.text);
			  updateCount(globalMap_identifier, team.identifier);

		  }

	  }

	  console.log(l);

  })
  .then(function () {

	  let teams = globalMap_identifier.keys();

	  teams = Array.from(teams).sort(function (a, b) {

		  return -(globalMap_identifier.get(a) - globalMap_identifier.get(b));

	  });

	  teams = teams.map(function (team) {

		  var obj = {};

		  obj[team] = globalMap_identifier.get(team);

		  return obj;

	  });

	  //console.log(teams);

  })
  .then(function () {

	  disconnect();

  })
  .catch(function (err) {

	  winston.error(err);

	  disconnect();

  });