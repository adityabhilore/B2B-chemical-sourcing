// src/utils/AppError.js
// ─────────────────────────────────────────────────────────────────────────────
// Typed application error — thrown anywhere in the stack and caught by the
// global error handler in src/index.js.
// ─────────────────────────────────────────────────────────────────────────────

export class AppError extends Error {
  /**
   * @param {string} message   Human-readable error message.
   * @param {number} statusCode HTTP status code (default 500).
   * @param {string} [code]    Machine-readable error code for the client.
   */
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── Convenience factories ──────────────────────────────────────────────────

export const badRequest = (msg, code = "BAD_REQUEST") =>
  new AppError(msg, 400, code);

export const unauthorized = (msg = "Unauthorized", code = "UNAUTHORIZED") =>
  new AppError(msg, 401, code);

export const forbidden = (msg = "Forbidden", code = "FORBIDDEN") =>
  new AppError(msg, 403, code);

export const notFound = (msg = "Not found", code = "NOT_FOUND") =>
  new AppError(msg, 404, code);

export const conflict = (msg, code = "CONFLICT") =>
  new AppError(msg, 409, code);

export const unprocessable = (msg, code = "UNPROCESSABLE") =>
  new AppError(msg, 422, code);
