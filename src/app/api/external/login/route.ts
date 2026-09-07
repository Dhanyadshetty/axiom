import { NextRequest, NextResponse } from 'next/server';
import { validateMagicToken } from '@/lib/services/magic-tokens';
import { db } from '@/db';
import { magicTokens, assessmentRequestSuppliers, assessmentRequests, contacts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { createHash, randomBytes } from 'crypto';

function getRedirectBaseUrl(): string {
    // Use environment variable for the browser-reachable URL, NOT request.url
    // In Docker, request.url may have 0.0.0.0 as host which is not browser-reachable
    return process.env.APP_BASE_URL || process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('magictoken');
    const redirect = searchParams.get('redirect') || '/external/assessment';

    if (!token) {
        return NextResponse.json(
            { error: 'Magic token is required' },
            { status: 400 }
        );
    }

    // Rate limiting check (simple in-memory for now, could use Redis)
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    // TODO: Implement proper rate limiting with Redis

    // LOG: Incoming magic token validation attempt
    console.log(`Magic token validation attempt - token: ${token.substring(0, 16)}..., redirect: ${redirect}, ip: ${clientIp}, userAgent: ${userAgent}, timestamp: ${new Date().toISOString()}`);

    // Validate the magic token. We intentionally use the non-consuming
    // validation so the link remains usable across multiple visits, browser
    // back/forward navigation, refreshes, and "Share" forwards. Rotating
    // (consuming) the token here would lock the supplier out after the first
    // open, producing the 401 "link already used" errors.
    const validation = await validateMagicToken(token);

    if (!validation.valid) {
        // Check if it's an expired but recently used token - could offer to resend
        const tokenHash = createHash('sha256').update(token).digest('hex');
        const [expiredToken] = await db.select().from(magicTokens)
            .where(eq(magicTokens.tokenHash, tokenHash))
            .limit(1);

        let errorMessage = validation.error || 'Invalid or expired token';
        let failureReason = 'unknown';
        let canResend = false;

        if (expiredToken && expiredToken.usedAt) {
            errorMessage = 'This link has already been used. A new link has been sent to your email.';
            failureReason = 'already_used';
            canResend = true;
        } else if (expiredToken && expiredToken.revokedAt) {
            errorMessage = 'This link has been revoked. Please request a new one.';
            failureReason = 'revoked';
            canResend = true;
        } else if (expiredToken && expiredToken.expiresAt < new Date()) {
            errorMessage = 'This link has expired. A new link has been sent to your email.';
            failureReason = 'expired';
            canResend = true;
        } else if (!expiredToken) {
            failureReason = 'not_found';
        } else {
            failureReason = validation.error || 'invalid';
        }

        // LOG: Detailed failure reason
        console.log(`Magic token validation FAILED - token: ${token.substring(0, 16)}..., reason: ${failureReason}, error: ${errorMessage}, ip: ${clientIp}, userAgent: ${userAgent}, timestamp: ${new Date().toISOString()}`);
        
        // Render error page
        const baseUrl = getRedirectBaseUrl();
        return new NextResponse(
            `<!DOCTYPE html>
<html>
<head>
    <title>Invalid Link - Axiom</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 60px auto; padding: 20px; text-align: center; color: #1f2937; }
        .icon { font-size: 48px; margin-bottom: 16px; }
        h1 { color: #dc2626; margin-bottom: 16px; }
        p { color: #6b7280; margin-bottom: 24px; }
        .btn { display: inline-block; background: #059669; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; }
        .btn:hover { background: #047857; }
    </style>
</head>
<body>
    <div class="icon">🔒</div>
    <h1>Access Denied</h1>
    <p>${errorMessage}</p>
    ${canResend ? `<a href="mailto:pma.axiom.support@gmail.com?subject=Request%20new%20assessment%20link&body=Please%20send%20me%20a%20new%20link%20for%20request%20${encodeURIComponent(expiredToken?.assessmentRequestId || '')}" class="btn">Request New Link</a>` : ''}
    <p style="margin-top: 24px; font-size: 14px;">If you believe this is an error, contact <a href="mailto:pma.axiom.support@gmail.com">support</a>.</p>
</body>
</html>`,
            { status: 401, headers: { 'Content-Type': 'text/html' } }
        );
    }

    const { participant, assessmentRequest, tokenRecord } = validation;

    // LOG: Successful token validation
    console.log(`Magic token validated successfully - token: ${tokenRecord.token.substring(0, 16)}..., tokenId: ${tokenRecord.id}, participantId: ${participant.id}, ip: ${clientIp}, timestamp: ${new Date().toISOString()}`);

    // Create a session for the user (set cookie)
    // For now, we'll redirect with a session token in the URL
    // In production, you'd want to set a secure HttpOnly cookie
    
    // Get the redirect URL - ensure it's safe and starts with /external/assessments/
    let redirectUrl = redirect;
    if (!redirectUrl.startsWith('/external/assessments/')) {
        // Fallback to the correct assessment route using participant ID
        redirectUrl = `/external/assessments/${assessmentRequest.id}/requests/${participant.id}`;
    }

    // Validate the redirect URL is a proper assessment path.
    // It can be the landing page, the form, or the share (forward) page:
    //   /external/assessments/[assessmentId]/requests/[participantId]
    //   /external/assessments/[assessmentId]/requests/[participantId]/form
    //   /external/assessments/[assessmentId]/requests/[participantId]/share
    const assessmentPathRegex = /^\/external\/assessments\/[^/]+\/requests\/[^/]+(\/(form|share))?$/;
    if (!assessmentPathRegex.test(redirectUrl)) {
        redirectUrl = `/external/assessments/${assessmentRequest.id}/requests/${participant.id}`;
    }

    // Set a session cookie (short-lived, for the assessment session)
    const sessionToken = randomBytes(32).toString('hex');
    const sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store session in database (optional, for validation)
    // For now, we'll use a simple approach with the magic token validation

    // FIX: Use proper base URL from env, NOT request.url (which may be 0.0.0.0 in Docker)
    const baseUrl = getRedirectBaseUrl();
    const response = NextResponse.redirect(new URL(redirectUrl, baseUrl));
    
    // Set session cookie
    response.cookies.set('external_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/',
    });

    // Update participant status to 'in_progress' if it was 'sent'
    if (participant.status === 'sent' || participant.status === 'pending') {
        await db.update(assessmentRequestSuppliers)
            .set({ status: 'in_progress' })
            .where(eq(assessmentRequestSuppliers.id, participant.id));
    }

    return response;
}