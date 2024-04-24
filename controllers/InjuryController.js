const injury = require("../models/injury");
const csvParser = require("csv-parser");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const fs = require("fs");

const joueurModel = require('../models/User'); 
const axios = require("axios");
const cheerio = require("cheerio");
const { PythonShell } = require('python-shell');
const User = require('../models/User');




async function uploadCSV(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const existingEntries = new Map(); 
    const existingInjuries = await injury.find({}, 'player_id date');
    existingInjuries.forEach(injury => {
      existingEntries.set(injury.player_id.toString() + injury.date.toISOString(), injury._id);
    });

    fs.createReadStream(req.file.path)
      .pipe(csvParser({ separator: ";" }))
      .on("data", async (data) => {
        if (!Object.keys(data).length) {
          console.log("Empty row, skipping...");
          return;
        }
      
        console.log("Row data:", data);
      
        const playerName = data["player_id"] ? data["player_id"].trim() : null;
        if (!playerName) {
          console.error("Player name is missing in the row:", data);
          return;
        }
      

        const player = await User.findOne({ username: playerName });


        if (!player) {
          console.error("Unknown player:", playerName);
          return;
        }
      
        const date = data["date"] ? new Date(data["date"]) : null;
        console.log("Date:", date);
      
        if (!date || isNaN(date.getTime())) {
          console.error("Invalid date format in row:", data);
          return;
        }
      
        const key = player._id.toString() + date.toISOString();
        const existingInjuryId = existingEntries.get(key);
        if (existingInjuryId) {
          // Mettre à jour l'entrée existante avec les nouvelles données du CSV
          await injury.findByIdAndUpdate(existingInjuryId, {
            date: data["date"].trim(),
            type: data["type"].trim(),
            description: data["description"].trim(),
            recovery_status: data["recovery_status"].trim(),
            duration: data["duration"].trim(),
          });
          console.log("this player is existed !:");
          console.log("Entry updated for player:", playerName, "at date:", date);
        } else {
          // Créer une nouvelle entrée pour la blessure
          await injury.create({
            player_id: player._id,
            date: data["date"].trim(),
            type: data["type"].trim(),
            description: data["description"].trim(),
            recovery_status: data["recovery_status"].trim(),
            duration: data["duration"].trim(),
          });
          console.log("No existing injury found for player:", playerName, "at date:", date);
        }
      })
      
      .on("end", async () => {
        res.json({
          message: "CSV file uploaded and existing data updated successfully",
        });
      });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: error.message });
  }
}



async function addInjury(req, res) {
  try {
    const u = await new injury(req.body).save().then((usr) => {
      console.log(req.body);
      res.status(200).json(usr);
    }).catch((err) => {
      console.error(err);
      res.status(400).json({
        error: err.message,
      });
    });
  } catch (err) {
    res.status(400).json({
      error: err,
    });
  }
}

async function getAllInjury(req, res) {
  try {
    const data = await injury.find();
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({
      error: err,
    });
  }
}

async function getInjurybyid(req, res) {
  try {
    const u = await injury.findById(req.params.id);
    res.status(200).json(u);
  } catch (err) {
    res.status(400).json({
      error: err,
    });
  }
}

async function getInjurybyRecoveryStatus(req, res) {
  try {
    let recovery_status = req.params.recovery_status;
    const u = await injury.findOne({
      recovery_status: recovery_status,
    });
    res.status(200).json(u);
  } catch (err) {
    res.status(400).json({
      error: err,
    });
  }
}

async function updateInjury(req, res) {
  const {id} = req.params;
  const {player_id, date, type, description, recovery_status, duration} = req.body;
  try {
    const updateInjury = await injury.findByIdAndUpdate(
      id,
      {player_id, date, type, description, recovery_status, duration},
      { new: true }
    );
    if (!updateInjury) {
      return res.status(404).json({error: "injury not found!"});
    }
    res.json(updateInjury);
  } catch(error) {
    console.log("Error updating injury: ", error);
    res.status(400).json({error: error.message});
  }
}

async function deleteInjury(req, res) {
  const { id } = req.params;
  try {
    const deletedInjury = await injury.findByIdAndDelete(id);
    if (!deletedInjury) {
      return res.status(404).json({ error: "injury not found" });
    }
    res.status(204).send("injury is deleted");
  } catch (error) {
    console.log("Error deleting injury: ", error);
    res.status(500).json({ error: "could not delete injury" });
  }
}

async function archiveInjury(req, res) {
  const { id } = req.params;
  try {
    const foundInjury = await injury.findById(id);
    if (!foundInjury) {
      return res.status(404).json({ error: 'Injury not found' });
    }
    foundInjury.archived = true; // Ajoutez un attribut "archived" à votre modèle Injury pour marquer l'injury comme archivé
    await foundInjury.save();
    res.status(200).json({ message: 'Injury archived successfully' });
  } catch (error) {
    console.error('Error archiving injury:', error);
    res.status(500).json({ error: 'Could not archive injury' });
  }
}


async function getPlayerInjuries(req, res) {
  try {
    const playerId = req.params.id;
    // Vérifier si le joueur existe
    const player = await joueurModel.findById(playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Récupérer les blessures associées à ce joueur
    const playerInjuries = await injury.find({ player_id: playerId });
    res.status(200).json(playerInjuries);
  } catch (error) {
    console.error('Error fetching player injuries:', error);
    res.status(500).json({ error: 'Could not fetch player injuries' });
  }
}
async function getInjuriesByTypeStats(req, res) {
  try {
    const stats = await injury.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $project: { type: '$_id', count: 1, _id: 0 } }
    ]);
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching injuries by type stats:', error);
    res.status(500).json({ error: 'Could not fetch injuries by type stats' });
  }
}


async function getInjuriesByRecoveryStatusStats(req, res) {
  try {
    const stats = await injury.aggregate([
      { $group: { _id: '$recovery_status', count: { $sum: 1 } } },
      { $project: { recovery_status: '$_id', count: 1, _id: 0 } }
    ]);
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching injuries by recovery status stats:', error);
    res.status(500).json({ error: 'Could not fetch injuries by recovery status stats' });
  }
}
async function getInjuriesByYearStats(req, res) {
  try {
    const year = parseInt(req.params.year);
    const startDate = new Date(year, 0, 1); // Date de début de l'année spécifiée
    const endDate = new Date(year + 1, 0, 1); // Date de fin de l'année spécifiée

    const stats = await injury.aggregate([
      {
        $match: {
          date: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: { $month: '$date' }, // Grouper par mois de l'année
          count: { $sum: 1 }, // Compter le nombre de blessures pour chaque mois
        },
      },
      { $sort: { '_id': 1 } }, // Trier les résultats par mois croissant
      { $project: { month: '$_id', count: 1, _id: 0 } }, // Projetter les résultats avec le nom du mois
    ]);
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching injuries by year stats:', error);
    res.status(500).json({ error: 'Could not fetch injuries by year stats' });
  }
}



async function getPlayerArchiveInjuries (req, res) {
  try {
    const playerId = req.params.playerId;
    const archiveInjuries = await injury.find({ player_id: playerId, archived: true });
    res.json(archiveInjuries);
  } catch (error) {
    console.error('Error retrieving player archive injuries:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}



 async function getPlayers (req, res)  {
  try {
      const players = await User.find({ role: 'Player' }, '_id username profile age nationality');
      res.status(200).json(players);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur interne du serveur' });
  }
}

async function getPlayerById(req, res) {
  const playerId = req.params.id; 

  try {
    const player = await User.findById(playerId, '_id username profile');
    if (!player) {
      return res.status(404).json({ message: 'Joueur non trouvé' });
    }
    res.status(200).json(player);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
}




const urlBlessure =
  "https://www.transfermarkt.fr/laliga/verletztespieler/wettbewerb/ES1/plus/1";

async function getHtml() {
  try {
    const response = await axios.get(urlBlessure, {
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

async function scrapeBlessures() {
  try {
    const html = await getHtml();
    const $ = cheerio.load(html);

    const blessureData = [];

    $("tr.even").each((index, element) => {
      const playerName = $(element).find(".hauptlink a").text().trim();
      const playerProfileLink = $(element).find(".hauptlink a").attr("href");

      // Extracting player position from the nested table
      const playerPosition = $(element)
        .find("table.inline-table tr:nth-child(2) td")
        .text()
        .trim();

      const club = $(element)
        .find(".zentriert.no-border-rechts img")
        .attr("title");
      const injuryType = $(element).find(".links").text().trim();
      const injuryStartDate = $(element).find(".zentriert").eq(0).text().trim();
      const marketValue = $(element).find(".rechts").text().trim();
      const imageUrl = $(element).find(".bilderrahmen-fixed lazy entered loaded").attr("src");
      const completeArticleUrl = "https://www.transfermarkt.fr/laliga/verletztespieler/wettbewerb/ES1/plus/1" ;


      const blessure = {
        articleUrl: completeArticleUrl,
        injuryStartDate:injuryStartDate,
        imageUrl ,
        playerName,
        playerProfileLink,
        playerPosition,
        club,
        injuryType,
        marketValue,
      };

      blessureData.push(blessure);
    });

    await saveBlessure(blessureData);

    console.log("Blessure data saved successfully.");
  } catch (error) {
    console.error("Error scraping blessures:", error);
    throw error;
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

exports.startScrapingBlessures = async () => {
  try {
    while (true) {
      await scrapeBlessures();
      await delay(5000);
    }
  } catch (error) {
    console.error("Error during scraping:", error);
  }
};

async function saveBlessure(blessures) {
  try {
    await fs.promises.writeFile(
      "blessureData.json",
      JSON.stringify(blessures, null, 2)
    );
    console.log("Data saved successfully.");
  } catch (error) {
    console.error("Error saving blessures:", error);
    throw error;
  }
}




module.exports = {
  uploadCSV,
  addInjury,
  getAllInjury,
  getInjurybyid,
  getInjurybyRecoveryStatus,
  updateInjury,
  deleteInjury,
  archiveInjury,
  getPlayerInjuries,
  getPlayerById,

  getInjuriesByTypeStats,
  getInjuriesByRecoveryStatusStats,
  getInjuriesByYearStats,

  getPlayerArchiveInjuries,

  getPlayers,

  scrapeBlessures 
};
