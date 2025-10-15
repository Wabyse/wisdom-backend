const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const taskController = require("../controllers/taskController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.get("/ebdaedu/view", taskController.ebdaeduViewTasks);
router.get("/wisdom/view", taskController.wisdomViewTasks);
router.get("/watoms/view", taskController.watomsViewTasks);
router.post("/assign", upload.single("file"), taskController.assignTask);
// router.patch("/updateStatus/:id", upload.single("file"), taskController.updateStatus);
router.patch("/task/edit/:id", upload.none(), taskController.updateTask);
router.get("/ebdaedu/tasks-summary", taskController.ebdaEduTasksSummary);
router.get("/wisdom/tasks-summary", taskController.wisdomTasksSummary);
router.get("/watoms/tasks-summary", taskController.watomsTasksSummary);
router.get("/my-tasks/:id/:system", taskController.myTasks);
router.get("/task/:id", taskController.fetchTask);
router.get("/ebdaedu/general-info", taskController.ebdaeduGeneralInfo);
router.get("/wisdom/general-info", taskController.wisdomGeneralInfo);
router.get("/watoms/general-info", taskController.watomsGeneralInfo);

module.exports = router;