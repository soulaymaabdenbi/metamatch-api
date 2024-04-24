const mongo = require("mongoose");
const Schema = mongo.Schema;

const Match = new Schema({
  date: Date,
  time: String,
  location: String,
  teamA: String,
  teamB: String,
});

module.exports = mongo.model("match", Match);
