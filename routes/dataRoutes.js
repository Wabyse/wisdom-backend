const express = require("express");
const router = express.Router();
const dataController = require("../controllers/dataController");

router.get("/students/specializations", dataController.specializations);

module.exports = router;