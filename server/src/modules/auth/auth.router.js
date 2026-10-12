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

const router = Router();

// Stricter rate limit for auth endpoints — prevents brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({ success: false, data: null, message: "Too many requests, please try again later.", errors: null }),
});

router.use(authLimiter);

// ─── Routes ──────────────────────────────────────────────────────────────────

router.post("/register",        validate(registerSchema),       ctrl.register);
router.post("/login",           validate(loginSchema),          ctrl.login);
router.post("/admin/login",     validate(loginSchema),          ctrl.adminLogin);
router.get("/me",               authenticate,                   ctrl.me);
router.post("/refresh",                                         ctrl.refresh);
router.post("/logout",                                          ctrl.logout);
router.post("/forgot-password", validate(forgotPasswordSchema), ctrl.forgotPassword);
router.post("/reset-password",  validate(resetPasswordSchema),  ctrl.resetPassword);

export default router;
