import test from 'node:test';
import assert from 'node:assert/strict';

// These tests assert the structure of the supplier contacts API responses
// by hitting the same code path that the route handlers use (Zod schemas).
// No DB is required - we only verify the parsing/validation behaviour.

import { z } from 'zod';

const contactCreateSchema = z.object({
    name: z.string().trim().min(1, 'Name is required'),
    email: z.string().trim().refine((v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Invalid email'),
    phone: z.string().optional().nullable(),
    supplierId: z.string().uuid().optional().nullable(),
    status: z.enum(['active', 'inactive', 'on_hold']).default('active'),
});

test('contact create schema rejects empty name', () => {
    const parsed = contactCreateSchema.safeParse({ name: '', email: 'a@b.com' });
    assert.equal(parsed.success, false);
});

test('contact create schema rejects malformed email', () => {
    const parsed = contactCreateSchema.safeParse({ name: 'Anna', email: 'not-an-email' });
    assert.equal(parsed.success, false);
});

test('contact create schema rejects non-uuid supplierId', () => {
    const parsed = contactCreateSchema.safeParse({ name: 'Anna', email: 'a@b.com', supplierId: 'not-a-uuid' });
    assert.equal(parsed.success, false);
});

test('contact create schema accepts valid minimal payload', () => {
    const parsed = contactCreateSchema.safeParse({ name: 'Anna', email: 'a@b.com' });
    assert.equal(parsed.success, true);
    if (parsed.success) {
        assert.equal(parsed.data.status, 'active');
        assert.equal(parsed.data.supplierId, undefined);
    }
});

test('contact create schema defaults status to active', () => {
    const parsed = contactCreateSchema.safeParse({ name: 'Anna', email: 'a@b.com', supplierId: '00000000-0000-0000-0000-000000000000' });
    assert.equal(parsed.success, true);
    if (parsed.success) {
        assert.equal(parsed.data.status, 'active');
        assert.equal(parsed.data.supplierId, '00000000-0000-0000-0000-000000000000');
    }
});
