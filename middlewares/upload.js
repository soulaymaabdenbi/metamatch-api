const multer = require("multer");

// Set up Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads"); // Destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Custom file name
  },
});

// Set up Multer upload instance
const upload = multer({ storage: storage, field: "csvFile" }); // Specify the field key here

module.exports = upload;
