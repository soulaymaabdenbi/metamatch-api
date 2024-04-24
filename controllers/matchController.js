const Match = require("../models/Match");

const csvParser = require("csv-parser");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const axios = require("axios");
const cheerio = require("cheerio");
const csv = require("csv-parser");
const mongoose = require("mongoose");
//const fs = require("fs").promises;
const fs = require("fs");

const chokidar = require("chokidar");

const moment = require("moment");

exports.getAllMatches = async (req, res) => {
  try {
    const matches = await Match.find();
    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addMatch = async (req, res) => {
  const { date } = req.body;
  try {
    const existingMatch = await Match.findOne({ date });
    if (existingMatch) {
      return res.status(400).json({
        message: "A match is already scheduled on the same date",
      });
    }

    const match = new Match(req.body);
    const newMatch = await match.save();
    res.status(201).json(newMatch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateMatch = async (req, res) => {
  const { id } = req.params;
  const { date, time, location, teamA, teamB } = req.body;

  try {
    const existingMatch = await Match.findOne({
      date,
      _id: { $ne: id },
    });

    if (existingMatch) {
      return res.status(400).json({
        message: "Conflict",
      });
    }

    const updatedMatch = await Match.findByIdAndUpdate(
      id,
      {
        date,
        time,
        location,
        teamA,
        teamB,
      },
      { new: true }
    );

    if (!updatedMatch) {
      return res.status(404).json({ message: "Match not found" });
    }

    res.json(updatedMatch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteMatch = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedMatch = await Match.findByIdAndDelete(id);
    if (!deletedMatch) {
      return res.status(404).json({ message: "Match not found" });
    }
    res.json({ message: "Match deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getMatchById = async (req, res) => {
  const { id } = req.params;
  try {
    const match = await Match.findById(id);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }
    res.json(match);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getByDate = async (req, res) => {
  const { date } = req.params;
  try {
    const matches = await Match.find({ date });
    if (matches.length === 0) {
      return res
        .status(404)
        .json({ message: "No matches found for the specified date" });
    }
    res.json(matches);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const url =
  "https://www.transfermarkt.com/ligue-professionelle-1-playoff/startseite/wettbewerb/TUNM";

async function getHtml() {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": generateRandomUserAgent(),
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching HTML:", error);
    throw error;
  }
}

function generateRandomUserAgent() {
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

async function scrapeMatches() {
  try {
    const html = await getHtml();
    const $ = cheerio.load(html);

    const matchData = [];

    $(".begegnungZeile").each((i, match) => {
      const dateAndTime = $(match)
        .find(".hide-for-small.zeit.al")
        .text()
        .trim();
      const homeTeamName = $(match)
        .find(".verein-heim .vereinsname a")
        .text()
        .trim();
      const awayTeamName = $(match)
        .find(".verein-gast .vereinsname a")
        .text()
        .trim();
      const matchResult = $(match).find(".ergebnis .matchresult").text().trim();

      const matchDataItem = {
        dateAndTime,
        homeTeamName,
        awayTeamName,
        matchResult,
      };
      matchData.push(matchDataItem);
    });

    await saveMatchData(matchData);

    console.log("Match data saved successfully.");
  } catch (error) {
    console.error("Error scraping matches:", error);
    throw error;
  }
}

async function saveMatchData(matchData) {
  let lastKnownDate = "";
  matchData.forEach((match) => {
    if (match.dateAndTime.trim()) {
      lastKnownDate = match.dateAndTime;
    } else if (lastKnownDate) {
      match.dateAndTime = lastKnownDate;
    }
  });

  try {
    await fs.promises.writeFile(
      "matchData.json",
      JSON.stringify(matchData, null, 2),
      (err) => {
        if (err) {
          console.error("Error saving match data:", err);
          throw err;
        }
        console.log(
          "Match data saved successfully, with missing dates filled in."
        );
      }
    );
  } catch (error) {
    console.error("Error saving match data:", error);
    throw error;
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

exports.uploadCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileContent = fs.readFileSync(req.file.path, "utf-8");

    const rows = fileContent
      .trim()
      .split("\n")
      .map((row) => row.split(";").map((col) => col.trim()));

    if (rows.length > 1) {
      rows.shift(); // Remove header row
    }

    for (const row of rows) {
      const [date, time, location, teamA, teamB] = row;

      console.log("Parsing row:", row);

      const parsedDate = moment(date, "DD/MM/YYYY").toDate();
      const parsedTime = moment(time, "HH:mm").format("HH:mm");

      console.log("Parsed date:", parsedDate);
      console.log("Parsed time:", parsedTime);
      console.log("Location:", location);
      console.log("Team A:", teamA);
      console.log("Team B:", teamB);

      if (!parsedDate || isNaN(parsedDate.getTime()) || !parsedTime) {
        console.error("Invalid match data in row:", row);
        continue;
      }

      const existingMatch = await Match.findOne({
        date: parsedDate,
        time: parsedTime,
        location,
        teamA,
        teamB,
      });

      if (existingMatch) {
        await Match.findOneAndUpdate(
          {
            date: parsedDate,
            time: parsedTime,
            location,
            teamA,
            teamB,
          },
          {
            $set: {
              date: parsedDate,
              time: parsedTime,
              location,
              teamA,
              teamB,
            },
          }
        );
        console.log("Match updated:", row.join(","));
      } else {
        await Match.create({
          date: parsedDate,
          time: parsedTime,
          location,
          teamA,
          teamB,
        });
        console.log("New match created:", row.join(","));
      }
    }

    res.json({
      message: "CSV file uploaded and match data inserted/updated successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: error.message });
  }
};

async function processCSVFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const rows = fileContent
      .trim()
      .split("\n")
      .map((row) => row.split(";").map((col) => col.trim()));

    // Skip the header row
    if (rows.length > 0) {
      rows.shift(); // Remove the first element (header row)
    }

    const newMatchSignatures = new Set();

    for (const row of rows) {
      const [date, time, location, teamA, teamB] = row;

      const parsedDate = moment(date, "DD/MM/YYYY").toDate();
      const parsedTime = moment(time, "HH:mm").format("HH:mm");

      if (
        !parsedDate ||
        isNaN(parsedDate.getTime()) ||
        !parsedTime ||
        !location ||
        !teamA ||
        !teamB
      ) {
        console.error("Invalid match data in row:", row);
        continue;
      }

      // Query to find existing match
      const query = {
        date: parsedDate,
        time: parsedTime,
        location,
        teamA,
        teamB,
      };

      // Update data for the existing match
      const update = {
        date: parsedDate,
        time: parsedTime,
        location,
        teamA,
        teamB,
      };

      // Find and update the existing match
      const result = await Match.findOneAndUpdate(query, update, {
        upsert: true,
      });

      // Add match signature to the set
      const matchSignature = `${parsedDate}:${parsedTime}:${location}:${teamA}:${teamB}`;
      newMatchSignatures.add(matchSignature);

      if (result) {
        console.log("Match updated:", query);
      } else {
        console.log("New match created:", query);
      }
    }

    // Find matches in the database that are not present in the CSV file
    const existingMatches = await Match.find(
      {},
      { _id: 0, date: 1, time: 1, location: 1, teamA: 1, teamB: 1 }
    );
    for (const match of existingMatches) {
      const matchSignature = `${match.date}:${match.time}:${match.location}:${match.teamA}:${match.teamB}`;
      if (!newMatchSignatures.has(matchSignature)) {
        // Delete the match from the database
        await Match.deleteOne({
          date: match.date,
          time: match.time,
          location: match.location,
          teamA: match.teamA,
          teamB: match.teamB,
        });
        console.log("Match deleted:", match);
      }
    }
  } catch (error) {
    console.error("Error processing CSV file:", error);
  }
}

const path = require("path");

function watchCSVFiles() {
  const directoryPath = "uploads";
  let timeout;

  fs.watch(directoryPath, { persistent: true }, (eventType, filename) => {
    if (filename) {
      console.log(`File ${filename} has been changed`);

      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => {
        try {
          processCSVFile(path.join(directoryPath, filename));
        } catch (error) {
          console.error("Error processing CSV file:", error);
        }
      }, 1000);
    }
  });
}

exports.matchDistributionByDate = async (req, res) => {
  try {
    // Retrieve all matches from the database
    const matches = await Match.find();

    // Create an object to store match counts by date
    const matchCountsByDate = {};

    // Count matches per day
    matches.forEach((match) => {
      // Extract the date from the match and format it
      const matchDate = moment(match.date).format("YYYY-MM-DD");

      // Increment the count for the match date
      matchCountsByDate[matchDate] = (matchCountsByDate[matchDate] || 0) + 1;
    });

    // Calculate match counts per month
    const matchCountsByMonth = {};
    matches.forEach((match) => {
      const matchMonth = moment(match.date).format("YYYY-MM");

      matchCountsByMonth[matchMonth] =
        (matchCountsByMonth[matchMonth] || 0) + 1;
    });

    // Send the match counts as JSON response
    res.json({
      matchesByDate: matchCountsByDate,
      matchesByMonth: matchCountsByMonth,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.watchCSVFiles = watchCSVFiles;
exports.processCSVFile = processCSVFile;
exports.scrapeMatches = scrapeMatches;
