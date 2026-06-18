/**
 * @module config/gemini
 * @description Google Generative AI (Gemini) client configuration.
 * Initializes the GoogleGenerativeAI instance with the API key
 * from environment variables for use across AI services.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Singleton GoogleGenerativeAI instance configured with the GEMINI_API_KEY.
 * Used by AI services to create model instances for content generation.
 * @type {GoogleGenerativeAI}
 */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = genAI;
