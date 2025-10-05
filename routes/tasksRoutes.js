const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const taskController = require("../controllers/taskController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.get("/categories", authenticateToken, taskController.viewCategories);
// router.get("/categories", taskController.viewCategories);
router.post("/assign", upload.single("file"), taskController.assignTask);
router.get("/view", taskController.viewTasks);
router.patch("/updateStatus/:id", upload.single("file"), taskController.updateStatus);
router.get("/general-info", taskController.generalInfo);
router.post("/tasks-summary", taskController.tasksSummary);
router.get("/my-tasks/:id", taskController.myTasks);

module.exports = router;