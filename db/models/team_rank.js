var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var teamRankSchema = new Schema({

	id: {
		type: String,
		require: true
	},

	rank: {
		type: Number,
		required: true
	},

	scheme: {
		type: String,
		required: true,
		index: true
	}

});

module.exports = mongoose.model("trank", teamRankSchema);
