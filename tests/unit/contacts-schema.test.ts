import test from 'node:test';
import assert from 'node:assert/strict';
import {
    isValidEmail,
    isPhoneNumber,
    isDataCell,
    isDataRow,
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

test('isPhoneNumber detects phone formats', () => {
    assert.equal(isPhoneNumber('+49 170 1234567'), true);
    assert.equal(isPhoneNumber('0151-1234567'), true);
    assert.equal(isPhoneNumber('+1 (555) 019-2834'), true);
    assert.equal(isPhoneNumber('Not a phone'), false);
});

test('isDataCell detects actual data values rather than header titles', () => {
    assert.equal(isDataCell('user@company.com'), true);
    assert.equal(isDataCell('+49 170 1234567'), true);
    assert.equal(isDataCell('Email'), false);
    assert.equal(isDataCell('Contact Name'), false);
    assert.equal(isDataCell('Department'), false);
});

test('isDataRow detects if first row contains raw data instead of headers', () => {
    const dataRow = ['Jane Doe', 'jane.doe@example.com', '+49 170 1234567', 'Acme'];
    assert.equal(isDataRow(dataRow), true);

    const headerRow = ['Name', 'Email Address', 'Phone number', 'Supplier'];
    assert.equal(isDataRow(headerRow), false);
});

test('suggestMapping maps English and German synonyms to known fields', () => {
    // English
    assert.equal(suggestMapping('Name'), 'name');
    assert.equal(suggestMapping('Full Name'), 'name');
    assert.equal(suggestMapping('Email Address'), 'email');
    assert.equal(suggestMapping('Phone Number'), 'phone');
    assert.equal(suggestMapping('Supplier Name'), 'supplier');
    assert.equal(suggestMapping('Department'), 'department');
    assert.equal(suggestMapping('Job Title'), 'position');
    assert.equal(suggestMapping('Responsibility'), 'responsibility');
    assert.equal(suggestMapping('Status'), 'status');

    // German
    assert.equal(suggestMapping('Ansprechpartner'), 'name');
    assert.equal(suggestMapping('E-Mail-Adresse'), 'email');
    assert.equal(suggestMapping('Telefonnummer'), 'phone');
    assert.equal(suggestMapping('Lieferant'), 'supplier');
    assert.equal(suggestMapping('Abteilung'), 'department');
    assert.equal(suggestMapping('Funktion'), 'position');
    assert.equal(suggestMapping('Zuständigkeit'), 'responsibility');
    assert.equal(suggestMapping('Zustand'), 'status');

    assert.equal(suggestMapping('Random unrecognized column xyz'), IGNORE_COLUMN);
});

test('suggestMapping never maps actual data cells or emails containing domain words', () => {
    assert.equal(suggestMapping('quatsch@funktioniertnicht.com'), IGNORE_COLUMN);
    assert.equal(suggestMapping('test.user@company.de'), IGNORE_COLUMN);
    assert.equal(suggestMapping('+49 170 1234567'), IGNORE_COLUMN);
    assert.equal(suggestMapping('TEST123 Tacto Testlieferant A'), IGNORE_COLUMN);
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
    assert.ok(labels.includes('Supplier'));
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

