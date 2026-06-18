/**
 * @module routes/interview
 * @description Interview analysis routes — all protected by auth middleware.
 */

const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interview.controller');
const authMiddleware = require('../middleware/auth.middleware');
const uploadMiddleware = require('../middleware/upload.middleware');

// All interview routes require authentication
router.use(authMiddleware);

router.post('/', uploadMiddleware, interviewController.createInterview);
router.get('/', interviewController.getInterviews);
router.get('/:id', interviewController.getInterviewById);
router.delete('/:id', interviewController.deleteInterview);
router.get('/:id/pdf', interviewController.downloadReportPDF);

module.exports = router;
