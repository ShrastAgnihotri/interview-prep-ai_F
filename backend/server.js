/**
 * @module server
 * @description Express application entry point for the Interview Prep AI backend.
 * Initializes middleware stack, mounts API routes, connects to MongoDB,
 * and starts the HTTP server with global error handling.
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const connectDB = require('./src/config/db');
const ApiError = require('./src/utils/ApiError');

// Import route modules
const authRoutes = require('./src/routes/auth.routes');
const interviewRoutes = require('./src/routes/interview.routes');
const resumeRoutes = require('./src/routes/resume.routes');

const app = express();

// =============================================================================
// Middleware Stack
// =============================================================================

/** Security headers via Helmet */
app.use(helmet());

/** HTTP request logging (dev format for development) */
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

/** CORS configuration — allows credentials (cookies) from the frontend origin */
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

/** Parse JSON request bodies with a 10MB size limit */
app.use(express.json({ limit: '10mb' }));

/** Parse URL-encoded request bodies */
app.use(express.urlencoded({ extended: true }));

/** Parse cookies from incoming requests */
app.use(cookieParser());

// =============================================================================
// API Routes
// =============================================================================

/** Health check endpoint */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Interview Prep AI API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/** Authentication routes (register, login, logout, profile) */
app.use('/api/auth', authRoutes);

/** Interview session routes (CRUD + PDF download) */
app.use('/api/interviews', interviewRoutes);

/** Resume management routes (CRUD + PDF download) */
app.use('/api/resumes', resumeRoutes);

// =============================================================================
// 404 Handler — Catch unmatched routes
// =============================================================================

app.use('*', (req, res) => {
  res.status(404).json({
    statusCode: 404,
    message: `Route ${req.originalUrl} not found`,
    success: false,
    data: null
  });
});

// =============================================================================
// Global Error Handler Middleware
// =============================================================================

/**
 * Centralized error handling middleware.
 * Handles ApiError instances with structured responses and catches unexpected errors.
 * @param {Error} err - The error object
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Log the error for debugging
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', err);
  } else {
    console.error('Error:', err.message);
  }

  // Handle known ApiError instances
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
      success: false,
      data: null
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      statusCode: 400,
      message: 'Validation Error',
      errors,
      success: false,
      data: null
    });
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      statusCode: 400,
      message: `Duplicate value for field: ${field}`,
      errors: [],
      success: false,
      data: null
    });
  }

  // Handle Mongoose cast errors (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    return res.status(400).json({
      statusCode: 400,
      message: `Invalid value for ${err.path}: ${err.value}`,
      errors: [],
      success: false,
      data: null
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      statusCode: 401,
      message: 'Invalid authentication token',
      errors: [],
      success: false,
      data: null
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      statusCode: 401,
      message: 'Authentication token has expired',
      errors: [],
      success: false,
      data: null
    });
  }

  // Fallback for unexpected errors
  return res.status(500).json({
    statusCode: 500,
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected internal server error occurred'
      : err.message || 'Internal Server Error',
    errors: [],
    success: false,
    data: null
  });
});

// =============================================================================
// Server Startup
// =============================================================================

const PORT = process.env.PORT || 5000;

/**
 * Connects to MongoDB and starts the Express server.
 * Gracefully handles connection failures and unhandled rejections.
 */
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`\n🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
      console.log(`💚 Health Check: http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections globally
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Close server gracefully, then exit
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();

module.exports = app;
