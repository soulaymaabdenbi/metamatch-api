const User = require('../models/User');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const {validateEmail, validatePassword, encryptPassword, generateRandomPassword} = require('../utils/helper');
const {sendAccountCredentials, sendResetPasswordEmail} = require("../utils/smtp_function");
module.exports = {
    getAllUsers: async (req, res) => {
        try {
            const users = await User.find({}, {__v: 0, password: 0});
            res.status(200).json({status: true, users});
        } catch (e) {
            res.status(500).json({status: false, message: 'error getting users', error: e.message});
        }
    }, getUser: async (req, res) => {
        const userId = req.user.id;

        try {
            const user = await User.findById({_id: userId}, {__v: 0, updatedAt: 0, createdAt: 0, password: 0});
            res.status(200).json({status: true, user});
        } catch (e) {
            req.status(500).json({status: false, message: 'error getting user', error: e.message});
        }
    },

    deleteUser: async (req, res) => {
        const userId = req.user.id;

        try {
            await User.findByIdAndDelete({_id: userId});
            res.status(200).json({status: true, message: 'user deleted successfully'});
        } catch (e) {
            req.status(500).json({status: false, message: 'error deleting user', error: e.message});
        }
    },

    updateUser: async (req, res) => {
        const userId = req.user.id;
        try {
            await User.findByIdAndUpdate({_id: userId}, {$set: req.body}, {new: true});
            res.status(200).json({status: true, message: 'user updated successfully'});
        } catch (e) {
            res.status(500).json({status: false, message: 'error updating user', error: e.message});
        }
    },

    verifyAccount: async (req, res) => {
        const otp = req.params.otp;
        const userId = req.user.id;

        try {
            const user = await User.findById({_id: userId});

            if (user.otp === otp) {
                user.emailVerified = true;
                await user.save();
                res.status(200).json({status: true, message: 'account verified successfully'});
            }
            res.status(400).json({status: false, message: 'invalid otp'});
        } catch (e) {
            res.status(500).json({status: false, message: 'error verifying account', error: e.message});
        }

    }, updateUserByAdmin: async (req, res) => {
        const userId = req.params.id;
        const {
            fullname, username, email, password, address, phone, role, profile, height, weight, age, nationality
        } = req.body;

        try {
            const updates = {};

            let emailChanged = false;
            let passwordChanged = false;

            if (email) {
                if (!validateEmail(email)) {
                    return res.status(400).json({status: false, message: "Invalid email address"});
                }
                updates.email = email;
                emailChanged = true;
            }

            if (password) {
                if (!validatePassword(password)) {
                    return res.status(400).json({
                        status: false,
                        message: "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character"
                    });
                }
                updates.password = encryptPassword(password);
                passwordChanged = true;
            }

            if (fullname) updates.fullname = fullname;
            if (username) updates.username = username;
            if (address) updates.address = address;
            if (phone) updates.phone = phone;
            if (role) updates.role = role;
            if (profile) updates.profile = profile;
            if (height !== undefined) updates.height = height;
            if (weight !== undefined) updates.weight = weight;
            if (age !== undefined) updates.age = age;
            if (nationality !== undefined) updates.nationality = nationality;
            const updatedUser = await User.findByIdAndUpdate(userId, updates, {new: true});
            if (!updatedUser) {
                return res.status(404).json({status: false, message: "User not found"});
            }

            // Send an email if email or password has changed
            if (emailChanged || passwordChanged) {
                await sendAccountCredentials(updatedUser.email, username, password);
            }

            const {password: userPassword, ...updatedUserDetails} = updatedUser._doc;
            res.status(200).json({status: true, message: "User updated successfully", user: updatedUserDetails});
        } catch (error) {
            res.status(500).json({status: false, message: 'Error updating user', error: error.message});
        }
    }, getUserById: async (req, res) => {
        const userId = req.params.id;

        try {
            const user = await User.findById(userId, {__v: 0, updatedAt: 0, createdAt: 0, password: 0});
            if (!user) {
                return res.status(404).json({status: false, message: "User not found"});
            }
            res.status(200).json({status: true, user});
        } catch (e) {
            res.status(500).json({status: false, message: 'error getting user', error: e.message});
        }
    }, changePassword: async (req, res) => {
        const userId = req.user.id;
        const {oldPassword, newPassword} = req.body;

        try {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({status: false, message: "User not found"});
            }

            const decryptedPassword = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY).toString(CryptoJS.enc.Utf8);
            if (decryptedPassword !== oldPassword) {
                return res.status(401).json({status: false, message: "Wrong old password"});
            }

            if (!validatePassword(newPassword)) {
                return res.status(400).json({
                    status: false,
                    message: "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character"
                });
            }
            user.password = encryptPassword(newPassword);
            await user.save();
            res.status(200).json({status: true, message: "Password updated successfully"});
        } catch (e) {

            res.status(500).json({status: false, message: 'Error updating password', error: e.message});
        }
    }, changeUserStatus: async (req, res) => {
        const userId = req.params.id;

        try {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({status: false, message: "User not found"});
            }
            user.status = !user.status;
            await user.save();
            res.status(200).json({status: true, message: "User status updated successfully"});
        } catch (e) {
            res.status(500).json({status: false, message: 'Error updating user status', error: e.message});
        }
    }, forgetPassword: async (req, res) => {
        const email = req.body.email;

        try {
            const user = await User.findOne({email: email, role: {$ne: 'Player'}});
            if (!user) {
                return res.status(404).json({status: false, message: "User not found"});
            }
            let newPassword = generateRandomPassword();
            user.password = encryptPassword(newPassword);
            await user.save();
            await sendResetPasswordEmail(email, user.username, newPassword);
            res.status(200).json({status: true, message: "New password sent to your email"});
        } catch (e) {
            res.status(500).json({status: false, message: 'Error updating password', error: e.message});
        }
    },
    userStatistics: async (req, res) => {
        try {
            const userCount = await User.countDocuments();
            const playerCount = await User.countDocuments({role: 'Player'});
            const coachCount = await User.countDocuments({role: 'Coach'});
            const adminCount = await User.countDocuments({role: 'Admin'});
            const physiotherapistCount = await User.countDocuments({role: 'Physiotherapist'});
            const doctorCount = await User.countDocuments({role: 'Doctor'});

            res.status(200).json({
                status: true,
                userCount,
                playerCount,
                coachCount,
                adminCount,
                physiotherapistCount,
                doctorCount
            });
        } catch (e) {
            res.status(500).json({status: false, message: 'Error getting user statistics', error: e.message});
        }
    }
}
