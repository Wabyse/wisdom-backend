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
router.get("/employees/evaluations/:id/:month", watomsController.getEmployeeEvaluation);
router.patch("/employee/evaluation", watomsController.updateManagerEvaluation);
router.post("/organization/task-score", watomsController.submitOrgTaskAvg);
router.get("/organization/task-score/:id", watomsController.getOrgTasksAvg);
router.post("/manager/comment", watomsController.submitManagerComment);
router.get("/manager/comment/:id", watomsController.getManagerComments);
router.get("/pe/candidates", watomsController.getCandidatesData);
router.post("/pe/candidate/create-user", watomsController.createCandidateUser);
router.patch("/pe/candidate/update-user/:id", watomsController.updateCandidateUser);

module.exports = router;