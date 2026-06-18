/**
 * @module models/Resume
 * @description Mongoose model for AI-enhanced resumes.
 * Stores both raw user form data and Gemini-polished content.
 */

const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, default: '' },
  startDate: { type: String, required: true },
  endDate: { type: String, default: '' },
  current: { type: Boolean, default: false },
  bullets: [{ type: String }],
}, { _id: false });

const educationSchema = new mongoose.Schema({
  degree: { type: String, required: true },
  institution: { type: String, required: true },
  year: { type: String, default: '' },
  gpa: { type: String, default: '' },
}, { _id: false });

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  technologies: [{ type: String }],
  link: { type: String, default: '' },
}, { _id: false });

const formDataSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  github: { type: String, default: '' },
  portfolio: { type: String, default: '' },
  summary: { type: String, default: '' },
  experience: [experienceSchema],
  education: [educationSchema],
  skills: [{ type: String }],
  projects: [projectSchema],
  certifications: [{ type: String }],
}, { _id: false });

const resumeSchema = new mongoose.Schema(
  {
    /** @type {mongoose.Types.ObjectId} Reference to the owning User */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },

    /** @type {Object} Raw form data submitted by the user */
    formData: {
      type: formDataSchema,
      required: [true, 'Form data is required'],
    },

    /** @type {Object} Gemini-enhanced version of formData */
    enhancedContent: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Resume', resumeSchema);
