/**
 * @module models/Interview
 * @description Interview session model storing job details, extracted resume text,
 * and the AI-generated comprehensive interview preparation report.
 * Includes sub-schemas for technical questions, behavioral strategies,
 * skill gap analysis, and a 7-day preparation roadmap.
 */

const mongoose = require('mongoose');

// =============================================================================
// Sub-Schemas
// =============================================================================

/**
 * Schema for individual technical interview questions.
 * Each question includes the expected answer, difficulty level, and topic area.
 */
const technicalQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    expectedAnswer: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    topic: { type: String, required: true },
  },
  { _id: false }
);

/**
 * Schema for behavioral interview strategies using the STAR method.
 * Provides structured response templates with situational guidance.
 */
const behavioralStrategySchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    situation: { type: String, required: true },
    task: { type: String, required: true },
    action: { type: String, required: true },
    result: { type: String, required: true },
    tip: { type: String, required: true },
  },
  { _id: false }
);

/**
 * Schema for skill gap analysis entries.
 * Identifies gaps between candidate skills and job requirements.
 */
const skillGapSchema = new mongoose.Schema(
  {
    skill: { type: String, required: true },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
    },
    currentLevel: { type: String, required: true },
    recommendation: { type: String, required: true },
  },
  { _id: false }
);

/**
 * Schema for individual days in the preparation roadmap.
 * Each day includes a focus area, tasks, and recommended resources.
 */
const roadmapDaySchema = new mongoose.Schema(
  {
    day: { type: Number, required: true },
    focusArea: { type: String, required: true },
    tasks: [{ type: String }],
    resources: [{ type: String }],
  },
  { _id: false }
);

/**
 * Schema for the complete AI-generated interview report.
 * Contains all analysis sections produced by the Gemini AI service.
 */
const aiReportSchema = new mongoose.Schema(
  {
    executiveSummary: { type: String, default: '' },
    technicalQuestions: [technicalQuestionSchema],
    behavioralStrategies: [behavioralStrategySchema],
    skillGapAnalysis: [skillGapSchema],
    preparationRoadmap: [roadmapDaySchema],
  },
  { _id: false }
);

// =============================================================================
// Main Interview Schema
// =============================================================================

/**
 * @typedef {Object} InterviewDocument
 * @property {ObjectId} userId - Reference to the owning User
 * @property {string} jobTitle - Target job title
 * @property {string} company - Target company name
 * @property {string} jobDescription - Full job description text
 * @property {string} resumeText - Extracted text from uploaded PDF resume
 * @property {string} profileDescription - Optional additional profile context
 * @property {number} matchScore - AI-calculated match score (0-100)
 * @property {Object} aiReport - Complete AI-generated interview report
 * @property {string} status - Processing status (pending/processing/completed/failed)
 */
const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    company: {
      type: String,
      default: '',
      trim: true,
    },
    jobDescription: {
      type: String,
      required: [true, 'Job description is required'],
    },
    resumeText: {
      type: String,
      required: [true, 'Resume text is required'],
    },
    profileDescription: {
      type: String,
      default: '',
    },
    matchScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    aiReport: {
      type: aiReportSchema,
      default: () => ({}),
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Interview', interviewSchema);
