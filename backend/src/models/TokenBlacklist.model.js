/**
 * @module models/TokenBlacklist
 * @description Blacklisted JWT tokens for secure logout functionality.
 * Uses a MongoDB TTL (Time-To-Live) index on the expiresAt field
 * to automatically remove expired tokens, preventing unbounded growth.
 */

const mongoose = require('mongoose');

/**
 * @typedef {Object} TokenBlacklistDocument
 * @property {string} token - The blacklisted JWT token string
 * @property {Date} expiresAt - When this token was set to expire (used for TTL cleanup)
 */
const tokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: [true, 'Token is required'],
    index: true,
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiration date is required'],
  },
});

/**
 * TTL index on expiresAt field.
 * MongoDB automatically removes documents once the expiresAt timestamp is reached.
 * This ensures the blacklist collection stays clean without manual cleanup jobs.
 */
tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('TokenBlacklist', tokenBlacklistSchema);
