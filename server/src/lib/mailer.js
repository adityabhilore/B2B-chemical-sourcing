// src/lib/mailer.js
// ─────────────────────────────────────────────────────────────────────────────
// Nodemailer transport singleton + generic send helper.
// All sends are wrapped to return { ok, error } — they NEVER throw so that
// a notification failure cannot abort an order transaction.
// ─────────────────────────────────────────────────────────────────────────────

import nodemailer from "nodemailer";
import { config } from "../config/index.js";
import { reportOperationalFailure } from "../utils/observability.js";

const transport = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

/**
 * Send an email.
 * @param {{ to: string, subject: string, html: string, text?: string }} opts
 * @returns {Promise<{ ok: boolean, messageId?: string, error?: string }>}
 */
export async function sendMail({ to, subject, html, text }) {
  try {
    const info = await transport.sendMail({
      from: config.email.from,
      to,
      subject,
      html,
      text: text ?? html.replace(/<[^>]+>/g, ""),
    });
    return { ok: true, messageId: info.messageId };
  } catch (err) {
    reportOperationalFailure('email', err);
    return { ok: false, error: err.message };
  }
}

/**
 * Verify SMTP connectivity (call at startup in dev to catch misconfig early).
 */
export async function verifyMailer() {
  if (!config.isDev) return;
  try {
    await transport.verify();
    console.log("✓ SMTP connection verified");
  } catch (err) {
    reportOperationalFailure('smtp_startup_check', err);
  }
}
