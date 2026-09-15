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

export const FUZZY_MAP: Array<{ key: ContactColumnKey; patterns: RegExp[] }> = [
    { key: 'name', patterns: [/^name$/i, /full\s*name/i, /first\s*name/i, /last\s*name/i, /kontakt/i, /^contact$/i, /ansprechpartner/i, /person/i, /vorname/i, /nachname/i] },
    { key: 'email', patterns: [/e-?mail/i, /email/i, /mail/i, /e_mail/i, /adresse/i] },
    { key: 'phone', patterns: [/phone/i, /tel(efon|ephone)?/i, /mobile/i, /mobil/i, /handy/i, /cell/i, /rufnummer/i] },
    { key: 'supplier', patterns: [/supplier/i, /vendor/i, /lieferant/i, /company/i, /firma/i, /kreditor/i, /creditor/i] },
    { key: 'language', patterns: [/language/i, /sprache/i, /^lang$/i] },
    { key: 'department', patterns: [/department/i, /abteilung/i, /bereich/i, /^dept$/i] },
    { key: 'position', patterns: [/position/i, /role/i, /title/i, /job\s*title/i, /funktion/i, /beruf/i] },
    { key: 'responsibility', patterns: [/responsibility|responsibilities/i, /verantwortung/i, /zuständigkeit/i, /scope/i] },
    { key: 'status', patterns: [/^status$/i, /zustand/i] },
];

export function suggestMapping(header: string): ContactColumnKey | '__ignore__' {
    const text = header.trim();
    for (const m of FUZZY_MAP) {
        if (m.patterns.some((p) => p.test(text))) return m.key;
    }
    return IGNORE_COLUMN;
}

export function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export const TEMPLATE_HEADERS: Array<{ key: ContactColumnKey; label: string }> = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone number' },
    { key: 'language', label: 'Language' },
    { key: 'department', label: 'Department' },
    { key: 'position', label: 'Position' },
    { key: 'responsibility', label: 'Responsibility' },
    { key: 'status', label: 'Status' },
];
