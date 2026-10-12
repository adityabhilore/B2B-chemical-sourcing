// src/utils/notify.js
// ─────────────────────────────────────────────────────────────────────────────
// Notification dispatcher — wraps sendMail() and logs every attempt (success
// or failure) to the NotificationLog table.
//
// CRITICAL RULE: This function NEVER throws. Notification failures must not
// abort business transactions (orders, registrations, etc.).
// ─────────────────────────────────────────────────────────────────────────────

import { sendMail } from "../lib/mailer.js";
import { prisma } from "../lib/prisma.js";

/**
 * Send an email and log the result to NotificationLog.
 *
 * @param {object} opts
 * @param {string} opts.to               Recipient email address
 * @param {string} opts.subject          Email subject
 * @param {string} opts.html             Rendered HTML body
 * @param {string} [opts.templateId]     e.g. "ORDER_CONFIRMED" (for log filtering)
 * @param {string} [opts.userId]         FK to User (nullable)
 * @param {string} [opts.relatedEntity]  e.g. "OrderRequest"
 * @param {string} [opts.relatedEntityId] cuid of the related record
 */
export async function notifyEmail({
  to,
  subject,
  html,
  templateId,
  userId,
  relatedEntity,
  relatedEntityId,
  orderRequestId,
}) {
  // Create a PENDING log entry first
  let logId;
  try {
    const log = await prisma.notificationLog.create({
      data: {
        channel: "EMAIL",
        status: "PENDING",
        recipient: to,
        subject,
        templateId,
        userId: userId ?? null,
        relatedEntity: relatedEntity ?? null,
        relatedEntityId: relatedEntityId ?? null,
        orderRequestId: orderRequestId ?? null,
      },
    });
    logId = log.id;
  } catch {
    // If even logging fails, we still try to send (and swallow all errors)
  }

  // Attempt send
  const { ok, messageId, error } = await sendMail({ to, subject, html });

  // Update log with result
  if (logId) {
    try {
      await prisma.notificationLog.update({
        where: { id: logId },
        data: {
          status: ok ? "SENT" : "FAILED",
          sentAt: ok ? new Date() : null,
          error: ok ? null : error,
          body: html.slice(0, 2000), // store first 2000 chars for debugging
        },
      });
    } catch {
      // Non-fatal — log update failure does not matter
    }
  }

  if (!ok) {
    console.error(`[notify] Email FAILED to ${to} (template: ${templateId}): ${error}`);
  }
}

/**
 * Retry a failed notification by log ID.
 * Used by the admin /api/admin/notifications/retry/:id endpoint.
 */
export async function retryNotification(logId) {
  const log = await prisma.notificationLog.findUnique({ where: { id: logId } });
  if (!log) throw new Error("Notification log not found");
  if (log.status === "SENT") throw new Error("Notification was already sent successfully");
  if (log.channel !== "EMAIL") throw new Error("Retry is only supported for EMAIL channel currently");

  const { ok, error } = await sendMail({
    to: log.recipient,
    subject: log.subject ?? "(no subject)",
    html: log.body ?? "<p>Message body unavailable</p>",
  });

  await prisma.notificationLog.update({
    where: { id: logId },
    data: {
      status: ok ? "SENT" : "FAILED",
      sentAt: ok ? new Date() : log.sentAt,
      error: ok ? null : error,
    },
  });

  return { ok };
}
