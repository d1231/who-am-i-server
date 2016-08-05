"use strict";

const DEFAULT_SAMPLE = 5;

var express = require('express');

var router = express.Router();

var player_repo = require('../../db/repository/player_repository');

router.get('/random_sample', function (req, res, next) {

	let size = req.query.size || DEFAULT_SAMPLE;

	player_repo.randomSample(size).then(function (randomPlayer) {
		res.json(randomPlayer);
	}).catch(function (err) {

		res.status(500).json(err);

	});

});

router.get('/player/:id', function (req, res, next) {

	let id = req.params.id;

	player_repo.getById(id).then(function (randomPlayer) {
		res.json(randomPlayer);
	}).catch(function (err) {

		res.status(500).json(err);

	});

});

module.exports = router;
