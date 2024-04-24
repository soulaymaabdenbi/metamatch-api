// const mongo = require("mongoose");
// const Schema = mongo.Schema;

// const Session = new Schema({
//   _id: mongoose.Schema.Types.ObjectId,
//   date: Date,
//   time: String,
//   location: String,
//   topics: [String],
// });

// module.exports = mongo.model("session", Session);

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const SessionSchema = new Schema({
  date: Date,
  time: String,
  location: String,
  topics: [String],
});

module.exports = mongoose.model("Session", SessionSchema);
