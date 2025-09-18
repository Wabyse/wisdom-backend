const express = require("express");
const router = express.Router();
const watomsController = require("../controllers/watomsController");
const uploadNews = require("../middleware/uploadNewsMiddleware");

router.post("/news", uploadNews.single("image"), watomsController.publishNews);

module.exports = router;