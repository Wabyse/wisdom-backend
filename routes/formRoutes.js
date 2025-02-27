const express = require("express");
const { insertForm, fetchForm, fetchAllForms, insertCurriculumForm, fetchAllCurriculums, fetchAllDepartments, fetchAllUsers } = require("../controllers/formController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

// router.post("/individualReports", authenticateToken, insertForm);
router.post("/individualReports", insertForm);
// router.post("/curriculumReports", authenticateToken, insertCurriculumForm);
router.post("/curriculumReports", insertCurriculumForm);
// router.get("/", authenticateToken, fetchForm);
router.post("/", fetchForm);
// router.get("/AllForms", authenticateToken, fetchAllForms);
router.get("/AllForms", fetchAllForms);
// router.get("/AllCurriculums", authenticateToken, fetchAllCurriculums);
router.get("/AllCurriculums", fetchAllCurriculums);
// router.get("/AllDepartments", authenticateToken, fetchAllDepartments);
router.get("/AllDepartments", fetchAllDepartments);
// router.get("/AllUsers", authenticateToken, fetchAllUsers);
router.get("/AllUsers", fetchAllUsers);

module.exports = router;
