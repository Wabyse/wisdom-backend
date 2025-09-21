const express = require("express");
const router = express.Router();
const watomsController = require("../controllers/watomsController");
const uploadNews = require("../middleware/uploadNewsMiddleware");

router.post("/news", uploadNews.single('image'), watomsController.publishNews);
router.get("/news", watomsController.getNewsList);
router.put("/news/:id/notification", watomsController.updateNotification);

module.exports = router;