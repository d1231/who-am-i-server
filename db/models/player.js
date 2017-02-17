var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var playerSchema = new Schema({

    wikiId: {
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
        type: Number,
        index: true,
        required: true
    },

    placeOfBirth: {
        type: String,
        index: true,
        required: true
    },

    position: {
        type: String
    },

    teams: [{

        team: {
            identifier: {
                type: String,
                index: true
            },
            text: {
                type: String,
                index: true,
                required: true
            },
            id: {
                type: String,
                index: true
            }
        },

        start: {
            type: Number,
            index: true
        },

        end: {
            type: Number,
            index: true
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
    }],

    startYear: {
        type: Number,
        index: true,
        required: true
    },

    endYear: {
        type: Number,
        index: true,
        required: true
    },

    nations: [{
        type: String,
        index: true
    }],

    serve: {
        type: Boolean,
        index: true,
        default: false
    }

});

module.exports = mongoose.model("player", playerSchema);