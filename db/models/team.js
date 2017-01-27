var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var teamSchema = new Schema({

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

	names: [{
		type: String,
		index: true,
		text: true
	}],

	ground: {
		type: String
	},
	
	nation: {
		type: String,
		index: true,
		required: true
	},

	league: {
		type: String,
		index: true
	}
});

module.exports = mongoose.model("team", teamSchema);
