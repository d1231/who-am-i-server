'use strict';

/**
 * 
 * Script to remove duplicates teams
 * 
 */

let Team = require('../../../db/models/team');

let mergedTeams = new Set();

let Rx = require('rx');

let prompt = require('prompt-promise');


const db = require('../../../db/db');

db.init("mongodb://localhost/projectt-v2")
    .then(() => Team.find({}))
    .then(function (teams) {
        start(teams);
    });

function start(teams) {

    let i = 1;

    Rx.Observable.from(teams)
        .concatMap(function (team) {

            if (mergedTeams.has(team._id)) {
                return Rx.Observable.just(team);
            }

            return Rx.Observable.concat(
                    Rx.Observable.fromPromise(Team.find({
                        names: {
                            $in: team.names
                        }
                    }))
                    .concatMap(function (results) {
                        return Rx.Observable.from(results);
                    })
                    .filter(function (result) {
                        return !team._id.equals(result._id);
                    })
                    .filter(function (result) {
                        return team.nation === result.nation;
                    })
                    .filter(function (result) {
                        return team.ground === result.ground || (team.ground == undefined ^ result.ground == undefined);
                    })
                    .concatMap(function (result) {

                        return mergeTeams(team, result);

                    })
                    .concatMap(function (result) {
                        console.log(`"Successfully merged ${result.base.id} and ${result.ext.id}, removing ${result.ext.id}"`);
                        return Rx.Observable.just(1);
                    }),
                    Rx.Observable.just(team))
                .last();

        })
        .subscribe(function (team) {

            console.log(`Finished ${team.id} ${i++}`);

        }, function (err) {
            console.error("Error: " + err);
        }, function () {
            prompt.done();
        })

}

function mergeTeams(team, result) {

    return Rx.Observable.fromPromise(prompt(`Merge into: (a/1) ${team.id} or (b/2) ${result.id}: or any other key to skip`))
        .flatMap(function (choosed) {

            let options = {
                'a': [team, result],
                '1': [team, result],
                'b': [result, team],
                '2': [result, team]
            };

            if (options[choosed]) {
                return mergeTeamsInner(options[choosed][0], options[choosed][1]);
            }

            return Rx.Observable.empty();

        });

}


function mergeTeamsInner(base, ext) {

    console.log(`Merging ${ext.id} into ${base.id}`);

    let originalNames = new Set(base.names);
    let extNames = new Set(ext.names);

    for (let n of extNames) {
        originalNames.add(n);
    }

    base.names = Array.from(originalNames);

    mergedTeams.add(base._id);
    mergedTeams.add(ext._id);

    console.log("OKI")

    return Rx.Observable.zip(
            Rx.Observable.fromPromise(base.save()),
            Rx.Observable.fromPromise(Team.remove({
                _id: ext._id
            }))
        )
        .flatMap(function () {
            console.log("OKI")

            return Rx.Observable.just({
                base: base,
                ext: ext
            });
        });
}