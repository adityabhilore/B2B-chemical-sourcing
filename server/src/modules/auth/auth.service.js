// src/modules/auth/auth.service.js
// ─────────────────────────────────────────────────────────────────────────────
// Auth business logic — all DB interactions and token operations.
// Controllers are thin wrappers; all logic lives here.
// ─────────────────────────────────────────────────────────────────────────────

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../../lib/prisma.js";
import { config } from "../../config/index.js";
import { sendMail } from "../../lib/mailer.js";
import { sanitiseUser, sanitiseCustomerProfile } from "../../utils/sanitise.js";
import {
  conflict,
  unauthorized,
  notFound,
  badRequest,
} from "../../utils/AppError.js";

const BCRYPT_ROUNDS = 12;
const REFRESH_COOKIE_NAME = "refreshToken";
const MAX_LOGIN_FAILURES = 5;
const LOGIN_LOCK_MS = 15 * 60 * 1000;

// ─── Token helpers ────────────────────────────────────────────────────────────

function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiresIn }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    { sub: user.id },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );
}

function refreshTokenExpiry() {
  // Parse "7d" / "30d" / "24h" style strings into a Date
  const raw = config.jwt.refreshExpiresIn;
  const match = raw.match(/^(\d+)([smhd])$/);
  if (!match) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const [, num, unit] = match;
  const ms = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[unit];
  return new Date(Date.now() + parseInt(num, 10) * ms);
}

export function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: config.env === "production",
    sameSite: "strict",
    expires: refreshTokenExpiry(),
    path: "/api/auth",
  });
}

export function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: config.env === "production",
    sameSite: "strict",
    path: "/api/auth",
  });
}

// ─── Service functions ────────────────────────────────────────────────────────

/**
 * Register a new customer.
 * Creates User + CustomerProfile.
 * isApproved defaults to false — admin must approve before ordering.
 */
export async function registerCustomer(data) {
  const { fullName, email, phone, password, companyName, businessType } = data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw conflict("Unable to complete registration with these details", "REGISTRATION_FAILED");

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  let user;
  try {
    user = await prisma.user.create({
    data: {
      fullName,
      email,
      phone,
      passwordHash,
      role: "CUSTOMER",
      isApproved: false,
      isActive: true,
      profile: {
        create: {
          companyName: companyName ?? null,
          businessType: businessType ?? null,
        },
      },
    },
    include: { profile: true },
    });
  } catch (error) {
    // Handles the duplicate-email race without echoing whether the address exists.
    if (error.code === "P2002") throw conflict("Unable to complete registration with these details", "REGISTRATION_FAILED");
    throw error;
  }

  // Best-effort welcome email — never throws
  sendMail({
    to: email,
    subject: "Welcome to Chemical Market — Account Pending Approval",
    html: `<p>Dear ${fullName},</p>
           <p>Thank you for registering. Your account is pending admin approval.
           You will receive an email once your account has been activated.</p>`,
  }).catch(() => {});

  const sanitised = sanitiseUser(user);
  if (sanitised.profile) {
    sanitised.profile = sanitiseCustomerProfile(sanitised.profile);
  }
  return sanitised;
}

/**
 * Log in with email + password.
 * Returns { user, accessToken, refreshToken }.
 */
export async function loginUser(email, password, requiredRole = "CUSTOMER") {
  const user = await prisma.user.findUnique({ where: { email } });
  const passwordMatches = user
    ? await bcrypt.compare(password, user.passwordHash)
    : (await bcrypt.hash(password, BCRYPT_ROUNDS), false);
  const currentlyLocked = user?.lockedUntil && user.lockedUntil > new Date();

  if (!user || !passwordMatches || currentlyLocked || !user.isActive || user.role !== requiredRole) {
    if (user && !passwordMatches && !currentlyLocked) {
      const failures = user.failedLoginAttempts + 1;
      const lockTriggered = failures >= MAX_LOGIN_FAILURES;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: lockTriggered ? 0 : failures,
          lockedUntil: lockTriggered ? new Date(Date.now() + LOGIN_LOCK_MS) : null,
        },
      });
    }
    throw unauthorized("Invalid email or password");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });

  const accessToken = signAccessToken(user);
  const rawRefreshToken = signRefreshToken(user);

  // Persist refresh token in DB
  await prisma.refreshToken.create({
    data: {
      token: rawRefreshToken,
      userId: user.id,
      expiresAt: refreshTokenExpiry(),
    },
  });

  return {
    user: sanitiseUser(user),
    accessToken,
    refreshToken: rawRefreshToken,
  };
}

/**
 * Rotate refresh token (sliding session).
 * Verifies the old token, deletes it, issues new pair.
 */
export async function rotateRefreshToken(rawToken) {
  if (!rawToken) throw unauthorized("No refresh token provided");

  let payload;
  try {
    payload = jwt.verify(rawToken, config.jwt.refreshSecret);
  } catch {
    throw unauthorized("Invalid or expired refresh token");
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token: rawToken } });
  if (!stored) throw unauthorized("Refresh token not recognised (possible reuse)");

  if (stored.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { id: stored.id } });
    throw unauthorized("Refresh token expired");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isActive || (user.lockedUntil && user.lockedUntil > new Date())) {
    throw unauthorized("Invalid or expired refresh token");
  }

  // Rotate — delete old, issue new
  const newRefreshToken = signRefreshToken(user);
  await prisma.$transaction([
    prisma.refreshToken.delete({ where: { id: stored.id } }),
    prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: user.id,
        expiresAt: refreshTokenExpiry(),
      },
    }),
  ]);

  return {
    user: sanitiseUser(user),
    accessToken: signAccessToken(user),
    refreshToken: newRefreshToken,
  };
}

/**
 * Logout — delete the refresh token from DB.
 * Silently succeeds if token not found.
 */
export async function logoutUser(rawToken) {
  if (!rawToken) return;
  try {
    await prisma.refreshToken.delete({ where: { token: rawToken } });
  } catch {
    // P2025 = record not found — fine, already deleted
  }
}

/**
 * Initiate password reset — generate a secure token, store hashed version,
 * and send reset email.
 * Always responds OK (don't reveal whether email exists).
 */
export async function requestPasswordReset(email) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    // Invalidate any existing tokens for this email
    await prisma.passwordResetToken.deleteMany({ where: { email } });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    await prisma.passwordResetToken.create({
      data: {
        email,
        token: hashedToken,
        expiresAt: new Date(Date.now() + config.passwordResetTtlMs),
      },
    });

    // CLIENT_ORIGIN is used so the reset link points to the frontend
    const resetUrl = `${config.cors.origin}/auth/reset-password?token=${rawToken}`;

    sendMail({
      to: email,
      subject: "Chemical Market — Password Reset Request",
      html: `<p>Dear ${user.fullName},</p>
             <p>Click the link below to reset your password. This link expires in 1 hour.</p>
             <p><a href="${resetUrl}">${resetUrl}</a></p>
             <p>If you did not request this, please ignore this email.</p>`,
    }).catch(() => {});
  }

  // Always return the same message
  return { message: "If an account exists for that email, a reset link has been sent." };
}

/**
 * Complete password reset using the raw token from the email link.
 */
export async function resetPassword(rawToken, newPassword) {
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  const record = await prisma.passwordResetToken.findUnique({
    where: { token: hashedToken },
  });

  if (!record) throw badRequest("Invalid or expired reset token");
  if (record.usedAt) throw badRequest("This reset link has already been used");
  if (record.expiresAt < new Date()) throw badRequest("Reset token has expired");

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  await prisma.$transaction([
    prisma.user.update({
      where: { email: record.email },
      data: { passwordHash, failedLoginAttempts: 0, lockedUntil: null },
    }),
    prisma.passwordResetToken.update({
      where: { token: hashedToken },
      data: { usedAt: new Date() },
    }),
    // Invalidate all existing refresh tokens for this user
    prisma.refreshToken.deleteMany({
      where: { user: { email: record.email } },
    }),
  ]);

  return { message: "Password has been reset successfully. Please log in." };
}

/**
 * Change password (authenticated customer).
 * Verifies current password before updating.
 */
export async function changePassword(userId, currentPassword, newPassword) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw notFound("User not found");

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw unauthorized("Current password is incorrect");

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { passwordHash, failedLoginAttempts: 0, lockedUntil: null } }),
    // Invalidate all refresh tokens — forces re-login on other devices
    prisma.refreshToken.deleteMany({ where: { userId } }),
  ]);

  return { message: "Password changed successfully." };
}

/** Load the current active account for /api/auth/me. */
export async function getCurrentUser(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.isActive) throw unauthorized("Session is no longer active");
  return sanitiseUser(user);
}
