import crypto from 'node:crypto';
import { db } from '@/db';
import { trustedDevices } from '@/db/schema';
import { eq, and, gt, desc } from 'drizzle-orm';

export const TRUSTED_DEVICE_COOKIE_NAME =
    process.env.NODE_ENV === 'production'
        ? '__Secure-axiom.trusted-device'
        : 'axiom.trusted-device';

export const TRUSTED_DEVICE_EXPIRATION_DAYS = 30;
export const TRUSTED_DEVICE_MAX_AGE_SECONDS = TRUSTED_DEVICE_EXPIRATION_DAYS * 24 * 60 * 60;

export function generateDeviceToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

export function hashDeviceToken(token: string): string {
    return crypto.createHash('sha256').update(token.trim()).digest('hex');
}

export function parseDeviceName(userAgent?: string | null): string {
    if (!userAgent) return 'Unknown Device';

    const ua = userAgent;

    // Detect OS
    let os = 'Unknown OS';
    if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
    else if (/Android/i.test(ua)) os = 'Android';
    else if (/Windows/i.test(ua)) os = 'Windows';
    else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
    else if (/Linux/i.test(ua)) os = 'Linux';
    else if (/CrOS/i.test(ua)) os = 'ChromeOS';

    // Detect Browser
    let browser = 'Browser';
    if (/Edg\//i.test(ua)) browser = 'Edge';
    else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = 'Chrome';
    else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = 'Safari';
    else if (/Firefox\//i.test(ua)) browser = 'Firefox';
    else if (/OPR\//i.test(ua) || /Opera/i.test(ua)) browser = 'Opera';

    return `${browser} on ${os}`;
}

export function getTrustedDeviceCookieOptions(expiresAt?: Date) {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        maxAge: TRUSTED_DEVICE_MAX_AGE_SECONDS,
        expires: expiresAt || new Date(Date.now() + TRUSTED_DEVICE_MAX_AGE_SECONDS * 1000),
    };
}

/**
 * Validates whether a given raw token belongs to the user and is still unexpired.
 * If valid, refreshes the device's lastUsedAt timestamp and extends its expiration by 30 days.
 */
export async function validateAndTouchTrustedDevice(
    userId: string,
    rawToken: string
): Promise<boolean> {
    if (!userId || !rawToken) return false;

    try {
        const tokenHash = hashDeviceToken(rawToken);
        const now = new Date();

        const [device] = await db
            .select({
                id: trustedDevices.id,
                expiresAt: trustedDevices.expiresAt,
            })
            .from(trustedDevices)
            .where(
                and(
                    eq(trustedDevices.userId, userId),
                    eq(trustedDevices.tokenHash, tokenHash),
                    gt(trustedDevices.expiresAt, now)
                )
            )
            .limit(1);

        if (!device) return false;

        // Slide the 30-day expiration window forward on activity
        const newExpiry = new Date(Date.now() + TRUSTED_DEVICE_MAX_AGE_SECONDS * 1000);
        await db
            .update(trustedDevices)
            .set({
                lastUsedAt: now,
                expiresAt: newExpiry,
            })
            .where(eq(trustedDevices.id, device.id));

        return true;
    } catch (err) {
        console.error('[TRUSTED_DEVICE] Failed to validate device:', err);
        return false;
    }
}

/**
 * Registers a new trusted device for a user with a 30-day lifetime.
 * Returns the raw token to set in the client cookie.
 */
export async function registerTrustedDevice(
    userId: string,
    userAgent?: string | null,
    ipAddress?: string | null
): Promise<{ rawToken: string; expiresAt: Date; deviceName: string } | null> {
    if (!userId) return null;

    try {
        const rawToken = generateDeviceToken();
        const tokenHash = hashDeviceToken(rawToken);
        const deviceName = parseDeviceName(userAgent);
        const expiresAt = new Date(Date.now() + TRUSTED_DEVICE_MAX_AGE_SECONDS * 1000);

        await db.insert(trustedDevices).values({
            userId,
            tokenHash,
            deviceName,
            userAgent: userAgent || null,
            ipAddress: ipAddress || null,
            expiresAt,
            lastUsedAt: new Date(),
        });

        return { rawToken, expiresAt, deviceName };
    } catch (err) {
        console.error('[TRUSTED_DEVICE] Failed to register device:', err);
        return null;
    }
}

export interface UserTrustedDeviceSummary {
    id: string;
    deviceName: string;
    userAgent: string | null;
    ipAddress: string | null;
    lastUsedAt: Date | null;
    expiresAt: Date;
    createdAt: Date | null;
    isCurrentDevice: boolean;
}

/**
 * Lists all active (unexpired) trusted devices for a user.
 */
export async function listUserTrustedDevices(
    userId: string,
    currentRawToken?: string | null
): Promise<UserTrustedDeviceSummary[]> {
    if (!userId) return [];

    try {
        const now = new Date();
        const devices = await db
            .select({
                id: trustedDevices.id,
                tokenHash: trustedDevices.tokenHash,
                deviceName: trustedDevices.deviceName,
                userAgent: trustedDevices.userAgent,
                ipAddress: trustedDevices.ipAddress,
                lastUsedAt: trustedDevices.lastUsedAt,
                expiresAt: trustedDevices.expiresAt,
                createdAt: trustedDevices.createdAt,
            })
            .from(trustedDevices)
            .where(
                and(
                    eq(trustedDevices.userId, userId),
                    gt(trustedDevices.expiresAt, now)
                )
            )
            .orderBy(desc(trustedDevices.lastUsedAt));

        const currentHash = currentRawToken ? hashDeviceToken(currentRawToken) : null;

        return devices.map((d) => ({
            id: d.id,
            deviceName: d.deviceName,
            userAgent: d.userAgent,
            ipAddress: d.ipAddress,
            lastUsedAt: d.lastUsedAt,
            expiresAt: d.expiresAt,
            createdAt: d.createdAt,
            isCurrentDevice: currentHash ? d.tokenHash === currentHash : false,
        }));
    } catch (err) {
        console.error('[TRUSTED_DEVICE] Failed to list devices:', err);
        return [];
    }
}

/**
 * Revokes a single trusted device for a user.
 */
export async function revokeTrustedDevice(
    userId: string,
    deviceId: string
): Promise<boolean> {
    if (!userId || !deviceId) return false;

    try {
        await db
            .delete(trustedDevices)
            .where(
                and(
                    eq(trustedDevices.id, deviceId),
                    eq(trustedDevices.userId, userId)
                )
            );
        return true;
    } catch (err) {
        console.error('[TRUSTED_DEVICE] Failed to revoke device:', err);
        return false;
    }
}

/**
 * Revokes all trusted devices for a user.
 */
export async function revokeAllTrustedDevices(userId: string): Promise<boolean> {
    if (!userId) return false;

    try {
        await db
            .delete(trustedDevices)
            .where(eq(trustedDevices.userId, userId));
        return true;
    } catch (err) {
        console.error('[TRUSTED_DEVICE] Failed to revoke all devices:', err);
        return false;
    }
}
