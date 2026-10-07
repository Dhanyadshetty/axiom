export type ContactStatus = 'active' | 'inactive' | 'on_hold';

export const CONTACT_STATUSES: ContactStatus[] = ['active', 'inactive', 'on_hold'];

export type ContactColumnKey =
    | 'name'
    | 'email'
    | 'phone'
    | 'supplier'
    | 'language'
    | 'department'
    | 'position'
    | 'responsibility'
    | 'status';

export interface ContactColumnDef {
    key: ContactColumnKey;
    label: string;
    required: boolean;
    kind: 'text' | 'enum' | 'supplier';
    enumValues?: string[];
    defaultWidth: number;
    /** If true, this column stays frozen on the left of the horizontal scroll. */
    frozen?: boolean;
}

export const DEFAULT_COLUMN_WIDTHS: Record<ContactColumnKey, number> = {
    name: 220,
    email: 240,
    phone: 160,
    supplier: 200,
    language: 130,
    department: 170,
    position: 200,
    responsibility: 240,
    status: 120,
};

export const NAME_COLUMN_WIDTH = DEFAULT_COLUMN_WIDTHS.name;

export const DEFAULT_DEPARTMENT_OPTIONS = [
    'Sales',
    'Purchasing/Procurement',
    'Executive Management',
    'Engineering',
    'Quality Management',
    'Logistics/Supply Chain',
    'Product Management',
    'Research & Development',
    'Marketing',
    'Finance',
    'IT',
    'HR',
] as const;

export const DEFAULT_LANGUAGE_OPTIONS = [
    'English',
    'German',
    'Czech',
    'French',
    'Spanish',
    'Italian',
    'Polish',
    'Slovak',
    'Chinese',
    'Hindi',
] as const;

export const CONTACT_COLUMNS: ContactColumnDef[] = [
    { key: 'name', label: 'Contact', required: true, kind: 'text', defaultWidth: DEFAULT_COLUMN_WIDTHS.name, frozen: true },
    { key: 'email', label: 'Email', required: true, kind: 'text', defaultWidth: DEFAULT_COLUMN_WIDTHS.email },
    { key: 'phone', label: 'Phone number', required: false, kind: 'text', defaultWidth: DEFAULT_COLUMN_WIDTHS.phone },
    { key: 'supplier', label: 'Supplier', required: false, kind: 'supplier', defaultWidth: DEFAULT_COLUMN_WIDTHS.supplier },
    { key: 'language', label: 'Language', required: false, kind: 'enum', enumValues: [...DEFAULT_LANGUAGE_OPTIONS], defaultWidth: DEFAULT_COLUMN_WIDTHS.language },
    { key: 'department', label: 'Department', required: false, kind: 'enum', enumValues: [...DEFAULT_DEPARTMENT_OPTIONS], defaultWidth: DEFAULT_COLUMN_WIDTHS.department },
    { key: 'position', label: 'Position', required: false, kind: 'text', defaultWidth: DEFAULT_COLUMN_WIDTHS.position },
    { key: 'responsibility', label: 'Responsibility', required: false, kind: 'text', defaultWidth: DEFAULT_COLUMN_WIDTHS.responsibility },
    { key: 'status', label: 'Status', required: false, kind: 'enum', enumValues: CONTACT_STATUSES, defaultWidth: DEFAULT_COLUMN_WIDTHS.status },
];

export const IGNORE_COLUMN = '__ignore__';

export interface FuzzyMapEntry {
    key: ContactColumnKey;
    label: string;
    required: boolean;
    patterns: RegExp[];
    aliases: string[];
}

export const FUZZY_MAP: FuzzyMapEntry[] = [
    {
        key: 'name',
        label: 'Contact (Name)',
        required: true,
        patterns: [
            /^name$/i,
            /\bfull\s*name\b/i,
            /\bfirst\s*name\b/i,
            /\blast\s*name\b/i,
            /\bkontakt(person)?\b/i,
            /^contact(\s*name)?$/i,
            /\bansprechpartner\b/i,
            /^person$/i,
            /\bvorname\b/i,
            /\bnachname\b/i,
            /\bcontact\s*person\b/i,
        ],
        aliases: [
            'contact',
            'contacts',
            'name',
            'full name',
            'first name',
            'last name',
            'kontakt',
            'kontaktperson',
            'ansprechpartner',
            'person',
            'vorname',
            'nachname',
            'contact name',
            'contact person',
        ],
    },
    {
        key: 'email',
        label: 'Email',
        required: true,
        patterns: [
            /^e-?mail$/i,
            /^email$/i,
            /^mail$/i,
            /^e_mail$/i,
            /\bemail\s*address\b/i,
            /\be-?mail-?adresse\b/i,
            /\bgeschäftliche\s*e-?mail\b/i,
            /\bwork\s*email\b/i,
            /\bbusiness\s*email\b/i,
            /^adresse$/i,
        ],
        aliases: [
            'email',
            'e-mail',
            'mail',
            'e_mail',
            'email address',
            'e-mail-adresse',
            'emailadresse',
            'geschäftliche email',
            'business email',
            'work email',
            'adresse',
        ],
    },
    {
        key: 'phone',
        label: 'Phone number',
        required: false,
        patterns: [
            /^phone$/i,
            /\bphone\s*number\b/i,
            /\btel(efon|ephone)?\b/i,
            /^mobile$/i,
            /\bmobil(telefon|nummer)?\b/i,
            /^handy$/i,
            /\bcell(\s*phone)?\b/i,
            /\brufnummer\b/i,
            /^tel$/i,
        ],
        aliases: [
            'phone',
            'phone number',
            'telephone',
            'telefon',
            'mobile',
            'mobil',
            'handy',
            'cell',
            'rufnummer',
            'tel',
            'phone numbers',
            'telefonnummer',
            'mobilnummer',
        ],
    },
    {
        key: 'supplier',
        label: 'Supplier',
        required: false,
        patterns: [
            /^supplier$/i,
            /\bsupplier\s*name\b/i,
            /\bsupplier\s*(id|number|nr)\b/i,
            /^vendor$/i,
            /\blieferant(en)?\b/i,
            /\blieferantenname\b/i,
            /^company$/i,
            /^firma$/i,
            /^kreditor$/i,
            /^creditor$/i,
            /^partner$/i,
        ],
        aliases: [
            'supplier',
            'suppliers',
            'supplier name',
            'supplier id',
            'vendor',
            'lieferant',
            'lieferanten',
            'lieferantenname',
            'company',
            'firma',
            'kreditor',
            'creditor',
            'partner',
        ],
    },
    {
        key: 'language',
        label: 'Language',
        required: false,
        patterns: [
            /^language$/i,
            /^sprache$/i,
            /^lang$/i,
            /\bpreferred\s*language\b/i,
            /\bkorrespondenzsprache\b/i,
        ],
        aliases: [
            'language',
            'sprache',
            'lang',
            'preferred language',
            'korrespondenzsprache',
        ],
    },
    {
        key: 'department',
        label: 'Department',
        required: false,
        patterns: [
            /^department$/i,
            /^abteilung$/i,
            /^bereich$/i,
            /^dept$/i,
            /^division$/i,
            /\bfachbereich\b/i,
        ],
        aliases: [
            'department',
            'abteilung',
            'bereich',
            'dept',
            'division',
            'fachbereich',
        ],
    },
    {
        key: 'position',
        label: 'Position',
        required: false,
        patterns: [
            /^position$/i,
            /^role$/i,
            /^title$/i,
            /\bjob\s*title\b/i,
            /\bfunktion\b/i,
            /\bberuf\b/i,
            /\bstelle\b/i,
            /\bberufsbezeichnung\b/i,
        ],
        aliases: [
            'position',
            'role',
            'title',
            'job title',
            'funktion',
            'job',
            'beruf',
            'stelle',
            'berufsbezeichnung',
        ],
    },
    {
        key: 'responsibility',
        label: 'Responsibility',
        required: false,
        patterns: [
            /\bresponsibilit(y|ies)\b/i,
            /\bverantwortung\b/i,
            /\bzuständigkeit\b/i,
            /^scope$/i,
            /\baufgaben(bereich)?\b/i,
            /\btätigkeit\b/i,
        ],
        aliases: [
            'responsibility',
            'responsibilities',
            'verantwortung',
            'zuständigkeit',
            'scope',
            'aufgaben',
            'aufgabenbereich',
        ],
    },
    {
        key: 'status',
        label: 'Status',
        required: false,
        patterns: [
            /^status$/i,
            /^zustand$/i,
            /\bcontact\s*status\b/i,
            /^lifecycle$/i,
            /^statuswert$/i,
        ],
        aliases: [
            'status',
            'zustand',
            'contact status',
            'statuswert',
        ],
    },
];

export const HEADER_KEYWORDS = [
    'name',
    'fullname',
    'full name',
    'firstname',
    'first name',
    'lastname',
    'last name',
    'contact',
    'contact name',
    'contact person',
    'ansprechpartner',
    'kontakt',
    'kontaktperson',
    'person',
    'vorname',
    'nachname',
    'email',
    'e-mail',
    'mail',
    'email address',
    'e-mail-adresse',
    'mailadresse',
    'geschäftliche email',
    'business email',
    'work email',
    'phone',
    'phone number',
    'phone numbers',
    'telefon',
    'telefonnummer',
    'mobile',
    'mobil',
    'mobilnummer',
    'handy',
    'tel',
    'rufnummer',
    'telephone',
    'supplier',
    'supplier name',
    'supplier id',
    'supplier number',
    'vendor',
    'lieferant',
    'lieferanten',
    'lieferantenname',
    'company',
    'firma',
    'kreditor',
    'creditor',
    'partner',
    'language',
    'sprache',
    'preferred language',
    'korrespondenzsprache',
    'lang',
    'department',
    'abteilung',
    'bereich',
    'dept',
    'division',
    'fachbereich',
    'position',
    'title',
    'job title',
    'funktion',
    'role',
    'stelle',
    'beruf',
    'berufsbezeichnung',
    'responsibility',
    'responsibilities',
    'verantwortung',
    'zuständigkeit',
    'scope',
    'aufgaben',
    'aufgabenbereich',
    'status',
    'zustand',
    'contact status',
    'statuswert',
];

export function normalizeHeader(header: string): string {
    return header
        .trim()
        .toLowerCase()
        .replace(/[\s_\-./()]+/g, ' ')
        .replace(/[^\p{L}\p{N} ]/gu, '')
        .replace(/\s+/g, ' ')
        .trim();
}

export function suggestMapping(header: string): ContactColumnKey | typeof IGNORE_COLUMN {
    const raw = header.trim();
    if (!raw) return IGNORE_COLUMN;
    // Never auto-map a header that is an actual data value (email, phone, etc.)
    if (isDataCell(raw)) return IGNORE_COLUMN;

    const norm = normalizeHeader(raw);
    if (!norm) return IGNORE_COLUMN;

    // Pass 1: exact match on key or label
    for (const item of FUZZY_MAP) {
        if (norm === normalizeHeader(item.key) || norm === normalizeHeader(item.label)) {
            return item.key;
        }
    }

    // Pass 2: exact alias match
    for (const item of FUZZY_MAP) {
        if (item.aliases.some((a) => normalizeHeader(a) === norm)) {
            return item.key;
        }
    }

    // Pass 3: regex pattern match
    for (const item of FUZZY_MAP) {
        if (item.patterns.some((p) => p.test(raw) || p.test(norm))) {
            return item.key;
        }
    }

    // Pass 4: word boundary / exact alias containment match (only on clean header tokens)
    for (const item of FUZZY_MAP) {
        if (item.aliases.some((a) => {
            const normAlias = normalizeHeader(a);
            return norm === normAlias || norm.split(' ').includes(normAlias);
        })) {
            return item.key;
        }
    }

    return IGNORE_COLUMN;
}

export function isValidEmail(value: string): boolean {
    if (!value || typeof value !== 'string') return false;
    const trimmed = value.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function isPhoneNumber(value: string): boolean {
    if (!value || typeof value !== 'string') return false;
    const trimmed = value.trim();
    // Typical phone: starts with + or digits, at least 6 digits/characters with common separators
    return /^(\+?[0-9\s()./-]{6,25})$/.test(trimmed) && (trimmed.match(/\d/g) || []).length >= 5;
}

/**
 * Checks if a cell contains a data value (email, phone, numeric id, etc.)
 * rather than a column header label.
 */
export function isDataCell(value: unknown): boolean {
    if (value === null || value === undefined) return false;
    const str = String(value).trim();
    if (!str) return false;
    if (isValidEmail(str) || (str.includes('@') && str.includes('.'))) return true;
    if (isPhoneNumber(str) && !/^(phone|tel|mobile|telefon|rufnummer)/i.test(str)) return true;
    if (/^\+?\d[\d\s()./-]{5,}\d$/.test(str) && (str.match(/\d/g) || []).length >= 5) return true;
    if (/^\d+(\.\d+)?$/.test(str) && str.length >= 3) return true;
    return false;
}

/**
 * Determines whether a given row is a header row or a data row.
 * Returns true if the row contains valid column headers and NO actual data values.
 */
export function isHeaderRow(row: unknown[]): boolean {
    if (!Array.isArray(row) || !row.length) return false;

    // If ANY non-empty cell in the row is an email or phone number, it's definitely data!
    for (const cell of row) {
        if (cell === null || cell === undefined) continue;
        const str = String(cell).trim();
        if (!str) continue;
        if (isValidEmail(str) || (str.includes('@') && str.includes('.')) || isPhoneNumber(str)) {
            return false;
        }
    }

    let keywordMatches = 0;
    for (const cell of row) {
        if (cell === null || cell === undefined) continue;
        const str = String(cell).trim();
        if (!str) continue;
        const norm = normalizeHeader(str);
        if (HEADER_KEYWORDS.some((kw) => norm === kw || norm === normalizeHeader(kw))) {
            keywordMatches++;
        }
    }

    return keywordMatches >= 1;
}

/**
 * Determines if a given row is data rather than header names.
 */
export function isDataRow(row: unknown[]): boolean {
    return !isHeaderRow(row);
}

export const TEMPLATE_HEADERS: Array<{ key: ContactColumnKey; label: string }> = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone number' },
    { key: 'supplier', label: 'Supplier' },
    { key: 'language', label: 'Language' },
    { key: 'department', label: 'Department' },
    { key: 'position', label: 'Position' },
    { key: 'responsibility', label: 'Responsibility' },
    { key: 'status', label: 'Status' },
];
