const Session = require("../models/Session");
const moment = require("moment");
const mongoose = require("mongoose");

exports.addSession = async (req, res) => {
  const { date, time, location, topics } = req.body;

  if (!date || !time || !location || !topics) {
    return res
      .status(400)
      .json({ error: "Missing required fields: date, time, location, topics" });
  }

  try {
    const existingSession = await Session.findOne({ date: date });

    if (existingSession) {
      return res.status(409).json({
        error: "Conflict: A session already exists at this date and time.",
      });
    }

    const newSession = await Session.create({
      date,
      time,
      location,
      topics,
    });

    return res.status(201).json(newSession);
  } catch (error) {
    console.error("Error saving session:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateSession = async (req, res) => {
  const { id } = req.params; // Extract the session ID from request parameters
  const { date } = req.body;

  try {
    // Check if there's any session with the same date but different ID
    const existingSession = await Session.findOne({
      date: date,
      _id: { $ne: id }, // Exclude the current session being updated
    });

    // If there's a session with the same date but different ID, return a conflict error
    if (existingSession) {
      return res.status(400).json({
        message: "Conflict",
      });
    }

    // Update the session with the provided ID
    const updatedSession = await Session.findByIdAndUpdate(id, req.body, {
      new: true, // Return the updated session
    });

    // If the session with the provided ID doesn't exist, return a not found error
    if (!updatedSession) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Return the updated session
    res.json(updatedSession);
  } catch (error) {
    // Handle any errors that occur during the update process
    console.log("Error updating session:", error);
    res.status(400).json({ error: error.message });
  }
};

exports.deleteSession = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedSession = await Session.findByIdAndDelete(id);

    if (!deletedSession) {
      return res.status(404).json({ error: "Session not found" });
    }
    res.status(200).send();
  } catch (error) {
    console.log("Error deleting session:", error);
    res.status(500).json({ error: "Could not delete session" });
  }
};

// exports.getSessionById = async (req, res) => {
//   const sessionId = req.params.id;

//   try {
//     const session = await Session.findById(sessionId);

//     if (!session) {
//       return res.status(404).json({ error: "Session not found" });
//     }

//     res.status(200).json(session);
//   } catch (error) {
//     console.error("Error retrieving session:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

exports.getSessionById = async (req, res) => {
  const sessionId = req.params.id;

  // Validate the session ID
  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    return res.status(400).json({ error: "Invalid session ID" });
  }

  try {
    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.status(200).json(session);
  } catch (error) {
    console.error("Error retrieving session:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// exports.getAllSessions = async (req, res) => {
//   try {
//     const sessions = await Session.find();

//     const sessionsPerWeek = calculateSessionsPerWeek(sessions);

//     res.json({ sessions, sessionsPerWeek });
//   } catch (error) {
//     console.log("Error fetching sessions:", error);
//     res.status(500).json({ error: "Could not fetch sessions" });
//   }
// };

exports.getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.find();

    const sessionsPerMonth = calculateSessionsPerMonth(sessions);

    res.json({ sessions, sessionsPerMonth });
  } catch (error) {
    console.log("Error fetching sessions:", error);
    res.status(500).json({ error: "Could not fetch sessions" });
  }
};

function calculateSessionsPerWeek(sessions) {
  const sessionsPerWeek = {};

  sessions.forEach((session) => {
    const weekNumber = moment(session.date).isoWeek();
    if (!sessionsPerWeek[weekNumber]) {
      sessionsPerWeek[weekNumber] = 1;
    } else {
      sessionsPerWeek[weekNumber]++;
    }
  });

  return sessionsPerWeek;
}
exports.getAllSessionsStats = async (req, res) => {
  try {
    // Retrieve all sessions from the database
    const sessions = await Session.find();

    // Create an object to store session statistics
    const sessionStats = {
      totalSessions: sessions.length,
      sessionsByMonth: calculateSessionsByMonth(sessions),
      sessionsPerWeek: calculateSessionsPerWeek(sessions),
    };

    // Send the session statistics as JSON response
    res.json(sessionStats);
  } catch (error) {
    console.error("Error fetching session stats:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

function calculateSessionsByMonth(sessions) {
  const sessionsByMonth = {};

  sessions.forEach((session) => {
    const month = moment(session.date).format("YYYY-MM");
    if (!sessionsByMonth[month]) {
      sessionsByMonth[month] = 1;
    } else {
      sessionsByMonth[month]++;
    }
  });

  return sessionsByMonth;
}

function calculateSessionsPerWeek(sessions) {
  const sessionsPerWeek = {};

  sessions.forEach((session) => {
    const weekNumber = moment(session.date).isoWeek();
    if (!sessionsPerWeek[weekNumber]) {
      sessionsPerWeek[weekNumber] = 1;
    } else {
      sessionsPerWeek[weekNumber]++;
    }
  });

  return sessionsPerWeek;
}
function calculateSessionsPerMonth(sessions) {
  const sessionsPerMonth = {};

  sessions.forEach((session) => {
    const monthYear = moment(session.date).format("YYYY-MM");

    if (!sessionsPerMonth[monthYear]) {
      sessionsPerMonth[monthYear] = 1;
    } else {
      sessionsPerMonth[monthYear]++;
    }
  });

  return sessionsPerMonth;
}
