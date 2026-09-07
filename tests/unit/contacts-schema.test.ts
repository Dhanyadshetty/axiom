import test from 'node:test';
import assert from 'node:assert/strict';
import {
    isValidEmail,
    suggestMapping,
    CONTACT_STATUSES,
    CONTACT_COLUMNS,
    DEFAULT_COLUMN_WIDTHS,
    TEMPLATE_HEADERS,
    IGNORE_COLUMN,
} from '../../src/components/contacts/contacts-schema';

test('isValidEmail accepts well-formed emails', () => {
    assert.equal(isValidEmail('user@example.com'), true);
    assert.equal(isValidEmail('first.last+tag@sub.example.co.uk'), true);
});

test('isValidEmail rejects malformed emails', () => {
    assert.equal(isValidEmail(''), false);
    assert.equal(isValidEmail('not-an-email'), false);
    assert.equal(isValidEmail('a@b'), false);
    assert.equal(isValidEmail('a@b.'), false);
});

test('suggestMapping maps common headers to known fields', () => {
    assert.equal(suggestMapping('Name'), 'name');
    assert.equal(suggestMapping('E-Mail'), 'email');
    assert.equal(suggestMapping('Telephone'), 'phone');
    assert.equal(suggestMapping('Lieferant'), 'supplier');
    assert.equal(suggestMapping('Department'), 'department');
    assert.equal(suggestMapping('Sprache'), 'language');
    assert.equal(suggestMapping('Status'), 'status');
    assert.equal(suggestMapping('Random gibberish xyz'), IGNORE_COLUMN);
});

test('CONTACT_STATUSES is the three canonical statuses', () => {
    assert.deepEqual(CONTACT_STATUSES, ['active', 'inactive', 'on_hold']);
});

test('TEMPLATE_HEADERS covers the user-facing schema', () => {
    const labels = TEMPLATE_HEADERS.map((h) => h.label);
    assert.ok(labels.includes('Name'));
    assert.ok(labels.includes('Email'));
    assert.ok(labels.includes('Phone number'));
    assert.ok(labels.includes('Department'));
    assert.ok(labels.includes('Position'));
    assert.ok(labels.includes('Responsibility'));
    assert.ok(labels.includes('Status'));
    assert.ok(labels.includes('Language'));
});

test('every column has a positive default width', () => {
    for (const col of CONTACT_COLUMNS) {
        assert.ok(col.defaultWidth > 0, `${col.key} defaultWidth should be > 0`);
        assert.equal(typeof col.defaultWidth, 'number');
    }
    assert.equal(DEFAULT_COLUMN_WIDTHS.name, 220);
});

test('name column is the only frozen column by default', () => {
    const frozen = CONTACT_COLUMNS.filter((c) => c.frozen);
    assert.equal(frozen.length, 1);
    assert.equal(frozen[0].key, 'name');
});
