const express = require("express");
const router = express.Router();
const sessionController = require("../controllers/sessionController");
const moment = require("moment");
const Session = require("../models/Session");

router.get("/", sessionController.getAllSessions);
router.post("/", sessionController.addSession);
router.put("/:id", sessionController.updateSession);
router.delete("/:id", sessionController.deleteSession);
router.get("/:id", sessionController.getSessionById);
router.get("/stats", sessionController.getAllSessionsStats);

module.exports = router;
