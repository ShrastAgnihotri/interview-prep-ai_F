/**
 * @module controllers/resume
 * @description Resume controller for AI-enhanced resume generation and PDF download.
 */

const Resume = require('../models/Resume.model');
const aiService = require('../services/ai.service');
const pdfService = require('../services/pdf.service');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route   POST /api/resumes
 * @desc    Create a resume — enhance content via Gemini AI, save both raw and enhanced
 * @access  Private
 */
const createResume = asyncHandler(async (req, res) => {
  const { formData } = req.body;

  if (!formData || !formData.fullName) {
    throw ApiError.badRequest('Resume form data with at least a full name is required.');
  }

  // Enhance content with Gemini AI
  let enhancedContent;
  try {
    enhancedContent = await aiService.enhanceResumeContent(formData);
  } catch (error) {
    // If AI enhancement fails, use raw data as fallback
    console.warn('[Resume] AI enhancement failed, using raw data:', error.message);
    enhancedContent = formData;
  }

  const resume = await Resume.create({
    userId: req.user._id,
    formData,
    enhancedContent,
  });

  res.status(201).json(
    new ApiResponse(201, resume, 'Resume created and enhanced successfully.')
  );
});

/**
 * @route   GET /api/resumes
 * @desc    List all resumes for the authenticated user
 * @access  Private
 */
const getResumes = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ userId: req.user._id })
    .select('formData.fullName createdAt updatedAt')
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json(
    new ApiResponse(200, resumes, 'Resumes retrieved successfully.')
  );
});

/**
 * @route   GET /api/resumes/:id
 * @desc    Get a single resume with full data
 * @access  Private
 */
const getResumeById = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!resume) {
    throw ApiError.notFound('Resume not found.');
  }

  res.status(200).json(
    new ApiResponse(200, resume, 'Resume retrieved successfully.')
  );
});

/**
 * @route   GET /api/resumes/:id/pdf
 * @desc    Generate and download resume as ATS-friendly PDF
 * @access  Private
 */
const downloadResumePDF = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!resume) {
    throw ApiError.notFound('Resume not found.');
  }

  const content = resume.enhancedContent || resume.formData;
  const pdfBuffer = await pdfService.generateResumePDF(content);

  const fileName = `Resume-${(content.fullName || 'download').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${fileName}"`,
    'Content-Length': pdfBuffer.length,
  });

  res.send(pdfBuffer);
});

module.exports = {
  createResume,
  getResumes,
  getResumeById,
  downloadResumePDF,
};
