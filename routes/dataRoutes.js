const express = require("express");
const router = express.Router();
const dataController = require("../controllers/dataController");

router.get("/students/specializations", dataController.specializations);
router.get("/authorities", dataController.authorities);
router.get("/orgs/check", dataController.projects);
router.get("/traineesRegistrations", dataController.fetchTraineesRegistrations);
router.get("/employees/roles", dataController.fetchEmployeesRoles);
router.get("/projects", dataController.fetchProjects);
router.get("/programs", dataController.fetchPrograms);
router.get("/orgs", dataController.fetchOrgs);

module.exports = router;