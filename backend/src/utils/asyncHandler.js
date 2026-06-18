/**
 * @module utils/asyncHandler
 * @description Higher-order function that wraps async Express route handlers
 * to automatically catch rejected promises and forward errors to the
 * Express error handling middleware via next().
 *
 * Eliminates the need for try/catch blocks in every async controller function.
 *
 * @example
 * // Instead of:
 * router.get('/', async (req, res, next) => {
 *   try {
 *     const data = await someAsyncOp();
 *     res.json(data);
 *   } catch (error) {
 *     next(error);
 *   }
 * });
 *
 * // Use:
 * router.get('/', asyncHandler(async (req, res) => {
 *   const data = await someAsyncOp();
 *   res.json(data);
 * }));
 */

/**
 * Wraps an async function to catch errors and pass them to Express next().
 *
 * @param {Function} fn - Async Express route handler function (req, res, next) => Promise
 * @returns {Function} Wrapped Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
