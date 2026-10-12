// src/templates/email/baseLayout.js
// ─────────────────────────────────────────────────────────────────────────────
// Shared HTML email wrapper — gives all emails a consistent branded look.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Wrap email body content in the standard branded layout.
 * @param {{ title: string, body: string, footerNote?: string }} opts
 * @returns {string} Complete HTML email string
 */
export function baseLayout({ title, body, footerNote = "" }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;font-size:14px;color:#333;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#1a3a5c;padding:24px 32px;">
              <h1 style="margin:0;font-size:22px;color:#ffffff;letter-spacing:0.5px;">Chemical Market</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f8f8;padding:20px 32px;border-top:1px solid #e8e8e8;">
              <p style="margin:0;font-size:12px;color:#888;">
                ${footerNote || "This is an automated message. Please do not reply directly to this email."}
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:#888;">
                &copy; ${new Date().getFullYear()} Chemical Market. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
