const express = require("express");
const router = express.Router();
const dataController = require("../controllers/dataController");

router.get("/students/specializations", dataController.specializations);
router.get("/authorities", dataController.authorities);
router.get("/projects", dataController.projects);

module.exports = router;