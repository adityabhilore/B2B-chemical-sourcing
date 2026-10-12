// src/middleware/authenticate.js
// ─────────────────────────────────────────────────────────────────────────────
// JWT access-token verification middleware.
// Reads the Bearer token from the Authorization header, verifies it, and
// attaches the decoded payload to req.user.
//
// Usage:
//   router.get("/me", authenticate, handler)
// ─────────────────────────────────────────────────────────────────────────────

import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { unauthorized } from "../utils/AppError.js";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Verify JWT access token.
 * Attaches { id, email, role } to req.user on success.
 */
export const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return next(unauthorized("No access token provided"));
  }

  const token = header.slice(7);

  let payload;
  try {
    payload = jwt.verify(token, config.jwt.accessSecret);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(unauthorized("Access token expired", "TOKEN_EXPIRED"));
    }
    return next(unauthorized("Invalid access token", "TOKEN_INVALID"));
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: { id: true, email: true, role: true, isActive: true } });
  if (!user || !user.isActive) return next(unauthorized("Session is no longer active"));
  req.user = { id: user.id, email: user.email, role: user.role };
  next();
});
