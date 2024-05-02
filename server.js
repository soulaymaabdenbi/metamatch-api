const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const injuryRouter = require("./routes/injurys.js");
const sessionRouter = require("./routes/sessions");
const matchRouter = require("./routes/match");
const forumRouter = require("./routes/forum");
const blogRouter = require("./routes/blog");
const formRouter = require("./routes/form.js");
const meetingRoutes = require("./routes/meeting");
const cron = require("node-cron");
const { scrapeArticles } = require("./controllers/BlogController");
const { scrapeMatches } = require("./controllers/matchController");
const { scrapeBlessures } = require("./controllers/InjuryController.js");

dotenv.config();

const app = express();
const server = http.createServer(app);
const WebSocket = require("ws");

const wss = new WebSocket.Server({ server });

let teamScores = {
  teamA: { score: 0, name: "" },
  teamB: { score: 0, name: "" },
};
let gameFinished = false;

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    console.log(`Received message: ${message}`);

    const data = JSON.parse(message);

    if (data.type === "update_scores") {
      const { teamA, teamB, teamAName, teamBName } = data;

      teamScores.teamA.score = teamA;
      teamScores.teamA.name = teamAName;
      teamScores.teamB.score = teamB;
      teamScores.teamB.name = teamBName;

      console.log("Updated scores:", teamScores);

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
              JSON.stringify({
                type: "score_updated",
                teamA: teamScores.teamA,
                teamB: teamScores.teamB,
                teamScores,
              })
          );
        }
      });
    } else if (data.type === "finish_game") {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "game_finished" }));
        }
      });
    } else if (data.type === "restart") {
      teamScores.teamA.score = 0;
      teamScores.teamB.score = 0;
      teamScores.teamA.name = "";
      teamScores.teamB.name = "";
      gameFinished = false;

      console.log("Game restarted");

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "game_restarted" }));
        }
      });
    } else if (data.type === "new_chat_message") {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }

  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});



mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log(err));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/sessions", sessionRouter);
app.use("/matches", matchRouter);
app.use("/forum", forumRouter);
app.use("/blog", blogRouter);
app.use("/api", meetingRoutes);
app.use("/injury", injuryRouter);
app.use("/api/form", formRouter);


cron.schedule("5 0 * * *", async () => {
  try {
    await scrapeArticles();
    console.log("Scraping triggered successfully");
  } catch (error) {
    console.error("Error occurred while triggering scraping:", error);
  }
});

cron.schedule("0 0 * * * ", async () => {
  try {
    await scrapeMatches();
    console.log("Scraping triggered successfully");
  } catch (error) {
    console.error("Error occurred while triggering scraping:", error);
  }
});

cron.schedule("0 0 * * * ", async () => {
  try {
    await scrapeBlessures();
    console.log("Scraping triggered successfully");
  } catch (error) {
    console.error("Error occurred while triggering scraping:", error);
  }
});

app.post("/predict", (req, res) => {
  const data = req.body;
});

const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const chatRoute = require("./routes/chat");
const { generateRandomPassword, validatePassword } = require("./utils/helper");

app.use("/", authRoute);
app.use("/api/users", userRoute);
app.use("/api", chatRoute);

app.use("/test", (req, res) => {
  let password = generateRandomPassword();

  if (!validatePassword(password)) {
    return res.status(400).json({
      status: false,
      message:
        "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character",
    });
  }
  return res.status(200).json({ status: true, password });
});





const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


// Node.js: WebSocket handling in your existing server setup
wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    const data = JSON.parse(message);
    console.log(`Received message: ${message}`);
    if (data.type === "new_chat_message") {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
