const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/summary', dashboardController.summary);
router.get('/centers', dashboardController.centers);
router.get('/center/:id/evaluation-breakdown', dashboardController.centerEvaluationBreakdown);
router.get('/watoms/forms/score', dashboardController.watomsFormsScore);
router.get('/wisdom/forms/score', dashboardController.wisdomFormsScore);
router.get('/center/:id', dashboardController.centerDetails);
router.get('/center/:organizationId/annual-performance', dashboardController.getAnnualPerformanceData);
router.get('/wisdom/centers', dashboardController.wisdomCenters);
router.get('/wisdom/center/:id/evaluation-breakdown', dashboardController.wisdomCenterEvaluationBreakdown);
router.get('/wisdom/center/:organizationId/annual-performance', dashboardController.getAnnualPerformanceData);
router.get('/wisdom/center/:organizationId/project-units-ranking', dashboardController.getProjectUnitsRanking);
router.get('/center/:organizationId/project-units-ranking', dashboardController.getProjectUnitsRanking);
router.get('/demo/forms/score', dashboardController.demoFormsScore);

module.exports = router;