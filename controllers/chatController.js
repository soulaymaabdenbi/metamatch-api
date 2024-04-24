const User = require('../models/User');
const Chat = require('../models/Chat');
const Contact = require('../models/Contact');

exports.getContacts = async (req, res) => {
    try {
        const contacts = await Contact.find({owner: req.user.id}).populate('contacts.user');
        res.json(contacts);
    } catch (error) {
        res.status(500).json({message: "Failed to retrieve contacts."});
    }
};

exports.getChats = async (req, res) => {
    const targetUserId = req.params.userId;
    try {
        const chats = await Chat.find({
            participants: { $all: [req.user.id, targetUserId] }
        }).populate('participants');
        res.json(chats);
    } catch (error) {
        res.status(500).json({message: "Failed to retrieve chats."});
    }
};
exports.getUserProfile = async (req, res) => {
    try {
        const userProfile = await User.findById(req.user.id);
        res.json(userProfile);
    } catch (error) {
        res.status(500).json({message: "Failed to retrieve user profile."});
    }
};

exports.getChatUsers = async (req, res) => {
    try {
        const users = await User.find({
            role: 'Player',
            _id: { $ne: req.user.id }
        }).select('fullname email profile status');

        res.json(users);
    } catch (error) {
        console.error('Error fetching chat users:', error);
        res.status(500).json({message: "Failed to retrieve chat users."});
    }
};
exports.getSelectedChatUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        res.json(user);
    } catch (error) {
        res.status(500).json({message: "Failed to retrieve user."});
    }
};

exports.createOrUpdateChat = async (req, res) => {
    const {userId, chat} = req.body;
    console.log('chat ********', chat);
    try {
        let existingChat = await Chat.findOne({participants: {$all: [req.user.id, userId]}});
        if (!existingChat) {
            existingChat = new Chat({participants: [req.user.id, userId], chatHistory: []});
        }
        existingChat.chatHistory.push(chat);
        await existingChat.save();
        res.status(201).json(existingChat);
    } catch (error) {
        res.status(500).json({message: "Failed to create or update chat."});
    }
};

exports.updateChat = async (req, res) => {
    try {
        const {chats} = req.body;
        const updatedChat = await Chat.findByIdAndUpdate(req.params.id, {$push: {chatHistory: chats}}, {new: true});
        res.json(updatedChat);
    } catch (error) {
        res.status(500).json({message: "Failed to update chat."});
    }
};

exports.updateUserProfile = async (req, res) => {
    try {
        const {userProfile} = req.body;
        const updatedProfile = await User.findByIdAndUpdate(req.user.id, userProfile, {new: true});
        res.json(updatedProfile);
    } catch (error) {
        res.status(500).json({message: "Failed to update user profile."});
    }
};
