// middleware/cors.js
const cors = require("cors");

const allowedOrigins = ["http://localhost:4200"]; // Add more origins if needed
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

module.exports = cors(corsOptions);
