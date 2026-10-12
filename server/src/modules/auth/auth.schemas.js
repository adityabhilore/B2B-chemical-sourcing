// src/modules/auth/auth.schemas.js
// ─────────────────────────────────────────────────────────────────────────────
// Zod validation schemas for all auth endpoints.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";

const password = z
  .string()
  .min(12, "Use at least 12 characters")
  .max(128, "Password must be 128 characters or fewer")
  .regex(/[a-z]/, "Add a lowercase letter")
  .regex(/[A-Z]/, "Add an uppercase letter")
  .regex(/[0-9]/, "Add a number")
  .regex(/[^A-Za-z0-9]/, "Add a symbol");

export const registerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").toLowerCase(),
  phone: z.string().min(7, "Enter a valid phone number").max(20),
  password,
  companyName: z.string().min(2, "Company name is required").max(200),
  businessType: z.string().max(100).optional(),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: password,
});
