const router = require('express').Router();

const userController = require('../controllers/userController');
const {verifyTokenAndAuthorization, verifyAdmin, verifyCoach} = require('../middlewares/verifyToken');

router.get('/', verifyTokenAndAuthorization, userController.getUser);
router.delete('/', verifyTokenAndAuthorization, userController.deleteUser);
router.put('/', verifyTokenAndAuthorization, userController.updateUser);
router.put('/updateUserByAdmin/:id', verifyCoach, userController.updateUserByAdmin);
router.get('/getAllUsers', verifyCoach, userController.getAllUsers);
router.get('/getUserById/:id', verifyCoach, userController.getUserById);
router.put('/changePassword', verifyTokenAndAuthorization, userController.changePassword);
router.put('/changeUserStatus/:id', verifyCoach, userController.changeUserStatus);
router.post('/forgetPassword', userController.forgetPassword);
router.get('/userStatistics', verifyTokenAndAuthorization, userController.userStatistics);
module.exports = router;
