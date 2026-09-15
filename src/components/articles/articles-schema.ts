export interface ArticleItem {
    id: string;
    articleNumber: string;
    description?: string | null;
    longText?: string | null;
    cnCode?: string | null;
    category?: string | null;
    createdAt?: string | null;
    lastUpdated?: string | null;
    budgetPrice?: number | null;
    netWeight?: number | null;
    netWeightUnit?: string | null;
    costModel?: string | null;
    supplierId?: string | null;
    supplierName?: string | null;
}

export type ArticleColumnKey =
    | 'article'
    | 'longText'
    | 'cnCode'
    | 'category'
    | 'createdAt'
    | 'lastUpdated'
    | 'netWeight'
    | 'netWeightUnit';

export interface ArticleColumnDef {
    key: ArticleColumnKey;
    label: string;
    defaultVisible: boolean;
    sortable?: boolean;
    hasTagIcon?: boolean;
    align?: 'left' | 'right' | 'center';
}

export const ARTICLE_COLUMNS: ArticleColumnDef[] = [
    { key: 'article', label: 'Article', defaultVisible: true, sortable: true },
    { key: 'longText', label: 'Long text', defaultVisible: true, sortable: false },
    { key: 'cnCode', label: 'CN code', defaultVisible: true, sortable: false },
    { key: 'category', label: 'Category', defaultVisible: true, sortable: false, hasTagIcon: true },
    { key: 'createdAt', label: 'Created at', defaultVisible: true, sortable: true },
    { key: 'lastUpdated', label: 'Last update...', defaultVisible: true, sortable: true },
    { key: 'netWeight', label: 'Net weight', defaultVisible: true, sortable: true, align: 'right' },
    { key: 'netWeightUnit', label: 'Net weight unit', defaultVisible: true, sortable: false },
];

export type FilterOperator =
    | 'is_one_of'
    | 'is_none_of'
    | 'blank'
    | 'not_blank'
    | 'contains'
    | 'does_not_contain'
    | 'equals'
    | 'does_not_equal'
    | 'begins_with'
    | 'does_not_begin_with'
    | 'ends_with';

export const FILTER_OPERATORS: Array<{ key: FilterOperator; label: string }> = [
    { key: 'is_one_of', label: 'is one of' },
    { key: 'is_none_of', label: 'is none of' },
    { key: 'blank', label: 'blank' },
    { key: 'not_blank', label: 'not blank' },
    { key: 'contains', label: 'contains' },
    { key: 'does_not_contain', label: 'does not contain' },
    { key: 'equals', label: 'equals' },
    { key: 'does_not_equal', label: 'does not equal' },
    { key: 'begins_with', label: 'begins with' },
    { key: 'does_not_begin_with', label: 'does not begin with' },
    { key: 'ends_with', label: 'ends with' },
];

export interface FilterableField {
    key: string;
    label: string;
    kind: 'select' | 'text' | 'number' | 'date';
}

export const FILTERABLE_FIELDS: FilterableField[] = [
    { key: 'article', label: 'Article', kind: 'select' },
    { key: 'articleNumber', label: 'Article number', kind: 'text' },
    { key: 'description', label: 'Description', kind: 'text' },
    { key: 'longText', label: 'Long text', kind: 'text' },
    { key: 'cnCode', label: 'CN code', kind: 'text' },
    { key: 'category', label: 'Category', kind: 'select' },
    { key: 'createdAt', label: 'Created at', kind: 'date' },
    { key: 'lastUpdated', label: 'Last updated at', kind: 'date' },
    { key: 'budgetPrice', label: 'BudgetPrice', kind: 'number' },
    { key: 'netWeight', label: 'Net weight', kind: 'number' },
    { key: 'netWeightUnit', label: 'Net weight unit', kind: 'select' },
    { key: 'costModel', label: 'Cost model', kind: 'select' },
];

export const DEFAULT_ARTICLE_CATEGORIES = [
    '0340 Tube, Sleeve, Hose',
    '0640 Deep drawn',
    '0510 Plastic Parts & Tool',
    '0635 Fineblanking',
    '0150 Terminals',
    '0610 Turning',
    '0710 Stamping',
    '0820 Connectors',
    '0910 Fasteners',
    '1020 Raw Materials',
];

export const SAMPLE_ARTICLES_LIST: ArticleItem[] = [
    {
        id: 'art-1',
        articleNumber: '10000100',
        description: 'ISOLIERSCHLAUCH',
        longText: null,
        cnCode: '39173200',
        category: '0340 Tube, Sleeve, Hose',
        createdAt: '21.08.2025',
        lastUpdated: '19.05.2026',
        budgetPrice: 12.5,
        netWeight: 3.5,
        netWeightUnit: 'G',
        costModel: 'Standard',
    },
    {
        id: 'art-2',
        articleNumber: '10000101',
        description: 'MAGNETGEHAEUSE',
        longText: null,
        cnCode: '85059090',
        category: '0640 Deep drawn',
        createdAt: '21.08.2025',
        lastUpdated: '19.05.2026',
        budgetPrice: 45.0,
        netWeight: null,
        netWeightUnit: 'KG',
        costModel: 'Custom Tooling',
    },
    {
        id: 'art-3',
        articleNumber: '10000102',
        description: 'SPULENKÖRPER 12V DNOX6.X',
        longText: null,
        cnCode: '39269097',
        category: '0510 Plastic Parts & Tool',
        createdAt: '21.08.2025',
        lastUpdated: '19.05.2026',
        budgetPrice: 8.75,
        netWeight: 5.5,
        netWeightUnit: 'G',
        costModel: 'Standard',
    },
    {
        id: 'art-4',
        articleNumber: '10000103',
        description: 'SPULENKOERPER 24V',
        longText: null,
        cnCode: '39269097',
        category: '0510 Plastic Parts & Tool',
        createdAt: '21.08.2025',
        lastUpdated: '19.05.2026',
        budgetPrice: 9.2,
        netWeight: 4,
        netWeightUnit: 'G',
        costModel: 'Standard',
    },
    {
        id: 'art-5',
        articleNumber: '10000104',
        description: 'SCHEIBE (WASHER) DNOX 6.X',
        longText: null,
        cnCode: '73182900',
        category: '0635 Fineblanking',
        createdAt: '21.08.2025',
        lastUpdated: '19.05.2026',
        budgetPrice: 2.15,
        netWeight: 11.083,
        netWeightUnit: 'G',
        costModel: 'Standard',
    },
    {
        id: 'art-6',
        articleNumber: '10000105',
        description: 'FLACHSTECKER',
        longText: null,
        cnCode: '73170090',
        category: '0150 Terminals',
        createdAt: '21.08.2025',
        lastUpdated: '19.05.2026',
        budgetPrice: 1.45,
        netWeight: 0.47,
        netWeightUnit: 'G',
        costModel: 'Standard',
    },
    {
        id: 'art-7',
        articleNumber: '10000107',
        description: 'BUCHSE DNOX 6.X',
        longText: null,
        cnCode: '73182900',
        category: '0610 Turning',
        createdAt: '21.08.2025',
        lastUpdated: '19.05.2026',
        budgetPrice: 14.3,
        netWeight: 5.44,
        netWeightUnit: 'G',
        costModel: 'Custom Tooling',
    },
    {
        id: 'art-8',
        articleNumber: '10000108',
        description: 'MAGNETTOPF',
        longText: null,
        cnCode: '85059030',
        category: '0610 Turning',
        createdAt: '21.08.2025',
        lastUpdated: '19.05.2026',
        budgetPrice: 18.0,
        netWeight: 3.13,
        netWeightUnit: 'G',
        costModel: 'Standard',
    },
    {
        id: 'art-9',
        articleNumber: '10000109',
        description: 'MESSERKONTAKT',
        longText: null,
        cnCode: '85366990',
        category: '0150 Terminals',
        createdAt: '21.08.2025',
        lastUpdated: '19.05.2026',
        budgetPrice: 3.6,
        netWeight: 0.53,
        netWeightUnit: 'G',
        costModel: 'Standard',
    },
    {
        id: 'art-10',
        articleNumber: '10000110',
        description: 'MESSERKONTAKT',
        longText: null,
        cnCode: '85366990',
        category: '0150 Terminals',
        createdAt: '21.08.2025',
        lastUpdated: '19.05.2026',
        budgetPrice: 3.6,
        netWeight: 0.53,
        netWeightUnit: 'G',
        costModel: 'Standard',
    },
    {
        id: 'art-11',
        articleNumber: '10000111',
        description: 'SCHWEISSRING KUPFER',
        longText: null,
        cnCode: '74152900',
        category: '0610 Turning',
        createdAt: '21.08.2025',
        lastUpdated: '19.05.2026',
        budgetPrice: 0.95,
        netWeight: 0.01,
        netWeightUnit: 'G',
        costModel: 'Standard',
    },
    {
        id: 'art-12',
        articleNumber: '10000112',
        description: 'SCHWEISSRING',
        longText: null,
        cnCode: '74152900',
        category: '0610 Turning',
        createdAt: '21.08.2025',
        lastUpdated: '19.05.2026',
        budgetPrice: 1.1,
        netWeight: 0.015,
        netWeightUnit: 'G',
        costModel: 'Standard',
    },
    {
        id: 'art-13',
        articleNumber: '10000113',
        description: 'MAGNETTOPF DMV 24',
        longText: null,
        cnCode: '84139100',
        category: '0610 Turning',
        createdAt: '21.08.2025',
        lastUpdated: '19.05.2026',
        budgetPrice: 22.4,
        netWeight: 4.82,
        netWeightUnit: 'G',
        costModel: 'Standard',
    },
    {
        id: 'art-14',
        articleNumber: '10000114',
        description: 'MAGNETTOPF DMV24 KD7N: ...',
        longText: null,
        cnCode: '84139100',
        category: '0610 Turning',
        createdAt: '21.08.2025',
        lastUpdated: '19.05.2026',
        budgetPrice: 24.0,
        netWeight: 4.82,
        netWeightUnit: 'G',
        costModel: 'Standard',
    },
    {
        id: 'art-15',
        articleNumber: '10000115',
        description: 'KONTAKTSTIFT KURZ',
        longText: null,
        cnCode: '85369095',
        category: '0150 Terminals',
        createdAt: '21.08.2025',
        lastUpdated: '19.05.2026',
        budgetPrice: 0.65,
        netWeight: 0.042,
        netWeightUnit: 'G',
        costModel: 'Standard',
    },
    {
        id: 'art-16',
        articleNumber: '10000116',
        description: 'KONTAKTSTIFT LANG',
        longText: null,
        cnCode: '73182900',
        category: '0610 Turning',
        createdAt: '21.08.2025',
        lastUpdated: '19.05.2026',
        budgetPrice: 0.85,
        netWeight: 0.798,
        netWeightUnit: 'G',
        costModel: 'Standard',
    },
];

export const SAMPLE_ARTICLES_FILTER_OPTIONS = SAMPLE_ARTICLES_LIST.map((a) => ({
    value: a.articleNumber,
    label: a.description ? `${a.articleNumber} ${a.description}` : a.articleNumber,
}));

export const WEIGHT_UNITS = ['G', 'KG', 'MG', 'LBS', 'OZ'];

