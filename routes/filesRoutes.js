const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const fileController = require("../controllers/fileController");

router.post("/upload", upload.single("file"), fileController.uploadFile);
router.get("/download/:filename", fileController.downloadFile);
router.get("/view", fileController.viewFiles);
router.get("/open/:filename", fileController.openFile);
router.post("/send/:filename", fileController.sendFile);
router.get("/categories", fileController.viewCategories);

module.exports = router;
