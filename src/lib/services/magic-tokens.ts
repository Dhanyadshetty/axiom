import { createHash, randomBytes } from 'crypto';
import { db } from '@/db';
import { magicTokens, assessmentRequestSuppliers, contacts, assessmentRequests, users, suppliers } from '@/db/schema';
import { eq, and, lt, gt, isNull } from 'drizzle-orm';

const TOKEN_BYTES = 32;
const DEFAULT_EXPIRY_DAYS = 60;

function getBaseUrl(): string {
    const configuredUrl = process.env.APP_BASE_URL || process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    try {
        const url = new URL(configuredUrl);
        if (url.hostname === '0.0.0.0' || url.hostname === '::') {
            url.hostname = 'localhost';
        }
        return url.toString().replace(/\/$/, '');
    } catch {
        return 'http://localhost:3000';
    }
}

export interface MagicTokenData {
    token: string;
    tokenHash: string;
    id: string;
    expiresAt: Date;
}

export interface ValidationResult {
    valid: boolean;
    tokenRecord?: typeof magicTokens.$inferSelect;
    participant?: typeof assessmentRequestSuppliers.$inferSelect;
    contact?: typeof contacts.$inferSelect;
    assessmentRequest?: typeof assessmentRequests.$inferSelect;
    error?: string;
}

/**
 * Generate a cryptographically secure random token and its hash
 */
export function generateMagicToken(): MagicTokenData {
    const token = randomBytes(TOKEN_BYTES).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + DEFAULT_EXPIRY_DAYS);

    return {
        token,
        tokenHash,
        id: '', // will be set by DB
        expiresAt,
    };
}

export async function createMagicToken(
    assessmentRequestId: string,
    participantId: string,
    contactId: string,
    email: string,
    purpose: 'invitation' | 'forward' | 'reminder' | 're_issue' = 'invitation'
): Promise<{ token: string; tokenId: string; expiresAt: Date } | null> {
    try {
        const tokenData = generateMagicToken();

        const [created] = await db.insert(magicTokens).values({
            token: tokenData.token, // Store plain token for lookup (indexed)
            tokenHash: tokenData.tokenHash,
            assessmentRequestId,
            participantId,
            contactId,
            email,
            purpose,
            expiresAt: tokenData.expiresAt,
        }).returning({ id: magicTokens.id });

        if (!created) return null;

        // Build magic link URL — embed the token directly on the target form
        // page so the link is self-bootstrapping (no /external/login hop,
        // no cookie dependency). The form page validates the token,
        // sets external_session and strips the token from the URL.
        const baseUrl = getBaseUrl();
        const magicLinkUrl = `${baseUrl}/external/assessments/${assessmentRequestId}/requests/${participantId}/form?magictoken=${encodeURIComponent(tokenData.token)}`;

        return {
            token: tokenData.token,
            tokenId: created.id,
            expiresAt: tokenData.expiresAt,
        };
    } catch (error) {
        console.error('Failed to create magic token:', error);
        return null;
    }
}

/**
 * Validate a magic token and return associated records
 * Does NOT rotate the token - use consumeMagicToken for login flow
 */
export async function validateMagicToken(token: string): Promise<ValidationResult> {
    try {
        const tokenHash = createHash('sha256').update(token).digest('hex');

        // Find token by hash (secure lookup).
        // NOTE: we intentionally do NOT reject already-used tokens here. The
        // external assessment link is meant to stay open for the recipient across
        // multiple visits, refreshes, browser back/forward, "Share" forwards and
        // re-use. We only reject revoked or expired tokens.
        const [tokenRecord] = await db
            .select()
            .from(magicTokens)
            .where(and(
                eq(magicTokens.tokenHash, tokenHash),
                isNull(magicTokens.revokedAt),
                gt(magicTokens.expiresAt, new Date())
            ))
            .limit(1);

        if (!tokenRecord) {
            return { valid: false, error: 'Invalid or expired token' };
        }

        // Fetch related records
        const [participant, contact, assessmentRequest] = await Promise.all([
            db.select().from(assessmentRequestSuppliers).where(eq(assessmentRequestSuppliers.id, tokenRecord.participantId)).limit(1),
            db.select().from(contacts).where(eq(contacts.id, tokenRecord.contactId)).limit(1),
            db.select().from(assessmentRequests).where(eq(assessmentRequests.id, tokenRecord.assessmentRequestId)).limit(1),
        ]);

        if (!participant[0] || !contact[0] || !assessmentRequest[0]) {
            return { valid: false, error: 'Associated records not found' };
        }

        // Check if participant status allows access
        if (participant[0].status === 'rejected') {
            return { valid: false, error: 'Participation rejected' };
        }

        return {
            valid: true,
            tokenRecord,
            participant: participant[0],
            contact: contact[0],
            assessmentRequest: assessmentRequest[0],
        };
    } catch (error) {
        console.error('Failed to validate magic token:', error);
        return { valid: false, error: 'Validation failed' };
    }
}

/**
 * Validate and consume (rotate) a magic token for the login flow
 * Marks the token as used and creates a new one for future access
 */
export async function consumeMagicToken(token: string): Promise<ValidationResult> {
    try {
        const tokenHash = createHash('sha256').update(token).digest('hex');

        // Find token by hash (secure lookup)
        const [tokenRecord] = await db
            .select()
            .from(magicTokens)
            .where(and(
                eq(magicTokens.tokenHash, tokenHash),
                isNull(magicTokens.revokedAt),
                isNull(magicTokens.usedAt),
                gt(magicTokens.expiresAt, new Date())
            ))
            .limit(1);

        if (!tokenRecord) {
            // Check if token exists but is used/revoked/expired for better error reporting
            const [existingToken] = await db
                .select()
                .from(magicTokens)
                .where(eq(magicTokens.tokenHash, tokenHash))
                .limit(1);
            
            let error = 'Invalid or expired token';
            if (existingToken) {
                if (existingToken.usedAt) error = 'Token already used';
                else if (existingToken.revokedAt) error = 'Token revoked';
                else if (existingToken.expiresAt < new Date()) error = 'Token expired';
            }
            console.log(`consumeMagicToken: token not valid - token: ${token.substring(0, 16)}..., reason: ${error}`);
            return { valid: false, error };
        }

        // Fetch related records
        const [participant, contact, assessmentRequest] = await Promise.all([
            db.select().from(assessmentRequestSuppliers).where(eq(assessmentRequestSuppliers.id, tokenRecord.participantId)).limit(1),
            db.select().from(contacts).where(eq(contacts.id, tokenRecord.contactId)).limit(1),
            db.select().from(assessmentRequests).where(eq(assessmentRequests.id, tokenRecord.assessmentRequestId)).limit(1),
        ]);

        if (!participant[0] || !contact[0] || !assessmentRequest[0]) {
            console.log(`consumeMagicToken: associated records not found - token: ${token.substring(0, 16)}...`);
            return { valid: false, error: 'Associated records not found' };
        }

        // Check if participant status allows access
        if (participant[0].status === 'rejected') {
            console.log(`consumeMagicToken: participant rejected - token: ${token.substring(0, 16)}...`);
            return { valid: false, error: 'Participation rejected' };
        }

        // Token is valid - now rotate it (mark used, create new for future access)
        console.log(`consumeMagicToken: token valid, rotating - token: ${token.substring(0, 16)}..., tokenId: ${tokenRecord.id}`);
        await rotateToken(tokenRecord.id, tokenRecord.assessmentRequestId, tokenRecord.participantId, tokenRecord.contactId, tokenRecord.email, tokenRecord.purpose);

        return {
            valid: true,
            tokenRecord,
            participant: participant[0],
            contact: contact[0],
            assessmentRequest: assessmentRequest[0],
        };
    } catch (error) {
        console.error('Failed to consume magic token:', error);
        return { valid: false, error: 'Validation failed' };
    }
}

/**
 * Rotate a token: mark old as used, create new one for future access
 */
async function rotateToken(
    oldTokenId: string,
    assessmentRequestId: string,
    participantId: string,
    contactId: string,
    email: string,
    purpose: 'invitation' | 'forward' | 'reminder' | 're_issue'
): Promise<void> {
    try {
        const newTokenData = generateMagicToken();

        await db.transaction(async (tx) => {
            // Mark old token as used
            await tx.update(magicTokens)
                .set({ usedAt: new Date() })
                .where(eq(magicTokens.id, oldTokenId));

            // Create new token for future access
            await tx.insert(magicTokens).values({
                token: newTokenData.token,
                tokenHash: newTokenData.tokenHash,
                assessmentRequestId,
                participantId,
                contactId,
                email,
                purpose: 're_issue',
                expiresAt: newTokenData.expiresAt,
                replacedByTokenId: oldTokenId,
            });
        });

        // Queue the re-issue email (async, don't block)
        // This will be handled by the email queue
    } catch (error) {
        console.error('Failed to rotate token:', error);
    }
}

/**
 * Revoke all tokens for a participant
 */
export async function revokeParticipantTokens(participantId: string): Promise<void> {
    await db.update(magicTokens)
        .set({ revokedAt: new Date() })
        .where(and(
            eq(magicTokens.participantId, participantId),
            isNull(magicTokens.revokedAt),
            isNull(magicTokens.usedAt)
        ));
}

/**
 * Revoke a specific token
 */
export async function revokeToken(tokenId: string): Promise<void> {
    await db.update(magicTokens)
        .set({ revokedAt: new Date() })
        .where(eq(magicTokens.id, tokenId));
}

/**
 * Clean up expired tokens (run periodically)
 */
export async function cleanupExpiredTokens(): Promise<number> {
    const result = await db.update(magicTokens)
        .set({ revokedAt: new Date() })
        .where(and(
            lt(magicTokens.expiresAt, new Date()),
            isNull(magicTokens.revokedAt),
            isNull(magicTokens.usedAt)
        ));
    return result.rowCount ?? 0;
}

/**
 * Get active token for a participant/contact (for resend)
 */
export async function getActiveToken(participantId: string, contactId: string): Promise<typeof magicTokens.$inferSelect | null> {
    const [token] = await db
        .select()
        .from(magicTokens)
        .where(and(
            eq(magicTokens.participantId, participantId),
            eq(magicTokens.contactId, contactId),
            isNull(magicTokens.revokedAt),
            isNull(magicTokens.usedAt),
            gt(magicTokens.expiresAt, new Date())
        ))
        .orderBy(magicTokens.createdAt)
        .limit(1);
    return token ?? null;
}

/**
 * Build magic link URL for a token
 */
export function buildMagicLinkUrl(token: string, assessmentRequestId: string, participantId: string, redirectPath?: string): string {
    const baseUrl = getBaseUrl();
    const target = redirectPath || `/external/assessments/${assessmentRequestId}/requests/${participantId}/form`;
    // Embed the magic token directly on the target page so the link is
    // self-bootstrapping regardless of cookies, /external/login, or how
    // the recipient opens it (refresh, forward, new browser, etc.).
    // The target page validates the token server-side, sets the
    // external_session cookie, and strips the token from the URL.
    return `${baseUrl}${target}${target.includes("?") ? "&" : "?"}magictoken=${encodeURIComponent(token)}`;
}