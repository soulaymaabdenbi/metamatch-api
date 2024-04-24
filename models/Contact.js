const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contacts: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: String,
        role: String,
        avatar: String,
        about: String
    }]
});

module.exports = mongoose.model('Contact', ContactSchema);
