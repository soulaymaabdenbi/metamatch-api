const express = require('express');
const injury = require('../models/injury');
const router = express.Router();
const injuryControllerr=require("../controllers/InjuryController");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const fs = require("fs");



router.post('/addInjury',injuryControllerr.addInjury);
router.get('/getAllInjury',injuryControllerr.getAllInjury);
router.get('/getInjurybyid/:id', injuryControllerr.getInjurybyid);
router.get('/getInjurybyStatus/:recovery_status',injuryControllerr.getInjurybyRecoveryStatus);
router.put('/updateInjury/:id', injuryControllerr.updateInjury);
router.delete('/deleteInjury/:id', injuryControllerr.deleteInjury);
router.post("/upload-csv", upload.single("csvFile"), injuryControllerr.uploadCSV);
router.put('/archive/:id', injuryControllerr.archiveInjury);
router.get('/joueur/:id/injuries', injuryControllerr.getPlayerInjuries);

router.get('/players', injuryControllerr.getPlayers);
router.get('/playerId', injuryControllerr.getPlayerById);


router.get('/injuriesByTypeStats', injuryControllerr.getInjuriesByTypeStats);
router.get('/injuriesByRecoveryStatusStats', injuryControllerr.getInjuriesByRecoveryStatusStats);
router.get('/injuriesByYearStats/:year', injuryControllerr.getInjuriesByYearStats);
router.get('/joueur/:playerId/archive/injuries', injuryControllerr.getPlayerArchiveInjuries);

router.get('/scrape', async (req, res) => {
    try {
        const blessureData = await fs.promises.readFile("blessureData.json", { encoding: 'utf8' });
        const parsedBlessureData = JSON.parse(blessureData);

        res.json(parsedBlessureData);
    } catch (error) {
        console.error("Error fetching data:", error);

        res.status(500).json({ error: "Error fetching data" });
    }
});


module.exports = router;