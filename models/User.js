const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fullname: {type: String, required: true},
    username: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: false},
    address: {type: String, required: false},
    phone: {type: String, required: false},
    role: {
        type: String, required: true, enum: ["Player", "Admin", "Coach", "Physiotherapist","Doctor"]
    },
    profile: {
        type: String,
        required: true,
        default: "https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png"
    },
    verification: {type: Boolean, default: true},

    status: { type: Boolean, default: "true" },
    height: { type: String, required: false }, // e.g., "5' 11""
    weight: { type: Number, required: false }, // e.g., 67
    age: { type: Number, required: false },    // e.g., 24
    nationality: { type: String, required: false }, // e.g., "Naples, Italy"

}, {timestamps: true});

module.exports = mongoose.model('User', UserSchema);