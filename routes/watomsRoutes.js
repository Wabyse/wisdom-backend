const express = require("express");
const router = express.Router();
const watomsController = require("../controllers/watomsController");
const uploadNews = require("../middleware/uploadNewsMiddleware");

router.post("/news", uploadNews.single('image'), watomsController.publishNews);
router.get("/news", watomsController.getNewsList);
router.put("/news/:id/notification", watomsController.updateNotification);
router.get("/managers/evaluation", watomsController.getManagerEvaluationTemplate);
router.post("/managers/evaluation", watomsController.submitManagerEvaluation);
router.get("/managers/evaluations/:id", watomsController.getManagerEvaluations);

module.exports = router;