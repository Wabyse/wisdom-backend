// middleware/uploadMiddleware.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads exists
const UPLOAD_DIR = "uploads";
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function fixUtf8Name(name) {
  // recover UTF-8 from latin1 mojibake
  return Buffer.from(name, "latin1").toString("utf8");
}

// optional simple sanitization (keeps letters, numbers, ._- and space)
function sanitizeBase(base) {
  return base.replace(/[^\p{L}\p{N}\-_. ]/gu, "");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const utf8Name = fixUtf8Name(file.originalname);
    const ext = path.extname(utf8Name);
    const base = path.basename(utf8Name, ext);
    const safeBase = sanitizeBase(base) || "file";
    cb(null, `${Date.now()}-${safeBase}${ext}`);
  },
});

const upload = multer({
  storage,
  // limits: { fileSize: 20 * 1024 * 1024 } // (optional) 20MB
});

module.exports = upload;