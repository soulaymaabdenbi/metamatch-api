const User = require('../models/User');
const Chat = require('../models/Chat');
const Contact = require('../models/Contact');
const mongoose = require('mongoose');

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
        const allUsers = await User.find({
            role: 'Player',
            _id: { $ne: req.user.id }
        }).select('fullname email profile status _id');

        // Aggregating to find the latest message for each chat involving the current user
        const chats = await Chat.aggregate([
            { $match: { participants: new mongoose.Types.ObjectId(req.user.id) } },
            { $unwind: '$chatHistory' },
            { $sort: { 'chatHistory.time': -1 } },
            {
                $group: {
                    _id: { $filter: {
                            input: '$participants',
                            as: 'participant',
                            cond: { $ne: ['$$participant', new mongoose.Types.ObjectId(req.user.id)] }
                        }},
                    latestMessageTime: { $first: '$chatHistory.time' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'participantDetails'
                }
            },
            { $unwind: '$participantDetails' },
            {
                $project: {
                    _id: 1,
                    latestMessageTime: 1,
                    fullname: '$participantDetails.fullname',
                    email: '$participantDetails.email',
                    profile: '$participantDetails.profile',
                    status: '$participantDetails.status'
                }
            }
        ]);

        // Create a map of users with chat details
        const chatMap = new Map(chats.map(chat => [chat._id.toString(), chat]));

        // Combine all users with chat data
        const users = allUsers.map(user => {
            const chatDetails = chatMap.get(user._id.toString());
            return {
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                profile: user.profile,
                status: user.status,
                lastMessageTime: chatDetails ? chatDetails.latestMessageTime : null
            };
        }).sort((a, b) => b.lastMessageTime - a.lastMessageTime); // Sorting by latestMessageTime

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


exports.uploadPhoto = async (req, res) => {
    // Extract senderId, userId, and imageUrl from the request body
    const {chats} = req.body;
    console.log('chats ********', chats);

    try {
        // Find the chat using participant IDs
        const chat = await Chat.findOne({ participants: { $all: [userId, senderId] } });

        // Handle the case where the chat does not exist
        if (!chat) {
            return res.status(404).json({ status: false, message: 'Chat not found.' });
        }

        // Add the new message to the chat history
        chat.chatHistory.push(chats);
        await chat.save();

        // Respond with the newly created message
        res.status(201).json({
            status: true,
            message: 'Photo uploaded successfully',
            data: newMessage
        });
    } catch (error) {
        console.error('Failed to upload photo:', error);
        res.status(500).json({
            status: false,
            message: 'Failed to upload photo.',
            error: error.message
        });
    }
};


