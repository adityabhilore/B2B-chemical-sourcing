// src/middleware/validate.js
// ─────────────────────────────────────────────────────────────────────────────
// Zod schema validation middleware factory.
// Validates req.body, req.query, or req.params against a Zod schema and
// replaces the input with the parsed (coerced) value on success.
//
// Usage:
//   import { z } from "zod";
//   import { validate } from "../middleware/validate.js";
//
//   const schema = z.object({ email: z.string().email(), password: z.string().min(8) });
//   router.post("/login", validate(schema), handler);
// ─────────────────────────────────────────────────────────────────────────────

import { ZodError } from "zod";

/**
 * @param {import("zod").ZodSchema} schema
 * @param {"body"|"query"|"params"} source  Default: "body"
 * @returns Express middleware
 */
export function validate(schema, source = "body") {
  return (req, _res, next) => {
    try {
      req[source] = schema.parse(req[source]);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const formatted = err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        const error = Object.assign(
          new Error("Validation failed"),
          { statusCode: 422, code: "VALIDATION_ERROR", errors: formatted }
        );
        return next(error);
      }
      next(err);
    }
  };
}
