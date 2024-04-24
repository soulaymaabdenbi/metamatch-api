const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
//const UserController=require('../controller/UserController');
//const cors = require('cors');

// Utilisez CORS middleware pour autoriser les requêtes depuis toutes les origines
//router.use(cors());

router.post('/add', formController.addForm);
router.get('/get', formController.getForm);
router.delete('/delete/:id', formController.deleteForm);
router.put('/update/:id', formController.updateForm);
router.get('/:id', formController.getFormById);
router.get('/:id/passing', formController.getPassingStatistics);
router.get('/getPlayer',formController.getPlayers);


module.exports = router;
