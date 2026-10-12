// src/middleware/authorise.js
// ─────────────────────────────────────────────────────────────────────────────
// Role-based access control middleware factory.
// Must be used AFTER authenticate.
//
// Usage:
//   router.post("/admin/products", authenticate, authorise("ADMIN"), handler)
//   router.get("/orders",          authenticate, authorise("CUSTOMER", "ADMIN"), handler)
// ─────────────────────────────────────────────────────────────────────────────

import { forbidden } from "../utils/AppError.js";

/**
 * @param {...string} roles   Allowed roles (e.g. "ADMIN", "CUSTOMER").
 * @returns Express middleware
 */
export function authorise(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(forbidden("Authentication required before authorisation"));
    }
    if (!roles.includes(req.user.role)) {
      return next(forbidden(`Role '${req.user.role}' is not authorised for this resource`));
    }
    next();
  };
}

// ─── Named shortcuts ─────────────────────────────────────────────────────────

/** Only ADMIN can access. */
export const adminOnly = authorise("ADMIN");
export const requireRole = authorise;
export const requireAdmin = authorise("ADMIN");
export const requireCustomer = authorise("CUSTOMER");

/** CUSTOMER or ADMIN can access. */
export const customerOrAdmin = authorise("CUSTOMER", "ADMIN");
