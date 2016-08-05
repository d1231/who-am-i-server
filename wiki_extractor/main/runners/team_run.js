"use strict";

var Crawler = require('./../crawler');
var fetcher = require('./../fetcher');
var visitor = require('./../visitors/team-visitor');
var ON_DEATH = require('death');
let db = require('../../../db/db');
var fsp = require('fs-promise');

var crawler = new Crawler(fetcher, visitor);

fsp.readFile('../pages/premier_league clubs.json').then(function (data) {

	   var pages = JSON.parse(data);

	   pages = pages.slice(0, 1);


	   return db.init("mongodb://localhost/projectt");
   })
   .then(function () {

	   console.log("Successfully connected");

	   return crawler.startCrawling();

   })
   .then(function () {

	   console.log("Finished");
	   db.disconnect();
	   crawler.clean();

   })
   .catch(function (err) {

	   console.error(err);
	   db.disconnect();
	   crawler.clean();

   });

ON_DEATH(function (signal, err) {

	crawler.clean();

});

//});


//crawler.addPage("Robinho");
//
