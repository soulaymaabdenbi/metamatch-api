const express = require("express");
const router = express.Router();
const fs = require("fs").promises; // Import fs with promises for async file operations
const matchController = require("../controllers/matchController");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

// Define routes
router.get("/", matchController.getAllMatches);
router.post("/", matchController.addMatch);
router.post("/upload-csv", upload.single("csvFile"), matchController.uploadCSV);
router.put("/:id", matchController.updateMatch);
router.delete("/:id", matchController.deleteMatch);
router.get("/match/:id", matchController.getMatchById);
router.get("/date/:id", matchController.getByDate);

router.get("/match-distribution", matchController.matchDistributionByDate);

router.get("/matches", async (req, res) => {
  try {
    const matchData = await fs.readFile("matchData.json", "utf8");
    const parsedMatchData = JSON.parse(matchData);

    res.json(parsedMatchData);
  } catch (error) {
    console.error("Error fetching match data:", error);

    res.status(500).json({ error: "Error fetching match data" });
  }
});

module.exports = router;
