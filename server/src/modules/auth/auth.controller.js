// src/modules/auth/auth.controller.js
// ─────────────────────────────────────────────────────────────────────────────
// Thin HTTP layer — delegates all logic to auth.service.js.
// ─────────────────────────────────────────────────────────────────────────────

import * as authService from "./auth.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { getCurrentUser } from "./auth.service.js";
import { unauthorized } from "../../utils/AppError.js";

const REFRESH_COOKIE = "refreshToken";

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const user = await authService.registerCustomer(req.body);
  sendSuccess(res, { user }, "Registration successful. Your account is pending admin approval.", 201);
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.loginUser(email, password);

  authService.setRefreshCookie(res, refreshToken);

  sendSuccess(res, { user, accessToken }, "Login successful");
});

export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.loginUser(email, password, "ADMIN");
  authService.setRefreshCookie(res, refreshToken);
  sendSuccess(res, { user, accessToken }, "Login successful");
});

export const me = asyncHandler(async (req, res) => {
  if (!req.user?.id) throw unauthorized("Authentication required");
  const user = await getCurrentUser(req.user.id);
  sendSuccess(res, { user });
});

// POST /api/auth/refresh
export const refresh = asyncHandler(async (req, res) => {
  const rawToken = req.cookies?.[REFRESH_COOKIE];
  const { user, accessToken, refreshToken } = await authService.rotateRefreshToken(rawToken);

  authService.setRefreshCookie(res, refreshToken);

  sendSuccess(res, { user, accessToken }, "Session refreshed");
});

// POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  const rawToken = req.cookies?.[REFRESH_COOKIE];
  await authService.logoutUser(rawToken);

  authService.clearRefreshCookie(res);

  sendSuccess(res, null, "Logged out successfully");
});

// POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.requestPasswordReset(req.body.email);
  sendSuccess(res, result, "If the account exists, password reset instructions have been sent");
});

// POST /api/auth/reset-password
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const result = await authService.resetPassword(token, password);
  sendSuccess(res, result, "Password reset successful");
});
