"use strict";

let db = require('../../../db/db');
var Crawler = require('./../crawler');
var fetcher = require('./../fetcher');
var visitor = require('./../visitors/player-visitor');
var ON_DEATH = require('death');

var crawler = new Crawler(fetcher, visitor);

//let arr = require('./pages/english_players');
//
//let pages = arr.map(function (page) {
//    return page.title;
//});

let pages = ["Gianfranco Zola"];

console.log(pages);


crawler.addPages(pages);

db.init("mongodb://localhost/projectt").then(function () {

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
