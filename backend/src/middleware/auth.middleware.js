/**
 * @module middleware/auth
 * @description JWT authentication middleware with token blacklist checking.
 * Extracts token from HttpOnly cookies, verifies validity,
 * checks against blacklist, and attaches user to request.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const TokenBlacklist = require('../models/TokenBlacklist.model');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Protect routes — verify JWT from HttpOnly cookie.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const authMiddleware = asyncHandler(async (req, _res, next) => {
  // 1. Extract token from cookie
  const token = req.cookies?.token;

  if (!token) {
    throw ApiError.unauthorized('Authentication required. Please log in.');
  }

  // 2. Check if token has been blacklisted (logout invalidation)
  const blacklisted = await TokenBlacklist.findOne({ token });
  if (blacklisted) {
    throw ApiError.unauthorized('Token has been invalidated. Please log in again.');
  }

  // 3. Verify token signature and expiration
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Session expired. Please log in again.');
    }
    throw ApiError.unauthorized('Invalid authentication token.');
  }

  // 4. Fetch user and attach to request (exclude password)
  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    throw ApiError.unauthorized('User associated with this token no longer exists.');
  }

  req.user = user;
  next();
});

module.exports = authMiddleware;
