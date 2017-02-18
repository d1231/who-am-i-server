"use strict";

const __base = '../../';

var express = require('express');

var router = express.Router();

var playerRepo = require(__base + 'db/repository/playerRepository');
var config = require(__base + 'config');
var validateNations = require(__base + 'app/utils/nationValidator');

router.post('/sample', function(req, res, next) {

    let size = config['DEFAULT_SIZE'];

    let body = req.body || {};
    let nations = body.nations || [];
    console.log(nations);
    let endYear = body.endYear || 2000;

    if (!validateNations(nations)) {
        res.status(400).json({
            error: {
                status: 400,
                message: "Unsupported Nation"
            }
        });
        return;
    }

    playerRepo.sample({
        nations: nations,
        endYear: endYear,
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