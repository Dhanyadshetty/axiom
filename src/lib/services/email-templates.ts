import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';

const TEMPLATES_DIR = path.join(process.cwd(), 'src', 'lib', 'email-templates');
const LOCALES_DIR = path.join(TEMPLATES_DIR, 'locales');

const SUPPORTED_LOCALES = ['en', 'de', 'fr', 'it', 'pl', 'sk', 'zh', 'es'];
const DEFAULT_LOCALE = 'en';

interface EmailTemplateData {
    requestId: string;
    requestTitle: string;
    buyerCompanyName: string;
    supplierCompanyName: string;
    submissionDeadline: string;
    responsibleName: string;
    responsibleEmail: string;
    magicLinkUrl: string;
    forwardLinkUrl?: string;
    supportEmail: string;
    langCode: string;
    year: number;
    expiryDate: string;
    forwarderName?: string;
    submittedAt?: string;
}

interface RenderedTemplate {
    subject: string;
    html: string;
    text: string;
}

// Cache for compiled templates
const templateCache = new Map<string, HandlebarsTemplateDelegate>();

/**
 * Load and compile a Handlebars template
 */
function getTemplate(locale: string, templateName: string): HandlebarsTemplateDelegate {
    const cacheKey = `${locale}:${templateName}`;
    
    if (templateCache.has(cacheKey)) {
        return templateCache.get(cacheKey)!;
    }

    const localeFile = path.join(LOCALES_DIR, `${locale}.json`);
    let localeData: Record<string, unknown>;
    
    try {
        const fileContent = fs.readFileSync(localeFile, 'utf-8');
        localeData = JSON.parse(fileContent);
    } catch {
        // Fallback to English
        const fallbackFile = path.join(LOCALES_DIR, `${DEFAULT_LOCALE}.json`);
        const fileContent = fs.readFileSync(fallbackFile, 'utf-8');
        localeData = JSON.parse(fileContent);
    }

    const templateSource = localeData[templateName] as Record<string, string>;
    if (!templateSource) {
        throw new Error(`Template ${templateName} not found in locale ${locale}`);
    }

    // Compile the HTML template
    const htmlTemplate = Handlebars.compile(templateSource.html || templateSource.body || '');
    
    // For text version, we'll convert HTML to text
    const textTemplate = Handlebars.compile(templateSource.text || templateSource.body || '');

    const compiled = {
        subject: Handlebars.compile(templateSource.subject),
        html: htmlTemplate,
        text: textTemplate,
        preheader: Handlebars.compile(templateSource.preheader || ''),
    };

    templateCache.set(cacheKey, compiled as unknown as HandlebarsTemplateDelegate);
    return compiled as unknown as HandlebarsTemplateDelegate;
}

/**
 * Register Handlebars helpers
 */
Handlebars.registerHelper('formatDate', function (dateStr: string) {
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
        return dateStr;
    }
});

Handlebars.registerHelper('eq', function (a: unknown, b: unknown) {
    return a === b;
});

Handlebars.registerHelper('ne', function (a: unknown, b: unknown) {
    return a !== b;
});

/**
 * Escape a value for safe insertion into HTML email bodies.
 */
function esc(value: unknown): string {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Bulletproof black CTA button (table-based) for maximum email-client
 * compatibility (Outlook renders <a> with padding/styles reliably here).
 */
function blackButton(label: string, url: string): string {
    const href = esc(url);
    return `
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0;">
                            <tr>
                                <td align="center" bgcolor="#000000" style="border-radius: 6px; background-color: #000000;">
                                    <a href="${href}" target="_blank" rel="noopener noreferrer"
                                       style="display: inline-block; padding: 13px 30px; font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold; line-height: 1; color: #ffffff; text-decoration: none; border-radius: 6px; white-space: nowrap;">
                                        ${esc(label)}
                                    </a>
                                </td>
                            </tr>
                        </table>`;
}

/**
 * Render the supplier-invitation email as a structured, styled HTML document
 * with two distinct black CTA buttons (Fill out request / Forward request).
 */
function renderInvitationHtml(data: EmailTemplateData): string {
    const baseUrl = (data.magicLinkUrl.match(/^https?:\/\/[^/]+/) || [''])[0];
    const fillUrl = data.magicLinkUrl;
    const forwardUrl = data.forwardLinkUrl || data.magicLinkUrl;
    const deadline = data.submissionDeadline && data.submissionDeadline !== 'Not specified'
        ? esc(data.submissionDeadline)
        : '';

    return `<!DOCTYPE html>
<html lang="${esc(data.langCode || 'en')}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(data.requestTitle)}</title>
</head>
<body style="margin:0; padding:0; background-color:#f3f4f6; font-family:Arial, Helvetica, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3f4f6; padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%; background-color:#ffffff; border-radius:12px; overflow:hidden;">
          <tr>
            <td style="padding:28px 28px; background-color:#0f172a;">
              <p style="margin:0; color:#ffffff; font-size:20px; font-weight:bold; line-height:1.3;">${esc(data.requestId)}: ${esc(data.requestTitle)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 28px 8px;">
              <p style="margin:0 0 16px; color:#374151; font-size:14px;"><strong>Submission deadline:</strong> ${deadline || '&mdash;'}</p>
              <p style="margin:0 0 16px; color:#111827; font-size:15px;">Dear Sir or Madam of ${esc(data.supplierCompanyName)},</p>
              <p style="margin:0 0 20px; color:#374151; font-size:15px; line-height:1.6;">we kindly ask you to process a request. You can fill out and submit the request online.</p>

              <p style="margin:0 0 6px; color:#111827; font-size:14px;"><strong>Contact:</strong></p>
              <p style="margin:0 0 4px; color:#374151; font-size:14px;">Name: ${esc(data.responsibleName)}</p>
              <p style="margin:0 0 24px; color:#374151; font-size:14px;">Email: ${esc(data.responsibleEmail)}</p>

              ${blackButton('Fill out request', fillUrl)}

              <h2 style="margin:28px 0 8px; color:#111827; font-size:17px;">Not the right contact person?</h2>
              <p style="margin:0 0 16px; color:#374151; font-size:14px; line-height:1.6;">You can simply forward the request to another person in your company by clicking the button below.</p>

              ${blackButton('Forward request', forwardUrl)}

              <p style="margin:20px 0 0; color:#111827; font-size:13px; line-height:1.6;"><strong>This email contains a personalized request link and cannot be forwarded directly. To share this request with your colleagues, please use the 'Forward request' button. This will generate a personalized link for each recipient, granting them access and allowing collaborative responses to the request.</strong></p>

              <p style="margin:16px 0 0; color:#374151; font-size:13px; line-height:1.6;">For security reasons, we will automatically send you a new access link when you reopen the request. All information already entered will remain saved.</p>

              <p style="margin:16px 0 0; color:#374151; font-size:13px; line-height:1.6;">If you have any questions regarding the content of the request, please contact me (${esc(data.responsibleEmail)}). For technical problems or feedback on processing, please contact ${esc(data.supportEmail)}.</p>

              <p style="margin:16px 0 0; color:#374151; font-size:13px; line-height:1.6;">If you choose not to participate, please click 'Fill out request' above and then reject your participation.</p>

              <p style="margin:20px 0 0; color:#111827; font-size:15px;">With kind regards,<br>${esc(data.responsibleName)}</p>

              <p style="margin:20px 0 0; color:#374151; font-size:13px; line-height:1.6;">If it is not possible to open the page by clicking on the button, please copy the link and paste it into the address bar of the browser:</p>
              <p style="margin:6px 0 0; word-break:break-all; color:#047857; font-size:13px;"><a href="${esc(fillUrl)}" style="color:#047857; text-decoration:none;">${esc(fillUrl)}</a></p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px; background-color:#f9fafb; border-top:1px solid #e5e7eb;">
              <p style="margin:0 0 6px; color:#9ca3af; font-size:12px; line-height:1.5;">${esc(data.buyerCompanyName)} uses Axiom for request management, more information about Axiom can be found at <a href="${esc(baseUrl)}" style="color:#059669; text-decoration:none;">${esc(baseUrl)}</a>.</p>
              <p style="margin:0; color:#9ca3af; font-size:12px;">&copy; ${esc(String(data.year))} ${esc(data.buyerCompanyName)}. <a href="${esc(baseUrl + '/privacy')}" style="color:#059669; text-decoration:none;">Datenschutz</a> &middot; <a href="${esc(baseUrl + '/impressum')}" style="color:#059669; text-decoration:none;">Impressum</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Plain-text fallback for the supplier-invitation email (used by clients that
 * strip HTML and as the multipart text part).
 */
function renderInvitationText(data: EmailTemplateData): string {
    const fillUrl = data.magicLinkUrl;
    const forwardUrl = data.forwardLinkUrl || data.magicLinkUrl;
    const deadline = data.submissionDeadline && data.submissionDeadline !== 'Not specified'
        ? data.submissionDeadline
        : '';
    return [
        `${data.requestId}: ${data.requestTitle}`,
        '',
        `Submission deadline: ${deadline || '-'}`,
        '',
        `Dear Sir or Madam of ${data.supplierCompanyName},`,
        '',
        'we kindly ask you to process a request. You can fill out and submit the request online.',
        '',
        'Contact:',
        `Name: ${data.responsibleName}`,
        `Email: ${data.responsibleEmail}`,
        '',
        `Fill out request: ${fillUrl}`,
        '',
        'Not the right contact person?',
        'You can simply forward the request to another person in your company by clicking the button below.',
        `Forward request: ${forwardUrl}`,
        '',
        "This email contains a personalized request link and cannot be forwarded directly. To share this request with your colleagues, please use the 'Forward request' button. This will generate a personalized link for each recipient, granting them access and allowing collaborative responses to the request.",
        '',
        'For security reasons, we will automatically send you a new access link when you reopen the request. All information already entered will remain saved.',
        '',
        `If you have any questions regarding the content of the request, please contact me (${data.responsibleEmail}). For technical problems or feedback on processing, please contact ${data.supportEmail}.`,
        '',
        "If you choose not to participate, please click 'Fill out request' above and then reject your participation.",
        '',
        'With kind regards,',
        data.responsibleName,
        '',
        'If it is not possible to open the page by clicking on the button, please copy the link and paste it into the address bar of the browser:',
        fillUrl,
        '',
        `${data.buyerCompanyName} uses Axiom for request management, more information about Axiom can be found at ${baseUrlFromUrl(fillUrl)}.`,
        `© ${data.year} ${data.buyerCompanyName}`,
    ].join('\n');
}

function baseUrlFromUrl(url: string): string {
    return (url.match(/^https?:\/\/[^/]+/) || [url])[0];
}

/**
 * Render an email template with the provided data
 */
export function renderEmailTemplate(
    templateType: 'invitation' | 'forward' | 'reminder' | 'reIssue' | 'confirmation',
    data: EmailTemplateData
): RenderedTemplate {
    const locale = SUPPORTED_LOCALES.includes(data.langCode) ? data.langCode : DEFAULT_LOCALE;

    // The supplier-invitation template has a bespoke, fully-structured layout
    // (heading, deadline, contact block, two black CTA buttons, legal footer)
    // handled by dedicated renderers rather than the generic locale strings.
    if (templateType === 'invitation') {
        return {
            subject: `Invitation to complete assessment: ${data.requestTitle}`,
            html: renderInvitationHtml(data),
            text: renderInvitationText(data),
        };
    }

    // Map templateType to locale file key
    const templateKeyMap: Record<string, string> = {
        invitation: 'invitation',
        forward: 'forward',
        reminder: 'reminder',
        reIssue: 'reIssue',
        confirmation: 'confirmation',
    };
    
    const templateKey = templateKeyMap[templateType];
    
    try {
        // Load locale data
        const localeFile = path.join(LOCALES_DIR, `${locale}.json`);
        const fileContent = fs.readFileSync(localeFile, 'utf-8');
        const localeData = JSON.parse(fileContent);
        
        const templateStrings = localeData[templateKey];
        const commonStrings = localeData.common;

        if (!templateStrings) {
            throw new Error(`Template ${templateKey} not found`);
        }

        // Prepare template data with common strings
        const templateData = {
            ...data,
            ...commonStrings,
            supportEmail: data.supportEmail || 'pma.axiom.support@gmail.com',
            year: data.year || new Date().getFullYear(),
        };

        // Render subject
        const subjectTemplate = Handlebars.compile(templateStrings.subject);
        const subject = subjectTemplate(templateData);

        // Build HTML email using a base layout
        const html = buildHtmlEmail(templateStrings, templateData, localeData.common);
        
        // Build text version
        const text = buildTextEmail(templateStrings, templateData, localeData.common);

        return { subject, html, text };
    } catch (error) {
        console.error(`Failed to render email template ${templateType} for locale ${locale}:`, error);
        // Fallback to simple template
        return renderFallbackTemplate(templateType, data);
    }
}

/**
 * Build HTML email from template strings
 */
function buildHtmlEmail(
    templateStrings: Record<string, string>,
    data: EmailTemplateData & Record<string, string>,
    common: Record<string, string>
): string {
    const preheader = templateStrings.preheader 
        ? Handlebars.compile(templateStrings.preheader)(data)
        : '';

    // Simple inline CSS email template
    return `
<!DOCTYPE html>
<html lang="${data.langCode || 'en'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${Handlebars.compile(templateStrings.subject)(data)}</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f3f4f6; }
        .email-wrapper { padding: 40px 20px; }
        .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 32px 24px; text-align: center; }
        .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; }
        .content { padding: 32px 24px; }
        .greeting { font-size: 16px; margin-bottom: 16px; }
        .intro { font-size: 15px; color: #374151; margin-bottom: 24px; }
        .details-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
        .details-box h3 { margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #065f46; text-transform: uppercase; letter-spacing: 0.05em; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #d1fae5; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { color: #047857; font-weight: 500; }
        .detail-value { color: #065f46; font-weight: 600; }
        .cta-button { display: inline-block; background: #059669; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 24px 0; }
        .cta-button:hover { background: #047857; }
        .note { font-size: 13px; color: #6b7280; background: #f9fafb; padding: 16px; border-radius: 8px; margin-top: 24px; }
        .forward-note { font-size: 13px; color: #6b7280; margin-top: 16px; }
        .support { font-size: 13px; color: #6b7280; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; }
        .closing { margin-top: 24px; font-size: 15px; color: #374151; }
        .sender { font-weight: 600; color: #1f2937; }
        .footer { background: #f9fafb; padding: 20px 24px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer p { margin: 4px 0; font-size: 12px; color: #9ca3af; }
        .footer a { color: #059669; text-decoration: none; }
        @media only screen and (max-width: 480px) {
            .email-wrapper { padding: 20px 10px; }
            .content { padding: 24px 16px; }
            .header { padding: 24px 16px; }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-container">
            <div class="header">
                <h1>${Handlebars.compile(templateStrings.subject)(data)}</h1>
            </div>
            <div class="content">
                <div class="greeting">${Handlebars.compile(templateStrings.greeting)(data)}</div>
                <div class="intro">${Handlebars.compile(templateStrings.intro)(data)}</div>
                
                <div class="details-box">
                    <h3>${Handlebars.compile(templateStrings.details)(data)}</h3>
                    <div class="detail-row">
                        <span class="detail-label">${Handlebars.compile(templateStrings.deadlineLabel)(data)}</span>
                        <span class="detail-value">${Handlebars.compile(templateStrings.deadlineValue)(data)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">${Handlebars.compile(templateStrings.supplierLabel)(data)}</span>
                        <span class="detail-value">${Handlebars.compile(templateStrings.supplierValue)(data)}</span>
                    </div>
                </div>

                <div style="text-align: center;">
                    <a href="${data.magicLinkUrl}" class="cta-button">${Handlebars.compile(templateStrings.ctaText)(data)}</a>
                </div>

                <div class="note">${Handlebars.compile(templateStrings.ctaNote)(data)}</div>

                ${templateStrings.forwardNote ? `
                <div class="forward-note">${Handlebars.compile(templateStrings.forwardNote)(data)}</div>
                ` : ''}

                <div class="support">${Handlebars.compile(templateStrings.supportText)(data)}</div>

                <div class="closing">
                    <p>${Handlebars.compile(templateStrings.closing)(data)}</p>
                    <p class="sender">${Handlebars.compile(templateStrings.senderName)(data)}</p>
                </div>
            </div>
            <div class="footer">
                <p>${common.platformName || 'Axiom Procurement Platform'} &copy; ${common.year || new Date().getFullYear()}</p>
                <p>${Handlebars.compile(common.unsubscribe)(data)}</p>
            </div>
        </div>
    </div>
</body>
</html>
    `.trim();
}

/**
 * Build plain text email version
 */
function buildTextEmail(
    templateStrings: Record<string, string>,
    data: EmailTemplateData & Record<string, string>,
    common: Record<string, string>
): string {
    const lines = [
        Handlebars.compile(templateStrings.subject)(data),
        '',
        Handlebars.compile(templateStrings.greeting)(data),
        '',
        Handlebars.compile(templateStrings.intro)(data).replace(/<[^>]+>/g, ''),
        '',
        Handlebars.compile(templateStrings.details)(data),
        `  ${Handlebars.compile(templateStrings.deadlineLabel)(data)}: ${Handlebars.compile(templateStrings.deadlineValue)(data)}`,
        `  ${Handlebars.compile(templateStrings.supplierLabel)(data)}: ${Handlebars.compile(templateStrings.supplierValue)(data)}`,
        '',
        Handlebars.compile(templateStrings.ctaText)(data),
        data.magicLinkUrl,
        '',
        Handlebars.compile(templateStrings.ctaNote)(data).replace(/<[^>]+>/g, ''),
    ];

    if (templateStrings.forwardNote) {
        lines.push('', Handlebars.compile(templateStrings.forwardNote)(data).replace(/<[^>]+>/g, ''));
    }

    lines.push(
        '',
        Handlebars.compile(templateStrings.supportText)(data).replace(/<[^>]+>/g, ''),
        '',
        Handlebars.compile(templateStrings.closing)(data),
        Handlebars.compile(templateStrings.senderName)(data),
        '',
        '---',
        `${common.platformName || 'Axiom Procurement Platform'} © ${common.year || new Date().getFullYear()}`,
        Handlebars.compile(common.unsubscribe)(data)
    );

    return lines.join('\n');
}

/**
 * Fallback template rendering when locale/template not found
 */
function renderFallbackTemplate(
    templateType: string,
    data: EmailTemplateData
): RenderedTemplate {
    const templates: Record<string, { subject: string; body: string }> = {
        invitation: {
            subject: `Invitation to complete assessment: ${data.requestTitle}`,
            body: `Dear ${data.responsibleName},\n\nYou have been invited by ${data.buyerCompanyName} to complete a supplier self-assessment titled "${data.requestTitle}".\n\nDeadline: ${data.submissionDeadline}\nYour Company: ${data.supplierCompanyName}\n\nAccess the assessment: ${data.magicLinkUrl}\n\nThis link expires on ${data.expiryDate}.\n\nBest regards,\nThe ${data.buyerCompanyName} Procurement Team`
        },
        forward: {
            subject: `Shared with you: Assessment "${data.requestTitle}"`,
            body: `Dear ${data.responsibleName},\n\n${data.forwarderName} from ${data.buyerCompanyName} has shared an assessment request with you.\n\nAccess: ${data.magicLinkUrl}\n\nBest regards,\nThe ${data.buyerCompanyName} Procurement Team`
        },
        reminder: {
            subject: `Reminder: Assessment "${data.requestTitle}" due soon`,
            body: `Dear ${data.responsibleName},\n\nReminder: Assessment "${data.requestTitle}" is due on ${data.submissionDeadline}.\n\nAccess: ${data.magicLinkUrl}\n\nBest regards,\nThe ${data.buyerCompanyName} Procurement Team`
        },
        reIssue: {
            subject: `New access link for assessment: ${data.requestTitle}`,
            body: `Dear ${data.responsibleName},\n\nFor security, a new access link has been generated for "${data.requestTitle}".\n\nAccess: ${data.magicLinkUrl}\n\nBest regards,\nThe ${data.buyerCompanyName} Procurement Team`
        },
        confirmation: {
            subject: `Assessment submitted: ${data.requestTitle}`,
            body: `Dear ${data.responsibleName},\n\nThank you for submitting your response to "${data.requestTitle}".\n\nSubmitted: ${data.submittedAt}\n\nBest regards,\nThe ${data.buyerCompanyName} Procurement Team`
        },
    };

    const tpl = templates[templateType] || templates.invitation;
    return {
        subject: tpl.subject,
        html: `<pre style="font-family: inherit; white-space: pre-wrap;">${tpl.body}</pre>`,
        text: tpl.body,
    };
}

/**
 * Clear template cache (useful for development/hot reload)
 */
export function clearTemplateCache(): void {
    templateCache.clear();
}