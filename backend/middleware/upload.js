// middleware/upload.js
"use strict";

const multer = require("multer");

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const MAX_FILE_SIZE    = 5 * 1024 * 1024; // 5 MB
const MAX_FILE_COUNT   = 10;

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize:  MAX_FILE_SIZE,
    files:     MAX_FILE_COUNT,
  },
  fileFilter,
});

module.exports = upload;