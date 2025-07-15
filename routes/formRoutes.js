const express = require("express");
const { insertForm, fetchForm, fetchAllForms, insertCurriculumForm, fetchAllCurriculums, fetchAllDepartments, fetchAllUsers, fetchAllOrgs, insertEnvForm, insertBulkStudentsFormsTeacher, insertBulkCurriculumForms, insertBulkEnvironmentForms } = require("../controllers/formController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

// router.post("/individualReports", authenticateToken, insertForm);
router.post("/individualReports", insertForm);
// router.post("/curriculumReports", authenticateToken, insertCurriculumForm);
router.post("/curriculumReports", insertCurriculumForm);
// router.post("/environmentResports", authenticateToken, insertEnvForm);
router.post("/environmentResports", insertEnvForm);
// router.get("/", authenticateToken, fetchForm);
router.post("/", fetchForm);
router.get("/AllForms", authenticateToken, fetchAllForms);
// router.get("/AllForms", fetchAllForms);
// router.get("/AllCurriculums", authenticateToken, fetchAllCurriculums);
router.get("/AllCurriculums", fetchAllCurriculums);
router.get("/AllDepartments", authenticateToken, fetchAllDepartments);
// router.get("/AllDepartments", fetchAllDepartments);
router.get("/AllUsers", authenticateToken, fetchAllUsers);
// router.get("/AllUsers", fetchAllUsers);
router.get("/AllOrgs", authenticateToken, fetchAllOrgs);
// router.get("/AllOrgs", fetchAllOrgs);
router.post("/bulkData/students/teacher", insertBulkStudentsFormsTeacher);
router.post("/bulkData/curriculum", insertBulkCurriculumForms);
router.post("/bulkData/environment", insertBulkEnvironmentForms);

module.exports = router;
