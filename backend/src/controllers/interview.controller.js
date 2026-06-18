/**
 * @module controllers/interview
 * @description Interview controller for creating AI-powered analyses,
 * listing/retrieving interviews, and generating downloadable PDF reports.
 */

const pdfParse = require('pdf-parse');
const Interview = require('../models/Interview.model');
const aiService = require('../services/ai.service');
const pdfService = require('../services/pdf.service');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route   POST /api/interviews
 * @desc    Create a new interview analysis — extract PDF, call Gemini, store report
 * @access  Private
 */
const createInterview = asyncHandler(async (req, res) => {
  const { jobTitle, company, jobDescription, profileDescription } = req.body;

  // Validate required fields
  if (!jobTitle || !jobDescription) {
    throw ApiError.badRequest('Job title and job description are required.');
  }

  if (!req.file) {
    throw ApiError.badRequest('Resume PDF file is required.');
  }

  // Extract text from uploaded PDF buffer
  let resumeText;
  try {
    const pdfData = await pdfParse(req.file.buffer);
    resumeText = pdfData.text;

    if (!resumeText || resumeText.trim().length < 50) {
      throw new Error('Insufficient text extracted');
    }
  } catch (err) {
    throw ApiError.badRequest(
      'Could not extract text from the PDF. Please ensure the file contains readable text (not scanned images).'
    );
  }

  // Create interview record with 'processing' status
  const interview = await Interview.create({
    userId: req.user._id,
    jobTitle,
    company: company || '',
    jobDescription,
    resumeText,
    profileDescription: profileDescription || '',
    status: 'processing',
  });

  try {
    // Call Gemini AI for analysis
    const aiReport = await aiService.analyzeInterview(
      jobDescription,
      resumeText,
      profileDescription || ''
    );

    // Update interview with AI results
    interview.aiReport = {
      executiveSummary: aiReport.executiveSummary,
      technicalQuestions: aiReport.technicalQuestions,
      behavioralStrategies: aiReport.behavioralStrategies,
      skillGapAnalysis: aiReport.skillGapAnalysis,
      preparationRoadmap: aiReport.preparationRoadmap,
    };
    interview.matchScore = aiReport.matchScore;
    interview.status = 'completed';
    await interview.save();

    res.status(201).json(
      new ApiResponse(201, interview, 'Interview analysis completed successfully.')
    );
  } catch (error) {
    // Mark as failed but preserve the record
    interview.status = 'failed';
    await interview.save();

    throw ApiError.internal(
      `AI analysis failed: ${error.message}. The interview has been saved — you can retry later.`
    );
  }
});

/**
 * @route   GET /api/interviews
 * @desc    List all interviews for the authenticated user (summary view)
 * @access  Private
 */
const getInterviews = asyncHandler(async (req, res) => {
  const interviews = await Interview.find({ userId: req.user._id })
    .select('jobTitle company matchScore status createdAt')
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json(
    new ApiResponse(200, interviews, 'Interviews retrieved successfully.')
  );
});

/**
 * @route   GET /api/interviews/:id
 * @desc    Get full interview with complete AI report
 * @access  Private
 */
const getInterviewById = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!interview) {
    throw ApiError.notFound('Interview not found.');
  }

  res.status(200).json(
    new ApiResponse(200, interview, 'Interview retrieved successfully.')
  );
});

/**
 * @route   DELETE /api/interviews/:id
 * @desc    Delete an interview record
 * @access  Private
 */
const deleteInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!interview) {
    throw ApiError.notFound('Interview not found.');
  }

  res.status(200).json(
    new ApiResponse(200, null, 'Interview deleted successfully.')
  );
});

/**
 * @route   GET /api/interviews/:id/pdf
 * @desc    Generate and download interview report as PDF
 * @access  Private
 */
const downloadReportPDF = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!interview) {
    throw ApiError.notFound('Interview not found.');
  }

  if (interview.status !== 'completed') {
    throw ApiError.badRequest('Report PDF is only available for completed analyses.');
  }

  const pdfBuffer = await pdfService.generateReportPDF(interview.toObject());

  const fileName = `PrepAI-Report-${interview.jobTitle.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${fileName}"`,
    'Content-Length': pdfBuffer.length,
  });

  res.send(pdfBuffer);
});

module.exports = {
  createInterview,
  getInterviews,
  getInterviewById,
  deleteInterview,
  downloadReportPDF,
};
