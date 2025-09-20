// middleware/upload.js
const multer = require("multer");

const storage = multer.memoryStorage(); // keeps files in memory buffer
const upload = multer({ storage });

module.exports = upload;
