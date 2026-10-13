// src/modules/auth/auth.router.js
// ─────────────────────────────────────────────────────────────────────────────
// Auth routes — mounted at /api/auth in src/index.js
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from "express";
import rateLimit from "express-rate-limit";
import { validate } from "../../middleware/validate.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.schemas.js";
import * as ctrl from "./auth.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { config } from "../../config/index.js";

const router = Router();

// Keep brute-force protection scoped to credential attempts. Applying this
// limit to every auth route also counted normal session refreshes as logins.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  skip: () => config.isDev,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({ success: false, data: null, message: "Too many failed sign-in attempts. Please wait 15 minutes before trying again.", errors: null }),
});

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  skip: (req) => config.isDev || !req.cookies?.refreshToken,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({ success: false, data: null, message: "Too many session refreshes. Please sign in again later.", errors: null }),
});

// ─── Routes ──────────────────────────────────────────────────────────────────

router.post("/register",        validate(registerSchema),       ctrl.register);
router.post("/login",           loginLimiter, validate(loginSchema),          ctrl.login);
router.post("/admin/login",     loginLimiter, validate(loginSchema),          ctrl.adminLogin);
router.get("/me",               authenticate,                   ctrl.me);
router.post("/refresh",        refreshLimiter,                  ctrl.refresh);
router.post("/logout",                                          ctrl.logout);
router.post("/forgot-password", validate(forgotPasswordSchema), ctrl.forgotPassword);
router.post("/reset-password",  validate(resetPasswordSchema),  ctrl.resetPassword);

export default router;
