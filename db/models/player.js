var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var playerSchema = new Schema({

    id: {
        type: String,
        require: true,
        unique: true,
        id: true,
        index: true
    },

    name: {
        type: String,
        required: true
    },

    fullname: {
        type: String,
        required: true
    },

    dateOfBirth: {
        type: String,
        required: true
    },

    placeOfBirth: {
        type: String,
        required: true
    },

    position: {
        type: String
    },

    teams: [{

        team: {
            type: String
        },

        start: {
            type: Number
        },

        end: {
            type: Number
        },

        loan: {
            type: Boolean
        },

        leagueStats: {
            apps: {
                type: Number
            },
            goals: {
                type: Number
            }
        }
    }]

});

module.exports = mongoose.model("player", playerSchema);
