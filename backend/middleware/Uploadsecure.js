// middleware/uploadSecure.js
const multer = require("multer");

// ── Allowed MIME types ─────────────────────────────────────────────────────────
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

// ── Magic bytes for each allowed type ─────────────────────────────────────────
// Validates actual file content, not just the extension or mimetype header
// This prevents someone renaming a .php or .exe to .jpg
const MAGIC_BYTES = {
  "image/jpeg": [
    [0xff, 0xd8, 0xff], // JPEG
  ],
  "image/png": [
    [0x89, 0x50, 0x4e, 0x47], // PNG
  ],
  "image/webp": [
    // WebP: starts with RIFF....WEBP
    // bytes 0-3: RIFF, bytes 8-11: WEBP
    // We check RIFF signature here, full check in fileFilter
    [0x52, 0x49, 0x46, 0x46],
  ],
};

const matchesMagicBytes = (buffer, mimeType) => {
  const signatures = MAGIC_BYTES[mimeType];
  if (!signatures) return false;

  for (const sig of signatures) {
    const match = sig.every((byte, i) => buffer[i] === byte);
    if (match) {
      // Extra check for webp — bytes 8-11 must be "WEBP"
      if (mimeType === "image/webp") {
        const webpMarker = [0x57, 0x45, 0x42, 0x50]; // WEBP
        const webpMatch = webpMarker.every((byte, i) => buffer[8 + i] === byte);
        if (!webpMatch) return false;
      }
      return true;
    }
  }
  return false;
};

// ── File filter ────────────────────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  // 1. Check mimetype
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error(`Invalid file type. Only JPG, PNG, and WebP are allowed. Got: ${file.mimetype}`), false);
  }

  // 2. Block dangerous extensions regardless of mimetype
  const ext = file.originalname.split(".").pop()?.toLowerCase();
  const BLOCKED_EXTENSIONS = ["php", "js", "exe", "sh", "bat", "cmd", "py", "rb", "pl", "cgi", "html", "htm", "svg", "xml"];
  if (BLOCKED_EXTENSIONS.includes(ext)) {
    return cb(new Error(`File extension .${ext} is not allowed`), false);
  }

  cb(null, true);
};

// ── Storage — memory buffer ────────────────────────────────────────────────────
const storage = multer.memoryStorage();

// ── Multer instance ────────────────────────────────────────────────────────────
const uploadSecure = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,  // 5MB per file
    files: 10,                   // max 10 files per request
  },
});

// ── Magic bytes validator — call after multer processes files ──────────────────
// Use as middleware after uploadSecure to validate actual file contents
const validateImageContents = (req, res, next) => {
  const files = req.files
    ? Array.isArray(req.files) ? req.files : Object.values(req.files).flat()
    : [];

  for (const file of files) {
    if (!file.buffer || file.buffer.length < 12) {
      return res.status(400).json({ error: `File ${file.originalname} is too small or corrupt` });
    }

    if (!matchesMagicBytes(file.buffer, file.mimetype)) {
      return res.status(400).json({
        error: `File ${file.originalname} content does not match its declared type. Possible file tampering detected.`,
      });
    }
  }

  next();
};

module.exports = { uploadSecure, validateImageContents };