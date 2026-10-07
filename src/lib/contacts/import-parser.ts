import * as XLSX from 'xlsx';
import {
    suggestMapping,
    isHeaderRow,
    isDataCell,
    isValidEmail,
    isPhoneNumber,
    DEFAULT_LANGUAGE_OPTIONS,
    DEFAULT_DEPARTMENT_OPTIONS,
    CONTACT_STATUSES,
    IGNORE_COLUMN,
    type ContactColumnKey,
} from '@/components/contacts/contacts-schema';

export interface SourceColumnInfo {
    index: number;
    letter: string;
    header: string;
    samples: string[];
    hasData: boolean;
}

export interface ParsedSheet {
    name: string;
    headers: string[];
    columns: SourceColumnInfo[];
    rows: Array<Record<string, string>>;
    rawRows: unknown[][];
    suggestedMapping: Record<string, ContactColumnKey | typeof IGNORE_COLUMN>;
    hasHeaderRow: boolean;
}

export interface ParsedWorkbook {
    sheets: ParsedSheet[];
}

const MAX_ROWS = 5000;

export function colLetter(index: number): string {
    let s = '';
    let n = index;
    while (n >= 0) {
        s = String.fromCharCode((n % 26) + 65) + s;
        n = Math.floor(n / 26) - 1;
    }
    return s;
}

export function normaliseCell(value: unknown): string {
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
        const firstNonEmptyIdx = aoa.findIndex((row) => Array.isArray(row) && row.some((c) => normaliseCell(c) !== ''));
        if (firstNonEmptyIdx < 0) {
            return {
                name: sheetName,
                headers: [],
                columns: [],
                rows: [],
                rawRows: [],
                suggestedMapping: {},
                hasHeaderRow: false,
            };
        }

        const candidateHeaderRow = aoa[firstNonEmptyIdx] || [];
        const hasHeader = isHeaderRow(candidateHeaderRow);

        let headers: string[] = [];
        let startDataIdx = firstNonEmptyIdx;

        // Determine column count
        const maxCols = Math.max(
            candidateHeaderRow.length,
            ...aoa.slice(firstNonEmptyIdx, firstNonEmptyIdx + 50).map((r) => (Array.isArray(r) ? r.length : 0)),
        );

        if (hasHeader) {
            // First row has valid column headers
            startDataIdx = firstNonEmptyIdx + 1;
            const seenHeaders = new Map<string, number>();
            headers = [];
            for (let i = 0; i < maxCols; i++) {
                const cellVal = normaliseCell(candidateHeaderRow[i]);
                // If a cell in header row is empty or looks like data, fall back to "Column X"
                const raw = cellVal && !isDataCell(cellVal) ? cellVal : `Column ${i + 1}`;
                const count = seenHeaders.get(raw) || 0;
                seenHeaders.set(raw, count + 1);
                headers.push(count > 0 ? `${raw} (${count + 1})` : raw);
            }
        } else {
            // Row is pure data: synthesize column names and start data from first row
            startDataIdx = firstNonEmptyIdx;
            headers = Array.from({ length: maxCols }, (_, i) => `Column ${i + 1}`);
        }

        const rawDataRows = aoa
            .slice(startDataIdx, startDataIdx + MAX_ROWS)
            .filter((r) => Array.isArray(r) && r.some((c) => normaliseCell(c) !== ''));

        const rows = rawDataRows.map((r) => rowToObject(headers, r as unknown[]));

        // Build column info with 2–3 sample values
        const columns: SourceColumnInfo[] = [];
        for (let i = 0; i < headers.length; i++) {
            const h = headers[i];
            const samples: string[] = [];
            let hasData = false;

            for (const r of rawDataRows) {
                if (!Array.isArray(r)) continue;
                const v = normaliseCell(r[i]);
                if (v) {
                    hasData = true;
                    if (samples.length < 3 && !samples.includes(v)) {
                        samples.push(v);
                    }
                }
            }

            columns.push({
                index: i,
                letter: colLetter(i),
                header: h,
                samples,
                hasData,
            });
        }

        // Auto-mapping: map each source column to target contact field without duplicate claims
        const suggestedMapping: ParsedSheet['suggestedMapping'] = {};
        const claimed = new Set<ContactColumnKey>();

        // Pass 1: Header name match
        for (const col of columns) {
            const mapped = suggestMapping(col.header);
            if (mapped !== IGNORE_COLUMN && !claimed.has(mapped)) {
                suggestedMapping[col.header] = mapped;
                claimed.add(mapped);
            }
        }

        // Pass 2: Content/sample-based matching for remaining unassigned columns
        for (const col of columns) {
            if (suggestedMapping[col.header] && suggestedMapping[col.header] !== IGNORE_COLUMN) {
                continue;
            }

            if (col.samples.length > 0) {
                const sampleEmail = col.samples.some((s) => isValidEmail(s) || (s.includes('@') && s.includes('.')));
                const samplePhone = col.samples.some((s) => isPhoneNumber(s));
                const sampleLang = col.samples.some((s) =>
                    DEFAULT_LANGUAGE_OPTIONS.some((l) => l.toLowerCase() === s.toLowerCase()),
                );
                const sampleDept = col.samples.some((s) =>
                    DEFAULT_DEPARTMENT_OPTIONS.some((d) => d.toLowerCase() === s.toLowerCase()),
                );
                const sampleStatus = col.samples.some((s) =>
                    CONTACT_STATUSES.some((st) => st.toLowerCase() === s.toLowerCase()),
                );

                if (sampleEmail && !claimed.has('email')) {
                    suggestedMapping[col.header] = 'email';
                    claimed.add('email');
                } else if (samplePhone && !claimed.has('phone')) {
                    suggestedMapping[col.header] = 'phone';
                    claimed.add('phone');
                } else if (sampleLang && !claimed.has('language')) {
                    suggestedMapping[col.header] = 'language';
                    claimed.add('language');
                } else if (sampleDept && !claimed.has('department')) {
                    suggestedMapping[col.header] = 'department';
                    claimed.add('department');
                } else if (sampleStatus && !claimed.has('status')) {
                    suggestedMapping[col.header] = 'status';
                    claimed.add('status');
                } else {
                    suggestedMapping[col.header] = IGNORE_COLUMN;
                }
            } else {
                suggestedMapping[col.header] = IGNORE_COLUMN;
            }
        }

        return {
            name: sheetName,
            headers,
            columns,
            rows,
            rawRows: rawDataRows as unknown[][],
            suggestedMapping,
            hasHeaderRow: hasHeader,
        };
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
