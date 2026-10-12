// src/templates/email/templates.js
// ─────────────────────────────────────────────────────────────────────────────
// All transactional email templates in one place.
// Each returns { subject, html } ready to pass to sendMail().
// ─────────────────────────────────────────────────────────────────────────────

import { baseLayout } from "./baseLayout.js";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export function welcomePendingApproval({ fullName }) {
  return {
    subject: "Welcome to Chemical Market — Account Pending Approval",
    html: baseLayout({
      title: "Account Pending Approval",
      body: `
        <h2 style="color:#1a3a5c;margin-top:0;">Welcome, ${fullName}!</h2>
        <p>Thank you for registering with <strong>Chemical Market</strong>.</p>
        <p>Your account is currently <strong>pending admin approval</strong>. 
           You will receive another email once your account has been activated and 
           you can start placing order requests.</p>
        <p>If you have any questions in the meantime, please contact us.</p>
      `,
    }),
  };
}

export function accountApproved({ fullName, loginUrl }) {
  return {
    subject: "Your Chemical Market Account Has Been Approved!",
    html: baseLayout({
      title: "Account Approved",
      body: `
        <h2 style="color:#1a3a5c;margin-top:0;">Great news, ${fullName}!</h2>
        <p>Your <strong>Chemical Market</strong> account has been approved. 
           You can now browse our full catalogue and submit order requests.</p>
        <p style="text-align:center;margin:28px 0;">
          <a href="${loginUrl}" 
             style="background:#1a3a5c;color:#fff;padding:12px 28px;border-radius:5px;text-decoration:none;font-weight:bold;">
            Log In to Your Account
          </a>
        </p>
      `,
    }),
  };
}

export function passwordResetRequest({ fullName, resetUrl }) {
  return {
    subject: "Chemical Market — Password Reset Request",
    html: baseLayout({
      title: "Password Reset",
      body: `
        <h2 style="color:#1a3a5c;margin-top:0;">Password Reset</h2>
        <p>Hi ${fullName},</p>
        <p>We received a request to reset your password. Click the button below to proceed. 
           This link is valid for <strong>1 hour</strong>.</p>
        <p style="text-align:center;margin:28px 0;">
          <a href="${resetUrl}" 
             style="background:#c0392b;color:#fff;padding:12px 28px;border-radius:5px;text-decoration:none;font-weight:bold;">
            Reset Password
          </a>
        </p>
        <p>If you did not request this, you can safely ignore this email — your password will not change.</p>
      `,
      footerNote: "For security, this link expires in 1 hour and can only be used once.",
    }),
  };
}

// ─── Order Status ─────────────────────────────────────────────────────────────

export function orderReceived({ fullName, orderId, items, estimatedTotal, currency = "INR" }) {
  const itemRows = items
    .map(
      (i) => `<tr>
        <td style="padding:8px 4px;border-bottom:1px solid #eee;">${i.snapshotProductName} — ${i.snapshotVariantLabel}</td>
        <td style="padding:8px 4px;border-bottom:1px solid #eee;text-align:center;">${i.quantity} ${i.snapshotUnit}</td>
        <td style="padding:8px 4px;border-bottom:1px solid #eee;text-align:right;">
          ${i.snapshotPrice != null ? `${currency} ${Number(i.snapshotPrice).toFixed(2)}` : "Request a Quote"}
        </td>
      </tr>`
    )
    .join("");

  return {
    subject: `Order Request Received — #${orderId.slice(-8).toUpperCase()}`,
    html: baseLayout({
      title: "Order Request Received",
      body: `
        <h2 style="color:#1a3a5c;margin-top:0;">Order Request Received</h2>
        <p>Hi ${fullName},</p>
        <p>We have received your order request <strong>#${orderId.slice(-8).toUpperCase()}</strong>. 
           Our team will review it and confirm the details shortly.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-collapse:collapse;">
          <thead>
            <tr style="background:#f0f4f8;">
              <th style="padding:10px 4px;text-align:left;font-size:12px;color:#666;">Product</th>
              <th style="padding:10px 4px;text-align:center;font-size:12px;color:#666;">Qty</th>
              <th style="padding:10px 4px;text-align:right;font-size:12px;color:#666;">Unit Price</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
          ${
            estimatedTotal != null
              ? `<tfoot>
                  <tr>
                    <td colspan="2" style="padding:10px 4px;text-align:right;font-weight:bold;">Estimated Total:</td>
                    <td style="padding:10px 4px;text-align:right;font-weight:bold;">${currency} ${Number(estimatedTotal).toFixed(2)}</td>
                  </tr>
                </tfoot>`
              : ""
          }
        </table>
        <p style="font-size:12px;color:#888;">
          Note: Final pricing and availability are subject to confirmation by our team.
        </p>
      `,
    }),
  };
}

export function orderStatusUpdate({ fullName, orderId, newStatus, note, confirmedTotal, currency = "INR" }) {
  const statusLabels = {
    CONFIRMED: { label: "Confirmed", color: "#27ae60", message: "Your order has been confirmed." },
    PROCESSING: { label: "Processing", color: "#2980b9", message: "Your order is now being processed." },
    SHIPPED: { label: "Shipped", color: "#8e44ad", message: "Your order is on its way!" },
    DELIVERED: { label: "Delivered", color: "#27ae60", message: "Your order has been delivered. Thank you for your business!" },
    CANCELLED: { label: "Cancelled", color: "#e74c3c", message: "Your order has been cancelled." },
  };

  const s = statusLabels[newStatus] ?? { label: newStatus, color: "#555", message: "" };

  return {
    subject: `Order #${orderId.slice(-8).toUpperCase()} — ${s.label}`,
    html: baseLayout({
      title: `Order ${s.label}`,
      body: `
        <h2 style="color:#1a3a5c;margin-top:0;">Order Update</h2>
        <p>Hi ${fullName},</p>
        <p>${s.message}</p>
        <p>
          <strong>Order:</strong> #${orderId.slice(-8).toUpperCase()}<br/>
          <strong>Status:</strong> 
          <span style="color:${s.color};font-weight:bold;">${s.label}</span>
        </p>
        ${
          confirmedTotal != null && newStatus === "CONFIRMED"
            ? `<p><strong>Confirmed Total:</strong> ${currency} ${Number(confirmedTotal).toFixed(2)}</p>`
            : ""
        }
        ${note ? `<p><strong>Message from our team:</strong><br/>${note}</p>` : ""}
      `,
    }),
  };
}

// ─── Admin internal alert ─────────────────────────────────────────────────────

export function adminNewOrderAlert({ orderId, customerName, customerEmail, itemCount, adminOrderUrl }) {
  return {
    subject: `[Chemical Market] New Order Request — #${orderId.slice(-8).toUpperCase()}`,
    html: baseLayout({
      title: "New Order Request",
      body: `
        <h2 style="color:#1a3a5c;margin-top:0;">New Order Request</h2>
        <p>A new order request has been submitted:</p>
        <ul>
          <li><strong>Order ID:</strong> #${orderId.slice(-8).toUpperCase()}</li>
          <li><strong>Customer:</strong> ${customerName} (${customerEmail})</li>
          <li><strong>Items:</strong> ${itemCount}</li>
        </ul>
        <p style="text-align:center;margin:24px 0;">
          <a href="${adminOrderUrl}" 
             style="background:#1a3a5c;color:#fff;padding:12px 28px;border-radius:5px;text-decoration:none;font-weight:bold;">
            View Order in Admin
          </a>
        </p>
      `,
    }),
  };
}
