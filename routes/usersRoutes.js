const express = require("express");
const router = express.Router();
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

module.exports = router;