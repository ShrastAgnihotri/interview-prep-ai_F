/**
 * @module controllers/auth
 * @description Authentication controller handling user registration, login,
 * logout with token blacklisting, and session hydration (getMe).
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const TokenBlacklist = require('../models/TokenBlacklist.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Cookie configuration for JWT tokens.
 * @returns {Object} Cookie options object
 */
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

/**
 * Sign a JWT token for the given user ID.
 * @param {string} userId - MongoDB user ID
 * @returns {string} Signed JWT token
 */
const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Sanitize user document for client response (remove password).
 * @param {Object} user - Mongoose user document
 * @returns {Object} User data without password
 */
const sanitizeUser = (user) => {
  const { password, ...userData } = user.toObject();
  return userData;
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    throw ApiError.badRequest('Name, email, and password are required.');
  }

  if (password.length < 6) {
    throw ApiError.badRequest('Password must be at least 6 characters long.');
  }

  // Check for existing user
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw ApiError.badRequest('An account with this email already exists.');
  }

  // Create user (password hashed via pre-save hook)
  const user = await User.create({ name, email, password });

  // Sign JWT and set cookie
  const token = signToken(user._id);
  res.cookie('token', token, getCookieOptions());

  res.status(201).json(
    new ApiResponse(201, sanitizeUser(user), 'Account created successfully.')
  );
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and set JWT cookie
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw ApiError.badRequest('Email and password are required.');
  }

  // Find user (include password for comparison)
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  // Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  // Sign JWT and set cookie
  const token = signToken(user._id);
  res.cookie('token', token, getCookieOptions());

  res.status(200).json(
    new ApiResponse(200, sanitizeUser(user), 'Login successful.')
  );
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user — blacklist current token and clear cookie
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.token;

  if (token) {
    // Decode token to get expiration for TTL cleanup
    try {
      const decoded = jwt.decode(token);
      const expiresAt = decoded?.exp
        ? new Date(decoded.exp * 1000)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await TokenBlacklist.create({ token, expiresAt });
    } catch {
      // If decode fails, still proceed with logout
    }
  }

  // Clear the cookie
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json(
    new ApiResponse(200, null, 'Logged out successfully.')
  );
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user (session hydration)
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  if (!user) {
    throw ApiError.notFound('User not found.');
  }

  res.status(200).json(
    new ApiResponse(200, user, 'User retrieved successfully.')
  );
});

module.exports = {
  register,
  login,
  logout,
  getMe,
};
