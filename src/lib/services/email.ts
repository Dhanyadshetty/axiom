import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Ensure environment variables from .env.local / .env are loaded
dotenv.config({ path: '.env.local', override: false });
dotenv.config({ path: '.env', override: false });

export interface EmailPayload {
    to: string;
    subject: string;
    body: string;
    html?: string;
    replyTo?: string;
}

export interface EmailSendResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

const SUPPORT_EMAIL = 'pma.axiom.support@gmail.com';
const DEFAULT_DEV_SMTP_PASS = 'btkhckbfhxyaekze';

export async function sendEmail({ to, subject, body, html, replyTo }: EmailPayload) {
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const rawPort = Number(process.env.SMTP_PORT || 587);
    const smtpPort = Number.isFinite(rawPort) && rawPort > 0 && rawPort <= 65_535 ? rawPort : 587;
    const smtpUser = process.env.SMTP_USER || SUPPORT_EMAIL;
    const smtpPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || DEFAULT_DEV_SMTP_PASS;
    const smtpSecure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || smtpPort === 465;
    const smtpFrom = process.env.SMTP_FROM || SUPPORT_EMAIL;

    if (!smtpPass) {
        console.warn("[EMAIL] SMTP not configured. Provide SMTP_PASS (or SMTP_PASSWORD). Set SMTP_HOST if you use a provider other than the default smtp.gmail.com (other SMTP_* values are optional).");
        return {
            success: false,
            error: 'SMTP_NOT_CONFIGURED',
        } as EmailSendResult;
    }

    try {
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpSecure,
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
            connectionTimeout: 15_000,
            greetingTimeout: 10_000,
            socketTimeout: 20_000,
        });

        // Fail fast if the SMTP connection/auth is not accepted
        await transporter.verify();

        const mailOptions = {
            from: smtpFrom,
            to,
            replyTo: replyTo || smtpFrom,
            subject,
            text: body,
            html: html,
        };

        const info = await transporter.sendMail(mailOptions);

        console.log(`[EMAIL] SENT | host=${smtpHost} | from=${smtpFrom} | to=${to} | messageId=${info.messageId}`);
        return {
            success: true,
            messageId: info.messageId,
        } as EmailSendResult;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown SMTP error';
        const context = `host=${smtpHost} port=${smtpPort} secure=${smtpSecure}`;
        console.error(`[EMAIL] SEND_FAILED | ${context} | to=${to} | subject=${subject} | error=${errorMessage}`);
        return {
            success: false,
            error: `SMTP connection failed: ${errorMessage}`,
        } as EmailSendResult;
    }
}

export async function sendSupportTicket(fromEmail: string, fromName: string, subject: string, description: string) {
    return sendEmail({
        to: SUPPORT_EMAIL,
        replyTo: fromEmail,
        subject: `[Support] ${subject}`,
        body: `Support request from Axiom Platform\n\nFrom: ${fromName} <${fromEmail}>\nSubject: ${subject}\n\n${description}\n\n---\nAxiom Support | pma.axiom.support@gmail.com`,
    });
}

export function generateWelcomeEmail(name: string, email: string, tempPassword: string) {
    return {
        subject: `Welcome to Axiom, ${name}!`,
        body: `Hello ${name},

Welcome to Axiom Procurement Platform! Your account has been created.

Login credentials:
Email: ${email}
Temporary Password: ${tempPassword}

Please log in and change your password immediately.

Best regards,
The Axiom Team
pma.axiom.support@gmail.com`.trim()
    };
}

export function generateSupplierPortalWelcomeEmail(name: string, email: string, tempPassword: string) {
    return {
        subject: `Axiom supplier portal access approved for ${name}`,
        body: `Hello ${name},

Your supplier onboarding has been approved in Axiom, and your portal access is now ready.

Portal login:
Email: ${email}
Temporary Password: ${tempPassword}

What to do next:
- Sign in to the Axiom supplier portal
- Complete 2FA setup on first login
- Review open requests, documents, and active orders in your portal workspace

This credential is intended for immediate activation. Please sign in and change your password after setup.

Best regards,
The Axiom Team
pma.axiom.support@gmail.com`.trim(),
    };
}

export function generateSupplierEmailVerificationEmail(name: string, verificationLink: string) {
    return {
        subject: `Verify your email for Axiom Supplier Registration`,
        body: `Hello ${name},

Thank you for registering with Axiom! To complete your registration, please verify your email address by clicking the link below:

${verificationLink}

This link will expire in 24 hours. If you did not create this account, you can safely ignore this email.

Once your email is verified, an Axiom administrator will review your registration and guide you through the onboarding process.

Best regards,
The Axiom Team
pma.axiom.support@gmail.com`.trim(),
    };
}

export function generateSupplierUnderReviewEmail(name: string, supplierPortalLink: string) {
    return {
        subject: `Your Axiom supplier registration is under review`,
        body: `Hello ${name},

Thank you for verifying your email! Your supplier registration has been received and is now under review by our Axiom team.

What to expect next:
- Our team will review your company information and certifications
- You may be asked to provide additional documentation or evidence
- We'll keep you updated on the progress via email
- Typical review time: 1-2 business days

You can track your onboarding progress anytime by visiting:
${supplierPortalLink}

If you have any questions during this process, please don't hesitate to reach out to us.

Best regards,
The Axiom Team
pma.axiom.support@gmail.com`.trim(),
    };
}

export function generateSupplierApprovedEmail(name: string, portalLink: string, tempPassword: string) {
    return {
        subject: `Welcome! Your Axiom supplier account is now active`,
        body: `Hello ${name},

Congratulations! Your supplier registration has been approved, and your Axiom portal account is now active.

Portal access:
${portalLink}
Email: ${name}
Temporary Password: ${tempPassword}

What you can do now:
- Browse active purchase orders and requests
- Submit proposals and quotes
- Upload compliance documents
- Track delivery schedules and performance metrics
- Collaborate with our procurement team

Important: Please sign in immediately and change your temporary password for security.

If you need any assistance, our support team is available at pma.axiom.support@gmail.com

Best regards,
The Axiom Team`.trim(),
    };
}

export function generateSupplierRejectedEmail(name: string, reason?: string) {
    return {
        subject: `Update on your Axiom supplier registration`,
        body: `Hello ${name},

Thank you for your interest in joining the Axiom Procurement Network.

After careful review, we are unable to proceed with your application at this time.${reason ? `\n\nReason: ${reason}` : ''}

If you would like more information about this decision or would like to reapply in the future, please contact our team at pma.axiom.support@gmail.com.

Best regards,
The Axiom Team
pma.axiom.support@gmail.com`.trim(),
    };
}

export function generatePasswordResetEmail(name: string, resetLink: string) {
    return {
        subject: `Reset your Axiom password`,
        body: `Hello ${name},

We received a request to reset your Axiom password. Click the link below to create a new password:

${resetLink}

This link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email.

For security reasons, never share this link with anyone.

Best regards,
The Axiom Team
pma.axiom.support@gmail.com`.trim(),
    };
}

export interface DocumentExpiryEmailParams {
    userName: string;
    documentName: string;
    documentType?: string;
    supplierName?: string;
    expiresAt: string;
    diffDays: number;
    documentId?: string;
    documentUrl?: string;
    portalUrl?: string;
}

export function generateDocumentExpiryReminderEmail(params: DocumentExpiryEmailParams) {
    const { userName, documentName, documentType, supplierName, expiresAt, diffDays, documentId, documentUrl, portalUrl } = params;
    
    let urgencyBadgeText = "Expiring Today";
    let urgencyBadgeBg = "#dc2626"; // red
    let urgencyBadgeColor = "#ffffff";
    let daysRemainingText = "Expiring today";
    let headline = `Your document "${documentName}" reaches expiry today (${expiresAt}).`;
    
    if (diffDays < 0) {
        const daysAgo = Math.abs(diffDays);
        urgencyBadgeText = daysAgo === 1 ? "Expired (1 day ago)" : `Expired (${daysAgo} days ago)`;
        urgencyBadgeBg = "#991b1b";
        urgencyBadgeColor = "#ffffff";
        daysRemainingText = daysAgo === 1 ? "Expired 1 day ago" : `Expired ${daysAgo} days ago`;
        headline = `Your document "${documentName}" expired on ${expiresAt} (${daysRemainingText}).`;
    } else if (diffDays === 0) {
        urgencyBadgeText = "Expiring Today";
        urgencyBadgeBg = "#dc2626";
        urgencyBadgeColor = "#ffffff";
        daysRemainingText = "Expiring today";
        headline = `Your document "${documentName}" reaches expiry today (${expiresAt}).`;
    } else {
        urgencyBadgeText = diffDays === 1 ? "Expiring in 1 day" : `Expiring in ${diffDays} days`;
        urgencyBadgeBg = "#d97706"; // amber
        urgencyBadgeColor = "#ffffff";
        daysRemainingText = diffDays === 1 ? "1 day remaining" : `${diffDays} days remaining`;
        headline = `Your document "${documentName}" will expire in ${diffDays} day${diffDays > 1 ? 's' : ''} on ${expiresAt}.`;
    }

    const configuredBase = (
        process.env.APP_BASE_URL ||
        process.env.NEXTAUTH_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        'http://localhost:3001'
    ).replace(/\/+$/, '');

    let appLink = portalUrl || documentUrl;
    if (!appLink) {
        appLink = documentId
            ? `${configuredBase}/documents/${documentId}/details`
            : `${configuredBase}/documents`;
    }

    const subject = `[Action Required] Expiry Reminder: ${documentName} (${expiresAt})`;

    const body = `Hello ${userName || 'Team'},

This is an automated notification regarding a compliance document in Axiom Procurement OS:

Document Details:
----------------------------------------------------------------------
Document Name:  ${documentName}
Document Type:  ${documentType || 'General'}
Supplier:       ${supplierName || 'PRETTL Mechatronics GmbH'}
Expiry Date:    ${expiresAt}
----------------------------------------------------------------------

Days Remaining  : ${daysRemainingText} (${urgencyBadgeText})

${headline}

Action Required:
Please review this document in Axiom and arrange for an updated certificate or renewal before expiry to ensure uninterrupted procurement compliance.

View Document in Axiom:
${appLink}

----------------------------------------------------------------------
Axiom Procurement OS | PRETTL Mechatronics GmbH
Support: pma.axiom.support@gmail.com`.trim();

    const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Document Expiry Notification</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Container (600px) -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Bar -->
          <tr>
            <td style="background-color: #0f172a; padding: 28px 36px; text-align: left;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <div style="display: inline-block;">
                      <span style="font-size: 20px; font-weight: 800; letter-spacing: 1.5px; color: #ffffff; vertical-align: middle;">AXIOM</span>
                      <span style="display: inline-block; margin-left: 8px; background-color: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); font-size: 10px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; padding: 2px 8px; border-radius: 4px; vertical-align: middle;">Procurement OS</span>
                    </div>
                    <div style="font-size: 12px; color: #94a3b8; margin-top: 6px; font-weight: 400;">
                      Document Compliance & Expiry Management
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 36px 32px 36px;">
              
              <!-- Status Badge & Title -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
                <tr>
                  <td>
                    <div style="display: inline-block; background-color: ${urgencyBadgeBg}; color: ${urgencyBadgeColor}; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 5px 12px; border-radius: 9999px; margin-bottom: 12px;">
                      ${urgencyBadgeText}
                    </div>
                    <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #0f172a; line-height: 1.3;">
                      Document Expiry Notification
                    </h1>
                  </td>
                </tr>
              </table>

              <!-- Greeting -->
              <p style="margin: 0 0 16px 0; font-size: 15px; color: #334155; line-height: 1.6;">
                Hello <strong>${userName || 'Team'}</strong>,
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #475569; line-height: 1.6;">
                This is an automated notification to inform you that the compliance document <strong>&ldquo;${documentName}&rdquo;</strong> requires attention regarding its expiration date.
              </p>

              <!-- Document Details Table Card -->
              <table border="1" bordercolor="#cbd5e1" cellpadding="10" cellspacing="0" width="100%" style="border-collapse: collapse; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; margin-bottom: 0; width: 100%;">
                <thead>
                  <tr style="background-color: #f1f5f9;">
                    <th colspan="2" align="left" style="padding: 12px 18px; background-color: #f1f5f9; border: 1px solid #cbd5e1; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #334155; text-align: left;">
                      Document Details:
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="padding: 11px 18px; color: #475569; font-size: 13px; font-weight: 600; width: 35%; border: 1px solid #cbd5e1; background-color: #f8fafc;">Document Name:</td>
                    <td style="padding: 11px 18px; color: #0f172a; font-size: 13px; font-weight: 700; border: 1px solid #cbd5e1; background-color: #ffffff;">${documentName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 11px 18px; color: #475569; font-size: 13px; font-weight: 600; width: 35%; border: 1px solid #cbd5e1; background-color: #f8fafc;">Document Type:</td>
                    <td style="padding: 11px 18px; color: #0f172a; font-size: 13px; font-weight: 500; border: 1px solid #cbd5e1; background-color: #ffffff;">${documentType || 'General'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 11px 18px; color: #475569; font-size: 13px; font-weight: 600; width: 35%; border: 1px solid #cbd5e1; background-color: #f8fafc;">Supplier:</td>
                    <td style="padding: 11px 18px; color: #0f172a; font-size: 13px; font-weight: 500; border: 1px solid #cbd5e1; background-color: #ffffff;">${supplierName || 'PRETTL Mechatronics GmbH'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 11px 18px; color: #475569; font-size: 13px; font-weight: 600; width: 35%; border: 1px solid #cbd5e1; background-color: #f8fafc;">Expiry Date:</td>
                    <td style="padding: 11px 18px; color: #0f172a; font-size: 13px; font-weight: 600; border: 1px solid #cbd5e1; background-color: #ffffff;">${expiresAt}</td>
                  </tr>
                </tbody>
              </table>

              <!-- One line gap after details -->
              <div style="height: 18px; font-size: 18px; line-height: 18px;">&nbsp;</div>

              <!-- Days Remaining Section -->
              <table border="1" bordercolor="${diffDays <= 0 ? '#fecaca' : '#fde68a'}" cellpadding="12" cellspacing="0" width="100%" style="border-collapse: collapse; background-color: ${diffDays <= 0 ? '#fef2f2' : '#fffbeb'}; border: 1px solid ${diffDays <= 0 ? '#fecaca' : '#fde68a'}; border-left: 5px solid ${diffDays <= 0 ? '#ef4444' : '#f59e0b'}; border-radius: 6px;">
                <tr>
                  <td style="padding: 14px 18px; border: none;">
                    <span style="font-size: 13px; font-weight: 700; color: #475569;">Days Remaining:</span>
                    <span style="font-size: 15px; font-weight: 800; color: ${diffDays <= 0 ? '#dc2626' : '#d97706'}; margin-left: 8px;">${daysRemainingText}</span>
                  </td>
                </tr>
              </table>

              <!-- One more line gap -->
              <div style="height: 18px; font-size: 18px; line-height: 18px;">&nbsp;</div>

              <!-- Action Required Box -->
              <table border="1" bordercolor="#bfdbfe" cellpadding="16" cellspacing="0" width="100%" style="border-collapse: collapse; background-color: #eff6ff; border: 1px solid #bfdbfe; border-left: 5px solid #2563eb; border-radius: 6px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 16px 20px; border: none;">
                    <div style="font-size: 13px; font-weight: 700; color: #1e40af; margin-bottom: 6px;">
                      Action Required:
                    </div>
                    <div style="font-size: 13px; color: #1e3a8a; line-height: 1.6;">
                      Please review this document in Axiom and arrange for an updated certificate or renewal before expiry to ensure uninterrupted procurement compliance.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 8px;">
                <tr>
                  <td align="center">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="border-radius: 8px; background-color: #0f172a;">
                          <a href="${appLink}" target="_blank" style="font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; display: inline-block; letter-spacing: 0.2px;">
                            View Document in Axiom &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 36px; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; color: #475569;">
                Axiom Procurement OS &bull; PRETTL Mechatronics GmbH
              </p>
              <p style="margin: 0 0 8px 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                This is an automated compliance notification sent to registered users.
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                Support: <a href="mailto:pma.axiom.support@gmail.com" style="color: #64748b; text-decoration: underline;">pma.axiom.support@gmail.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    return {
        subject,
        body,
        html,
    };
}

