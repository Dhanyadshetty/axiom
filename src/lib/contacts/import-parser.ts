import * as XLSX from 'xlsx';
import { suggestMapping, IGNORE_COLUMN, type ContactColumnKey } from '@/components/contacts/contacts-schema';

export interface ParsedSheet {
    name: string;
    headers: string[];
    rows: Array<Record<string, string>>;
    suggestedMapping: Record<string, ContactColumnKey | typeof IGNORE_COLUMN>;
}

export interface ParsedWorkbook {
    sheets: ParsedSheet[];
}

const MAX_ROWS = 5000;

function normaliseCell(value: unknown): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    return String(value);
}

function rowToObject(headers: string[], row: unknown[]): Record<string, string> {
    const out: Record<string, string> = {};
    headers.forEach((h, i) => {
        out[h] = normaliseCell(row?.[i]);
    });
    return out;
}

export function parseWorkbook(buf: ArrayBuffer | Uint8Array, fileName?: string): ParsedWorkbook {
    const wb = XLSX.read(new Uint8Array(buf), { type: 'array' });
    const sheets: ParsedSheet[] = wb.SheetNames.map((sheetName) => {
        const sheet = wb.Sheets[sheetName];
        const aoa = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, blankrows: false, defval: '' });
        
        // Find the first row that has non-empty cells
        const headerRowIdx = aoa.findIndex((row) => Array.isArray(row) && row.some((c) => normaliseCell(c) !== ''));
        const rawHeaderRow = (headerRowIdx >= 0 ? aoa[headerRowIdx] : []) || [];
        
        const seenHeaders = new Map<string, number>();
        const headers = rawHeaderRow.map((h, i) => {
            const raw = normaliseCell(h) || `Column ${i + 1}`;
            const count = seenHeaders.get(raw) || 0;
            seenHeaders.set(raw, count + 1);
            return count > 0 ? `${raw} (${count + 1})` : raw;
        });

        const startIdx = headerRowIdx >= 0 ? headerRowIdx + 1 : 1;
        const dataRows = aoa.slice(startIdx, startIdx + MAX_ROWS);
        const rows = dataRows
            .filter((r) => Array.isArray(r) && r.some((c) => normaliseCell(c) !== ''))
            .map((r) => rowToObject(headers, r as unknown[]));
        const suggestedMapping: ParsedSheet['suggestedMapping'] = {};
        for (const h of headers) suggestedMapping[h] = suggestMapping(h);
        return { name: sheetName, headers, rows, suggestedMapping };
    });
    return { sheets };
}

export function parseCsvText(text: string): ParsedWorkbook {
    const wb = XLSX.read(text, { type: 'string' });
    return parseWorkbook(XLSX.write(wb, { type: 'array', bookType: 'xlsx' }));
}

export function buildWorkbookFromSheet(
    headers: Array<{ key: string; label: string }>,
    sample?: Array<Record<string, string>>,
): ArrayBuffer {
    const aoa: unknown[][] = [headers.map((h) => h.label)];
    if (sample) {
        for (const row of sample) aoa.push(headers.map((h) => row[h.key] ?? ''));
    }
    const sheet = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, 'Contacts');
    const out = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    return out as ArrayBuffer;
}

export function buildCsvFromSheet(headers: Array<{ key: string; label: string }>, sample?: Array<Record<string, string>>): string {
    const rows: string[][] = [headers.map((h) => csvEscape(h.label))];
    if (sample) {
        for (const row of sample) rows.push(headers.map((h) => csvEscape(row[h.key] ?? '')));
    }
    return rows.map((r) => r.join(',')).join('\n');
}

function csvEscape(value: string): string {
    if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
    return value;
}
