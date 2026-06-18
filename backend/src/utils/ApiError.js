/**
 * @module utils/ApiError
 * @description Custom error class for structured API error responses.
 * Extends the native Error class with HTTP status codes, error arrays,
 * and static factory methods for common error types.
 */

class ApiError extends Error {
  /**
   * Creates a new ApiError instance.
   *
   * @param {number} statusCode - HTTP status code (e.g., 400, 401, 404, 500)
   * @param {string} [message='Something went wrong'] - Human-readable error message
   * @param {Array<string>} [errors=[]] - Array of specific error details
   * @param {string} [stack=''] - Optional stack trace override
   */
  constructor(statusCode, message = 'Something went wrong', errors = [], stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.success = false;
    this.data = null;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Creates a 400 Bad Request error.
   * Use for invalid input, missing required fields, or validation failures.
   *
   * @param {string} [message='Bad Request'] - Error message
   * @param {Array<string>} [errors=[]] - Specific validation errors
   * @returns {ApiError} New ApiError instance with status 400
   */
  static badRequest(message = 'Bad Request', errors = []) {
    return new ApiError(400, message, errors);
  }

  /**
   * Creates a 401 Unauthorized error.
   * Use for authentication failures (missing/invalid/expired tokens).
   *
   * @param {string} [message='Unauthorized'] - Error message
   * @returns {ApiError} New ApiError instance with status 401
   */
  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  /**
   * Creates a 403 Forbidden error.
   * Use when the user is authenticated but lacks permission for the action.
   *
   * @param {string} [message='Forbidden'] - Error message
   * @returns {ApiError} New ApiError instance with status 403
   */
  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  /**
   * Creates a 404 Not Found error.
   * Use when the requested resource does not exist.
   *
   * @param {string} [message='Resource not found'] - Error message
   * @returns {ApiError} New ApiError instance with status 404
   */
  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  /**
   * Creates a 500 Internal Server Error.
   * Use for unexpected server-side errors.
   *
   * @param {string} [message='Internal Server Error'] - Error message
   * @returns {ApiError} New ApiError instance with status 500
   */
  static internal(message = 'Internal Server Error') {
    return new ApiError(500, message);
  }
}

module.exports = ApiError;
