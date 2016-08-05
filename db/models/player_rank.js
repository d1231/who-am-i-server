var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var playerSchema = new Schema({

	id: {
		type: String,
		require: true,
		unique: true,
		id: true
	},

	rank: {
		type: Number,
		required: true
	}

});

module.exports = mongoose.model("prank", playerSchema);
