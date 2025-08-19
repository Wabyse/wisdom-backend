const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const fileController = require("../controllers/fileController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.post("/upload", upload.single("file"), fileController.uploadFile);
router.get("/download/*", fileController.downloadFile);
router.get("/download2/:filename(*)", fileController.dmsdownloadFile);
router.get("/view", authenticateToken, fileController.viewFiles);
// router.get("/view", fileController.viewFiles);
router.get("/open/:filename", fileController.openFile);
router.post("/send/:filename", fileController.sendFile);
router.get("/categories", authenticateToken, fileController.viewCategories);
// router.get("/categories", fileController.viewCategories);
router.get("/sub-categories/workshops", authenticateToken, fileController.viewWorkshopsRelatedToOrg);

module.exports = router;
