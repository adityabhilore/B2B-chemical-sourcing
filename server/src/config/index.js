// src/config/index.js
// ─────────────────────────────────────────────────────────────────────────────
// Central configuration — all env vars validated at startup.
// The server will crash immediately (not silently) if a required var is missing.
// ─────────────────────────────────────────────────────────────────────────────

function required(name) {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required env var: ${name}`);
  return val;
}

function optional(name, defaultVal = undefined) {
  return process.env[name] ?? defaultVal;
}

export const config = {
  env: optional("NODE_ENV", "development"),
  port: parseInt(optional("PORT", "5000"), 10),
  isDev: optional("NODE_ENV", "development") === "development",

  db: {
    url: required("DATABASE_URL"),
  },

  jwt: {
    accessSecret: required("JWT_ACCESS_SECRET"),
    refreshSecret: required("JWT_REFRESH_SECRET"),
    accessExpiresIn: optional("JWT_ACCESS_EXPIRES_IN", "15m"),
    refreshExpiresIn: optional("JWT_REFRESH_EXPIRES_IN", "7d"),
  },

  cors: {
    origin: optional("CLIENT_ORIGIN", "http://localhost:5173"),
  },

  cloudinary: {
    cloudName: required("CLOUDINARY_CLOUD_NAME"),
    apiKey: required("CLOUDINARY_API_KEY"),
    apiSecret: required("CLOUDINARY_API_SECRET"),
  },

  email: {
    host: optional("SMTP_HOST", "smtp.gmail.com"),
    port: parseInt(optional("SMTP_PORT", "587"), 10),
    secure: optional("SMTP_SECURE", "false") === "true",
    user: required("SMTP_USER"),
    pass: required("SMTP_PASS"),
    from: optional("EMAIL_FROM", "Chemical Market <no-reply@example.com>"),
  },

  // Password-reset token TTL (ms)
  passwordResetTtlMs: 60 * 60 * 1000, // 1 hour
};
