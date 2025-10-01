const express = require("express");
const router = express.Router();
const neqatyController = require("../controllers/neqatyController");

router.get("/schoolPoints", neqatyController.viewSchoolPoints);
router.get("/vtcPoints", neqatyController.viewVtcPoints);
router.post("/updatePoints", neqatyController.updatePoints);
router.get("/permissions", neqatyController.viewPointsPermissions);
router.patch("/grantPointsRequests", neqatyController.PointRequestStatus);
router.post("/userPoints", neqatyController.viewUserPoints);
router.get("/watoms/monthly/performance", neqatyController.watomsMonthlyPerformance);
router.get("/watoms/monthly/performance/:id", neqatyController.employeeMonthlyPerformance);

module.exports = router;