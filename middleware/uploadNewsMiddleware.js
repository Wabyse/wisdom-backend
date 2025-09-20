const multer = require("multer");
const path = require("path");
const fs = require("fs");

// recover UTF-8 from latin1 mojibake (like Arabic names)
function fixUtf8Name(name) {
  return Buffer.from(name, "latin1").toString("utf8");
}

// optional sanitization (letters, numbers, ._- and space)
function sanitizeBase(base) {
  return base.replace(/[^\p{L}\p{N}\-_. ]/gu, "");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("req.body")
    const orgId = req.body.organization_id;
    console.log(orgId)
    if (!orgId) return cb(new Error("organization_id is required"));

    const targetDir = path.join("news", orgId.toString());
    fs.mkdirSync(targetDir, { recursive: true });

    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const utf8Name = fixUtf8Name(file.originalname);
    const ext = path.extname(utf8Name);
    const base = path.basename(utf8Name, ext);
    const safeBase = sanitizeBase(base) || "file";
    cb(null, `${Date.now()}-${safeBase}${ext}`);
  }
});

const uploadNews = multer({ storage });

module.exports = uploadNews;