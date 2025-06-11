const express = require("express");
const router = express.Router();
const neqatyController = require("../controllers/neqatyController");

router.get("/schoolPoints", neqatyController.viewSchoolPoints);
router.get("/vtcPoints", neqatyController.viewVtcPoints);
router.post("/updatePoints", neqatyController.updatePoints);
router.get("/permissions", neqatyController.viewPointsPermissions);
router.patch("/grantPointsRequests", neqatyController.PointRequestStatus);

module.exports = router;