const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const usersController = require("../controllers/usersController");

router.post("/teacher", usersController.viewTeacher);
router.post("/teacher/substitution", usersController.submitSubstitutions);
router.post("/teacher/lateness", usersController.submitTeacherLatness);
router.get("/teachers", usersController.viewTeachers);
router.get("/students", usersController.viewStudents);
router.post("/students/absence", usersController.submitStudentAbsence);
router.get("/classes", usersController.viewClasses);
router.get("/stages", usersController.viewStages);
router.get("/schools", usersController.viewSchools);
router.post("/schools/incidents", upload.single("file"), usersController.submitIncident);
router.get("/schools/incidents/categories", usersController.viewIncidentsCategories);
router.post("/students/behavior", usersController.submitBehavior);
router.get("/students/behavior/categories", usersController.viewBehaviorCategories);
router.post("/checkinout", usersController.checkInOut);

module.exports = router;