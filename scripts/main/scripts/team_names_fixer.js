"use strict";

const db = require('../../../db/db');

let latinMap = require('../../../wiki_extractor/main/latinise_compact');

let fetcher = require('../fetcher.js');
let wikiParser = require('wtf_wikipedia');

let Team = require('../../../db/models/team');

String.prototype.latinise = function() {
    return this.replace(/[^A-Za-z0-9]/g, function(x) { return latinMap[x] || x; })
};

db.init("mongodb://localhost/whomi")
    .then(
        () => Team.find({}).limit()
    )
    .then(function(teams) {

        console.log("STARTING")

        let promises = [];

        for (let team of teams) {

            let names = new Set(team.names);

            for (let name of team.names) {
                names.add(name.latinise().replace(/\./g, ""));
            }

            if (names.size > team.names.length) {
                team.names = Array.from(names);
                promises.push(team.save());
                console.log(`Saved team ${team.id}`)
            }

        }

        return Promise.all(promises);

    })
    .then(function() {

        console.log("DONE");
        process.exit(0);

    })
    .catch(function(err) {
        console.error(err);
        process.exit(-1);
    })