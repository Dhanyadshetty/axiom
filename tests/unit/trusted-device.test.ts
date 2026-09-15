import test from 'node:test';
import assert from 'node:assert/strict';

import {
    generateDeviceToken,
    hashDeviceToken,
    parseDeviceName,
    getTrustedDeviceCookieOptions,
    TRUSTED_DEVICE_MAX_AGE_SECONDS,
    TRUSTED_DEVICE_EXPIRATION_DAYS,
} from '../../src/lib/trusted-device';

test('generateDeviceToken produces 64-character high-entropy hex string', () => {
    const token1 = generateDeviceToken();
    const token2 = generateDeviceToken();

    assert.equal(typeof token1, 'string');
    assert.equal(token1.length, 64);
    assert.match(token1, /^[0-9a-f]{64}$/);
    assert.notEqual(token1, token2, 'Generated tokens must be unique');
});

test('hashDeviceToken hashes consistently using sha256', () => {
    const token = 'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789';
    const hash1 = hashDeviceToken(token);
    const hash2 = hashDeviceToken(token);

    assert.equal(hash1, hash2);
    assert.equal(hash1.length, 64);
    assert.match(hash1, /^[0-9a-f]{64}$/);
    // Ensure trimming is applied
    assert.equal(hashDeviceToken(`  ${token}  `), hash1);
});

test('parseDeviceName extracts common operating systems and browsers', () => {
    assert.equal(
        parseDeviceName('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'),
        'Chrome on Windows'
    );
    assert.equal(
        parseDeviceName('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'),
        'Safari on macOS'
    );
    assert.equal(
        parseDeviceName('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'),
        'Edge on Windows'
    );
    assert.equal(
        parseDeviceName('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'),
        'Safari on iOS'
    );
    assert.equal(
        parseDeviceName('Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.43 Mobile Safari/537.36'),
        'Chrome on Android'
    );
    assert.equal(
        parseDeviceName('Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0'),
        'Firefox on Linux'
    );
    assert.equal(parseDeviceName(null), 'Unknown Device');
    assert.equal(parseDeviceName(''), 'Unknown Device');
});

test('getTrustedDeviceCookieOptions enforces 30-day security policy and options', () => {
    assert.equal(TRUSTED_DEVICE_EXPIRATION_DAYS, 30);
    assert.equal(TRUSTED_DEVICE_MAX_AGE_SECONDS, 30 * 24 * 60 * 60);

    const options = getTrustedDeviceCookieOptions();
    assert.equal(options.httpOnly, true);
    assert.equal(options.sameSite, 'lax');
    assert.equal(options.path, '/');
    assert.equal(options.maxAge, 30 * 24 * 60 * 60);
    assert.ok(options.expires instanceof Date);
    assert.ok(options.expires.getTime() > Date.now() + 29 * 24 * 60 * 60 * 1000);
});
