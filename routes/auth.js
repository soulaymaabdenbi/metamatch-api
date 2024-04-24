const router = require('express').Router();
const authController = require('../controllers/authController');
const { verifyAdmin } = require('../middlewares/verifyToken');
router.post('/register', verifyAdmin, authController.createUser);
router.post('/login', authController.loginUser);
router.post('/google-signin', authController.googleSignIn);

module.exports = router;
