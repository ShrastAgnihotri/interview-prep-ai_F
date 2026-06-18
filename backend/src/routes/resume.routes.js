/**
 * @module routes/resume
 * @description AI resume generation routes — all protected by auth middleware.
 */

const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resume.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All resume routes require authentication
router.use(authMiddleware);

router.post('/', resumeController.createResume);
router.get('/', resumeController.getResumes);
router.get('/:id', resumeController.getResumeById);
router.get('/:id/pdf', resumeController.downloadResumePDF);

module.exports = router;
