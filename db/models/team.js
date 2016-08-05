var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var playerSchema = new Schema({

	id: {
		type: String,
		require: true,
		unique: true,
		id: true
	},

	name: {
		type: String,
		index: true,
		required: true
	},

	basicRank: {
		type: Number,
		required: true
	}
});

module.exports = mongoose.model("team", playerSchema);
