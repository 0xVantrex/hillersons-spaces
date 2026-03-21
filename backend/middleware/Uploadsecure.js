// middleware/uploadSecure.js
"use strict";

const multer = require("multer");

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const BLOCKED_EXTENSIONS = new Set([
  "php", "js", "exe", "sh", "bat", "cmd",
  "py", "rb", "pl", "cgi", "html", "htm", "svg", "xml",
]);

const MAGIC_BYTES = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png":  [[0x89, 0x50, 0x4e, 0x47]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]],
};

const MIN_BUFFER_LENGTH = 12;

const matchesMagicBytes = (buffer, mimeType) => {
  const signatures = MAGIC_BYTES[mimeType];
  if (!signatures) return false;

  for (const sig of signatures) {
    const match = sig.every((byte, i) => buffer[i] === byte);
    if (match) {
      if (mimeType === "image/webp") {
        const webpMarker = [0x57, 0x45, 0x42, 0x50];
        return webpMarker.every((byte, i) => buffer[8 + i] === byte);
      }
      return true;
    }
  }
  return false;
};

const fileFilter = (_req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
  }

  // Last extension only — but magic bytes validation is the real enforcement layer
  const ext = file.originalname.split(".").pop()?.toLowerCase();
  if (ext && BLOCKED_EXTENSIONS.has(ext)) {
    return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
  }

  cb(null, true);
};

const uploadSecure = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files:    10,
  },
});

const validateImageContents = (req, res, next) => {
  // Normalise req.file (single) and req.files (array or fields object)
  const files = [
    ...(req.file ? [req.file] : []),
    ...(Array.isArray(req.files)
      ? req.files
      : Object.values(req.files || {}).flat()),
  ];

  for (const file of files) {
    if (!file.buffer || file.buffer.length < MIN_BUFFER_LENGTH) {
      return res.status(400).json({ error: "One or more uploaded files are too small or corrupt." });
    }

    if (!matchesMagicBytes(file.buffer, file.mimetype)) {
      // Do not reflect file.originalname — client-controlled input
      return res.status(400).json({ error: "One or more files failed content validation." });
    }
  }

  next();
};

module.exports = { uploadSecure, validateImageContents };