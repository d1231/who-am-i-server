let db = require('../db/db');

var fsp = require('fs-promise');

fsp.readFile('../pages/premier_league clubs.json').then(function (data) {

	var pages = JSON.parse(data);



	return db.init("mongodb://localhost/projectt");

})
