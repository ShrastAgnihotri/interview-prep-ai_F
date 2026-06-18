/**
 * @module utils/ApiResponse
 * @description Standard API response wrapper for consistent JSON responses.
 * Automatically determines success status based on the HTTP status code.
 */

class ApiResponse {
  /**
   * Creates a new standardized API response object.
   *
   * @param {number} statusCode - HTTP status code (e.g., 200, 201)
   * @param {*} data - The response payload (can be any type: object, array, null)
   * @param {string} [message='Success'] - Human-readable response message
   */
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

module.exports = ApiResponse;
