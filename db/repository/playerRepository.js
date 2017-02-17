"use strict";

var __base = "../../";

var config = require(__base + 'config/main');
var Player = require(__base + "db/models/player");
var PlayerRank = require(__base + "db/models/player_rank");

function sample(params) {

    let size = params.size || config['DEFAULT_SIZE'];
    let nations = params.nations;
    let endYear = params.endYear;

    let matchObject = { serve: true };

    if (nations && nations.length > 0) {
        matchObject.nations = { $in: nations };
    }

    if (endYear) {
        matchObject.endYear = { $gte: endYear };
    }

    return Player.aggregate([{ $match: matchObject }, { $sample: { size: size } }, {
            $project: {
                "_id": 1,
                "name": 1,
                "position": 1,
                "team": 1,
                "nations": 1,
                "startYear": 1,
                "endYear": 1
            }
        }])
        .then(function(players) {

            return players;

        });

}

function savePlayer(player) {

    var teams = [];

    player.teams.forEach(function(team) {

        let teamModel = {};

        teamModel.team = {
            identifier: team.info.page,
            text: team.info.src || team.info.page
        };
        teamModel.start = team.years.start;
        teamModel.end = team.years.end;
        teamModel.loan = team.loan;
        teamModel.leagueStats = {
            "apps": team.leagueStats.apps,
            "goals": team.leagueStats.goals
        };

        teams.push(teamModel);

    });

    if (teams.length === 0) {

        throw new Error("Empty teams");
    }

    return new Player({
        wikiId: player.id,
        name: player.name,
        fullname: player.fullname,
        position: player.position,
        placeOfBirth: player.birth_place,
        dateOfBirth: player.birth_date,
        teams: teams
    }).save();

}

function getById(wikiId) {

    return Player.findOne({ "wikiId": wikiId }).lean();

}

module.exports.savePlayer = savePlayer;
module.exports.sample = sample;
module.exports.getById = getById;