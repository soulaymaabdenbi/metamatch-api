const express = require("express");
const router = express.Router();

const fs = require("fs").promises;

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const blogController = require("../controllers/BlogController");

router.get("/scrape", async (req, res) => {
  try {
    const blogData = await fs.readFile("articleData.json", "utf8");
    const parsedBlogData = JSON.parse(blogData);

    res.json(parsedBlogData);
  } catch (error) {
    console.error("Error fetching blog data:", error);

    res.status(500).json({ error: "Error fetching blog data" });
  }
});

module.exports = router;
