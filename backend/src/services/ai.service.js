/**
 * @module services/ai
 * @description Core AI service integrating Google Gemini for interview analysis
 * and resume content enhancement. Uses JSON response mode with
 * prompt-based schema enforcement for structured output.
 */

const genAI = require('../config/gemini');
const ApiError = require('../utils/ApiError');

// ─────────────────────────────────────────────────────────────
//  SERVICE FUNCTIONS
// ─────────────────────────────────────────────────────────────

/**
 * Analyze a candidate's resume against a job description using Gemini AI.
 * Returns structured interview preparation report.
 *
 * @param {string} jobDescription - Full job description text
 * @param {string} resumeText - Extracted resume text from PDF
 * @param {string} [profileDescription=''] - Additional candidate context
 * @returns {Promise<Object>} Structured interview report
 * @throws {ApiError} On AI service failure
 */
async function analyzeInterview(jobDescription, resumeText, profileDescription = '') {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const prompt = `You are a senior technical interviewer and career coach with 15+ years of experience at top-tier tech companies (Google, Meta, Amazon, Microsoft).

Analyze the candidate's resume against the job description and generate a comprehensive interview preparation report.

INSTRUCTIONS:
1. MATCH SCORE: Calculate a realistic match percentage (0-100) based on skills overlap, experience relevance, and qualifications alignment. Be honest — don't inflate scores.
2. EXECUTIVE SUMMARY: Write a 3-5 sentence assessment of the candidate's fit for the role, highlighting strengths and areas of concern.
3. TECHNICAL QUESTIONS (8-15): Generate role-specific technical interview questions at varying difficulties. Each question should be directly relevant to the job requirements. Provide detailed expected answers.
4. BEHAVIORAL STRATEGIES (5-8): Create behavioral interview questions with fully fleshed-out STAR method responses tailored to the candidate's likely experiences. Include a pro tip for each.
5. SKILL GAP ANALYSIS: Identify gaps between the job requirements and the candidate's current skills. Rate each gap as low/medium/high severity. Provide actionable recommendations.
6. PREPARATION ROADMAP: Create a detailed 7-day preparation plan with specific daily tasks and resources (real websites, books, tools when possible).

You MUST respond with valid JSON in this EXACT structure:
{
  "executiveSummary": "string - 3-5 sentence assessment",
  "matchScore": number between 0 and 100,
  "technicalQuestions": [
    {
      "question": "string",
      "expectedAnswer": "string - detailed answer",
      "difficulty": "easy" or "medium" or "hard",
      "topic": "string - topic category"
    }
  ],
  "behavioralStrategies": [
    {
      "question": "string",
      "situation": "string",
      "task": "string",
      "action": "string",
      "result": "string",
      "tip": "string - pro tip"
    }
  ],
  "skillGapAnalysis": [
    {
      "skill": "string",
      "severity": "low" or "medium" or "high",
      "currentLevel": "string",
      "recommendation": "string"
    }
  ],
  "preparationRoadmap": [
    {
      "day": number (1-7),
      "focusArea": "string",
      "tasks": ["string"],
      "resources": ["string"]
    }
  ]
}

=== JOB DESCRIPTION ===
${jobDescription}

=== CANDIDATE RESUME ===
${resumeText}

${profileDescription ? `=== ADDITIONAL CANDIDATE CONTEXT ===\n${profileDescription}` : ''}

Generate 10-12 technical questions, 6 behavioral strategies, and a complete 7-day roadmap. Be specific, actionable, and realistic.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const report = JSON.parse(responseText);

    return report;
  } catch (error) {
    console.error('[AI Service] Interview analysis failed:', error.message);
    throw ApiError.internal(
      `AI analysis failed: ${error.message}`
    );
  }
}

/**
 * Enhance resume content using Gemini AI for ATS optimization.
 * Polishes bullet points, improves summary, and optimizes keywords.
 *
 * @param {Object} formData - Raw resume form data from user
 * @returns {Promise<Object>} Enhanced resume content
 * @throws {ApiError} On AI service failure
 */
async function enhanceResumeContent(formData) {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const prompt = `You are an expert resume writer and ATS optimization specialist.

Given the following resume data, enhance it to be ATS-friendly and professionally compelling:

1. SUMMARY: Rewrite to be concise (2-3 sentences), keyword-rich, and impactful.
2. EXPERIENCE BULLETS: Rewrite each bullet to start with a strong action verb, include quantified results where possible (use realistic estimates if none provided), and incorporate industry keywords.
3. SKILLS: Organize and add any relevant skills implied by the experience that are missing.
4. PROJECTS: Make descriptions concise and impact-focused.
5. Keep all factual information (dates, companies, titles, degrees) EXACTLY as provided.
6. Do NOT invent experiences or qualifications — only enhance the presentation.

You MUST respond with valid JSON in this EXACT structure:
{
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "linkedin": "string",
  "github": "string",
  "portfolio": "string",
  "summary": "string - ATS-optimized professional summary",
  "experience": [
    {
      "title": "string",
      "company": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string",
      "current": boolean,
      "bullets": ["string - quantified, action-verb bullet points"]
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "year": "string",
      "gpa": "string"
    }
  ],
  "skills": ["string - ATS-friendly skill keywords"],
  "projects": [
    {
      "name": "string",
      "description": "string - concise, impact-focused",
      "technologies": ["string"],
      "link": "string"
    }
  ],
  "certifications": ["string"]
}

RESUME DATA:
${JSON.stringify(formData, null, 2)}

Return the enhanced resume data. Keep all facts identical — only improve the writing.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const enhanced = JSON.parse(responseText);

    return enhanced;
  } catch (error) {
    console.error('[AI Service] Resume enhancement failed:', error.message);
    throw ApiError.internal(
      `Resume enhancement failed: ${error.message}`
    );
  }
}

module.exports = {
  analyzeInterview,
  enhanceResumeContent,
};
