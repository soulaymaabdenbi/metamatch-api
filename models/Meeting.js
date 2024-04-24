const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        // Check if the meeting date is not before today's date
        return value >= new Date();
      },
      message: 'La date de la réunion doit être aujourd\'hui ou dans le futur'
    }
  },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  description: {
    type: String,
  },
  confirmed: {
    type: Boolean,
    default: false  // Par défaut, la réunion n'est pas confirmée
  }

});

module.exports = mongoose.model('Meeting', meetingSchema);
