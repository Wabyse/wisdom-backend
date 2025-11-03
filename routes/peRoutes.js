const express = require("express");
const router = express.Router();
const peController = require("../controllers/peController");

router.get("/exams", peController.fetchAllExam);
router.get("/exam/:id", peController.fetchExam);
router.get("/candidate/:id", peController.fetchCandidate);
router.post("/exam-answers", peController.submitExamAnswers);
router.get("/exams/scores/:id", peController.fetchAllCandidateScores);

module.exports = router;