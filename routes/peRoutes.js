const express = require("express");
const router = express.Router();
const peController = require("../controllers/peController");

router.get("/exams", peController.fetchAllExam);
router.get("/exam/:id", peController.fetchExam);
router.get("/exam/mcq/:id", peController.fetchMCQExam);
router.get("/candidate/:id", peController.fetchCandidate);
router.post("/exam-answers", peController.submitExamAnswers);
router.post("/mcq-exam-answers", peController.submitMCQExamAnswers);
router.get("/exams/scores/:id", peController.fetchAllCandidateScores);
router.get("/exams/mcq/scores/:id", peController.fetchAllCandidateMCQScores);

module.exports = router;