'use strict';


var client = require('football-api-client')();

var comps = [{
    id: 426,
    caption: 'Premier League 2016/17'
}, {
    id: 427,
    caption: 'Championship 2016/17'
}, {
    id: 428,
    caption: 'League One 2016/17'
}, {
    id: 430,
    caption: '1. Bundesliga 2016/17'
}, {
    id: 431,
    caption: '2. Bundesliga 2016/17'
}, {
    id: 432,
    caption: 'DFB-Pokal 2016/17'
}, {
    id: 433,
    caption: 'Eredivisie 2016/17'
}, {
    id: 434,
    caption: 'Ligue 1 2016/17'
}, {
    id: 435,
    caption: 'Ligue 2 2016/17'
}, {
    id: 436,
    caption: 'Primera Division 2016/17'
}, {
    id: 437,
    caption: 'Liga Adelante 2016/17'
}, {
    id: 438,
    caption: 'Serie A 2016/17'
}, {
    id: 439,
    caption: 'Primeira Liga 2016/17'
}, {
    id: 440,
    caption: 'Champions League 2016/17'
}, {
    id: 394,
    caption: '1. Bundesliga 2015/16'
}, {
    id: 395,
    caption: '2. Bundesliga 2015/16'
}, {
    id: 396,
    caption: 'Ligue 1 2015/16'
}, {
    id: 397,
    caption: 'Ligue 2 2015/16'
}, {
    id: 398,
    caption: 'Premier League 2015/16'
}, {
    id: 399,
    caption: 'Primera Division 2015/16'
}, {
    id: 400,
    caption: 'Segunda Division 2015/16'
}, {
    id: 401,
    caption: 'Serie A 2015/16'
}, {
    id: 402,
    caption: 'Primeira Liga 2015/16'
}, {
    id: 403,
    caption: '3. Bundesliga 2015/16'
}, {
    id: 404,
    caption: 'Eredivisie 2015/16'
}, {
    id: 405,
    caption: 'Champions League 2015/16'
}, {
    id: 425,
    caption: 'League One 2015/16'
}];

let map = new Map();

var promiseArr = [];

function doWork() {

    for (let comp of comps) {

        var p = client.getCompetitionById(comp.id).getTeams().then(function (res) {

            for (let team of res.data.teams) {

                let arr = map[team.name];

                if (!arr) {
                    arr = [];
                    map[team.name] = arr;
                }

                arr.push(comp.caption);
            }

        });

        promiseArr.push(p);
    }
}

doWork();

Promise.all(promiseArr).then(function (l) {
    console.log(map);
    console.log("HI")
})
