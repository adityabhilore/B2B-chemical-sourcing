// src/utils/asyncHandler.js
// ─────────────────────────────────────────────────────────────────────────────
// Wraps an async route handler so unhandled promise rejections are forwarded
// to Express's next(err) global error handler.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {(req, res, next) => Promise<void>} fn
 * @returns Express request handler
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
