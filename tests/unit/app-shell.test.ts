import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveShellMode } from '../../src/lib/shell-mode';

const authedSession = { user: { id: 'u1', role: 'admin' }, expires: '2030-01-01' } as any;

test('resolveShellMode renders the authenticated shell (sidebar) once the client session is authenticated', () => {
    assert.equal(resolveShellMode('authenticated', null), 'authenticated');
    assert.equal(resolveShellMode('authenticated', authedSession), 'authenticated');
});

test('resolveShellMode shows the authenticated shell (sidebar skeleton) while auth resolves on an already-known-authenticated route', () => {
    // This is the "gap" case: a soft client navigation / fresh load where the
    // server already knew about the session but the client session is still
    // loading. The fix must render the shell (with a sidebar skeleton), NOT nothing.
    assert.equal(resolveShellMode('loading', authedSession), 'authenticated');
});

test('resolveShellMode keeps the public shell on the login screen (no sidebar flash)', () => {
    assert.equal(resolveShellMode('unauthenticated', null), 'public');
    // Still loading but the server had no session (login screen) -> public shell.
    assert.equal(resolveShellMode('loading', null), 'public');
});

test('resolveShellMode falls back to the public shell when unauthenticated even if a stale server session existed', () => {
    assert.equal(resolveShellMode('unauthenticated', authedSession), 'public');
});
