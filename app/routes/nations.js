"use strict";

const __base = '../../';

var express = require('express');

var router = express.Router();

var config = require(__base + 'config');


router.get('/', function (req, res) {

    res.status(200).json(Array.from(config["AVAILABLE_NATIONS"]));

});

module.exports = router;