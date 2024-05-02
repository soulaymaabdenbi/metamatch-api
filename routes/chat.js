const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const {verifyTokenAndAuthorization} = require('../middlewares/verifyToken');
const multer = require('multer');


const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop())  // Appends file extension
    }
});

const upload = multer({ storage: storage });
router.post('/upload-photo', verifyTokenAndAuthorization, upload.single('photo'), chatController.uploadPhoto);
router.get('/chat-contacts', verifyTokenAndAuthorization, chatController.getContacts);

router.get('/chat-chats/:userId', verifyTokenAndAuthorization, chatController.getChats);

router.get('/chat-profileUser', verifyTokenAndAuthorization, chatController.getUserProfile);

router.get('/chat-users', verifyTokenAndAuthorization, chatController.getChatUsers);

router.get('/chat-users/:userId', verifyTokenAndAuthorization, chatController.getSelectedChatUser);

router.post('/chat-chats/', verifyTokenAndAuthorization, chatController.createOrUpdateChat);

router.post('/chat-chats/:id', verifyTokenAndAuthorization, chatController.updateChat);

router.post('/chat-profileUser', verifyTokenAndAuthorization, chatController.updateUserProfile);

module.exports = router;
