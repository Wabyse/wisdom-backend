const express = require("express");
const router = express.Router();
const dataController = require("../controllers/dataController");

router.get("/students/specializations", dataController.specializations);
router.get("/authorities", dataController.authorities);
router.get("/projects", dataController.projects);
router.get("/traineesRegistrations", dataController.fetchTraineesRegistrations);
router.get("/employees/roles", dataController.fetchEmployeesRoles);

module.exports = router;