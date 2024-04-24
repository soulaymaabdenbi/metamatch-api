const mongoo = require('mongoose');
const { number } = require('yup');

const recoveryStatusEnum = ["In Progress", "Recovered", "In Rehabilitation"];

const injury = new mongoo.Schema({
  player_id: {
    type: mongoo.Schema.Types.ObjectId , // Utilisez ObjectId comme type pour la clé étrangère
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  recovery_status: {
    type: String,
    required: true,
    enum: recoveryStatusEnum
  },
  duration: {
    type: Date,
    required: true
  },
  archived: {
    type: Boolean,
    default: false  
  }
});

module.exports = mongoo.model('injury',injury);