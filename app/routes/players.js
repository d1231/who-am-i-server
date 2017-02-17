"use strict";

const DEFAULT_SAMPLE = 5;

const ALL_NATIONS = ["ALL"];

var express = require('express');

var router = express.Router();

var playerRepo = require('../../db/repository/player_repository');

var config = require('../config/config');

let availableNations = config.availableNations;


router.post('/sample', function(req, res, next) {

    let size = DEFAULT_SAMPLE;

    let nations = req.body.nation || [];

    if (!validateNations(nations)) {
        res.status(400).json({
            error: {
                status: 400,
                message: "Unsupported Nation"
            }
        });
        return;
    }

    playerRepo.randomSample({
        nations: nations,
        size: size
    }).then(function(randomPlayers) {

        res.json(randomPlayers);

    }).catch(function(err) {

        res.status(500).json(err);

    });

});

router.get('/player/:id', function(req, res, next) {

    let id = req.params.id;

    playerRepo.getById(id).then(function(randomPlayer) {
        res.json(randomPlayer);
    }).catch(function(err) {

        res.status(500).json(err);

    });

});

module.exports = router;