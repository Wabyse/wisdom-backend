const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/summary', dashboardController.summary);
router.get('/centers', dashboardController.centers);
router.get('/center/:id/evaluation-breakdown', dashboardController.centerEvaluationBreakdown);
router.get('/center/:id', dashboardController.centerDetails);

module.exports = router;