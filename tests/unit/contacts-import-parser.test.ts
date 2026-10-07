import test from 'node:test';
import assert from 'node:assert/strict';
import {
    buildCsvFromSheet,
    buildWorkbookFromSheet,
    parseCsvText,
    parseWorkbook,
} from '../../src/lib/contacts/import-parser';
import * as XLSX from 'xlsx';

test('buildCsvFromSheet produces a CSV header line + sample rows', () => {
    const csv = buildCsvFromSheet(
        [{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }],
        [{ name: 'Anna', email: 'anna@example.com' }],
    );
    const lines = csv.split('\n');
    assert.equal(lines[0], 'Name,Email');
    assert.equal(lines[1], 'Anna,anna@example.com');
});

test('buildCsvFromSheet escapes commas and quotes', () => {
    const csv = buildCsvFromSheet(
        [{ key: 'name', label: 'Name' }],
        [{ name: 'Doe, John "JD"' }],
    );
    assert.equal(csv, 'Name\n"Doe, John ""JD"""');
});

test('buildWorkbookFromSheet returns an ArrayBuffer with headers', () => {
    const buf = buildWorkbookFromSheet(
        [{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }],
    );
    assert.ok(buf instanceof ArrayBuffer);
    const wb = XLSX.read(buf, { type: 'array' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const aoa = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });
    assert.deepEqual(aoa[0], ['Name', 'Email']);
});

test('parseWorkbook roundtrips a generated xlsx buffer', () => {
    const buf = buildWorkbookFromSheet(
        [{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'phone', label: 'Phone number' }],
        [
            { name: 'Anna Müller', email: 'anna@example.com', phone: '+49 123' },
            { name: 'Bob', email: 'bob@example.com', phone: '' },
        ],
    );
    const parsed = parseWorkbook(buf, 'test.xlsx');
    assert.equal(parsed.sheets.length, 1);
    const sheet = parsed.sheets[0];
    assert.deepEqual(sheet.headers, ['Name', 'Email', 'Phone number']);
    assert.equal(sheet.rows.length, 2);
    assert.equal(sheet.rows[0].Name, 'Anna Müller');
});

test('parseCsvText parses simple CSV string', () => {
    const wb = parseCsvText('Name,Email\nAnna,a@b.com\nBob,c@d.com\n');
    const sheet = wb.sheets[0];
    assert.deepEqual(sheet.headers, ['Name', 'Email']);
    assert.equal(sheet.rows.length, 2);
    assert.equal(sheet.rows[1]['Email'], 'c@d.com');
});

test('parseWorkbook handles header detection when first row contains actual data values like emails', () => {
    const aoa = [
        ['quatsch@funktioniertnicht.com', 'quatsch@funktioniertnicht.com', '', 'TEST123 Tacto Testlieferant A', '', 'Sales'],
        ['simon.mohr@tacto.ai', 'simon.mohr@tacto.ai', '+49 7455 938020', 'TEST456 Tacto Testlieferant', 'German', 'Sales'],
        ['Oliver Grohe', 'oliver.grohe@grohe-technology.de', '+86 186 2105 0991', 'Grohe Technology GmbH', 'English', 'Sales'],
    ];

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Contacts');
    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });

    const parsed = parseWorkbook(buf);
    const sheet = parsed.sheets[0];

    // Must NOT use email as column header!
    assert.equal(sheet.hasHeaderRow, false);
    assert.equal(sheet.headers[0], 'Column 1');
    assert.equal(sheet.headers[1], 'Column 2');
    assert.equal(sheet.headers[2], 'Column 3');
    assert.equal(sheet.headers[3], 'Column 4');

    // All 3 rows are kept in data
    assert.equal(sheet.rows.length, 3);
    assert.equal(sheet.rows[0]['Column 1'], 'quatsch@funktioniertnicht.com');
});

test('parseWorkbook extracts sample values for each column', () => {
    const csv = 'Name,Email,Supplier\nAlice,alice@example.com,Acme Corp\nBob,bob@example.com,Acme Corp\nCharlie,charlie@example.com,Beta Inc';
    const parsed = parseCsvText(csv);
    const sheet = parsed.sheets[0];

    assert.equal(sheet.columns.length, 3);
    assert.deepEqual(sheet.columns[0].samples, ['Alice', 'Bob', 'Charlie']);
    assert.deepEqual(sheet.columns[1].samples, ['alice@example.com', 'bob@example.com', 'charlie@example.com']);
    assert.deepEqual(sheet.columns[2].samples, ['Acme Corp', 'Beta Inc']);
});

test('parseWorkbook produces suggested mappings for German and English headers', () => {
    const buf = buildWorkbookFromSheet(
        [
            { key: 'name', label: 'Ansprechpartner' },
            { key: 'email', label: 'E-Mail-Adresse' },
            { key: 'phone', label: 'Telefon' },
            { key: 'department', label: 'Abteilung' },
            { key: 'supplier', label: 'Lieferant' },
        ],
        [],
    );
    const parsed = parseWorkbook(buf);
    const sheet = parsed.sheets[0];
    assert.equal(sheet.suggestedMapping['Ansprechpartner'], 'name');
    assert.equal(sheet.suggestedMapping['E-Mail-Adresse'], 'email');
    assert.equal(sheet.suggestedMapping['Telefon'], 'phone');
    assert.equal(sheet.suggestedMapping['Abteilung'], 'department');
    assert.equal(sheet.suggestedMapping['Lieferant'], 'supplier');
});
