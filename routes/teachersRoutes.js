const express = require("express");
const router = express.Router();
const teachersController = require("../controllers/teachersController");

router.post("/evaluate", teachersController.submitEvaluation);

module.exports = router;