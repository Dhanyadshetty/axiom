import type { getSupplierWorkspaceRows } from "@/app/actions/suppliers";

export type SupplierTableRow = Awaited<ReturnType<typeof getSupplierWorkspaceRows>>[number];

export type SupplierColumnId =
    | "supplier"
    | "country"
    | "orderVolume2025"
    | "orderVolume2024"
    | "abc"
    | "status"
    | "supplierType"
    | "areaOfNeed"
    | "commodityGroup"
    | "responsibleBuyer"
    | "strategicClassification"
    | "lifecycle"
    | "riskScore"
    | "tier"
    | "city"
    | "contactEmail"
    | "certIso9001"
    | "certIso13485"
    | "certIso45001"
    | "certIso17025"
    | "certIso14001"
    | "certCodeOfConduct"
    | "certNda"
    | "reach"
    | "rohs"
    | "environments"
    | "chemicalSubstances"
    | "saferAlternatives"
    | "communicationControls"
    | "supplierCommunications"
    | "supplierRiskDetail"
    | "supplierFinancials"
    | "documents"
    | "contactPerson"

export interface ColumnDef {
    id: SupplierColumnId;
    label: string;
    width: number;
    align?: "left" | "right" | "center";
    sortable?: boolean;
    /** Computed columns are auto-derived and read-only (cannot be edited inline). */
    computed?: boolean;
    frozen?: boolean;
    /** Group used by the column visibility panel. */
    category: "core" | "classification" | "certificates" | "lifecycle" | "risk";
}

export const SUPPLIER_COLUMNS: Record<SupplierColumnId, ColumnDef> = {
    supplier: {
        id: "supplier",
        label: "Supplier",
        width: 280,
        align: "left",
        sortable: true,
        frozen: true,
        category: "core",
    },
    country: {
        id: "country",
        label: "Country",
        width: 180,
        align: "left",
        sortable: true,
        category: "core",
    },
    orderVolume2025: {
        id: "orderVolume2025",
        label: "Order Volume 2025",
        width: 160,
        align: "right",
        sortable: true,
        computed: true,
        category: "classification",
    },
    orderVolume2024: {
        id: "orderVolume2024",
        label: "Order Volume 2024",
        width: 160,
        align: "right",
        sortable: true,
        computed: true,
        category: "classification",
    },
    abc: {
        id: "abc",
        label: "ABC Classification Order Volume",
        width: 180,
        align: "center",
        sortable: true,
        computed: true,
        category: "classification",
    },
    status: {
        id: "status",
        label: "Supplier Status",
        width: 150,
        align: "left",
        sortable: true,
        category: "classification",
    },
    supplierType: {
        id: "supplierType",
        label: "Supplier Type",
        width: 170,
        align: "left",
        sortable: true,
        category: "classification",
    },
    areaOfNeed: {
        id: "areaOfNeed",
        label: "Area of Need",
        width: 200,
        align: "left",
        category: "classification",
    },
    commodityGroup: {
        id: "commodityGroup",
        label: "Commodity Group",
        width: 200,
        align: "left",
        category: "classification",
    },
    responsibleBuyer: {
        id: "responsibleBuyer",
        label: "Responsible Buyer",
        width: 200,
        align: "left",
        category: "classification",
    },
    strategicClassification: {
        id: "strategicClassification",
        label: "Strategic Classification",
        width: 200,
        align: "left",
        sortable: true,
        category: "classification",
    },
    lifecycle: {
        id: "lifecycle",
        label: "Lifecycle",
        width: 150,
        align: "left",
        sortable: true,
        category: "lifecycle",
    },
    riskScore: {
        id: "riskScore",
        label: "Risk Score",
        width: 120,
        align: "right",
        sortable: true,
        category: "risk",
    },
    tier: {
        id: "tier",
        label: "Tier",
        width: 120,
        align: "left",
        sortable: true,
        category: "lifecycle",
    },
    city: {
        id: "city",
        label: "City",
        width: 160,
        align: "left",
        sortable: true,
        category: "core",
    },
    contactEmail: {
        id: "contactEmail",
        label: "Contact Email",
        width: 240,
        align: "left",
        sortable: true,
        category: "core",
    },
    documents: {
        id: "documents",
        label: "Documents",
        width: 120,
        align: "center",
        category: "certificates",
    },
    certIso9001: {
        id: "certIso9001",
        label: "ISO 9001",
        width: 140,
        align: "center",
        category: "certificates",
    },
    certIso13485: {
        id: "certIso13485",
        label: "ISO 13485",
        width: 140,
        align: "center",
        category: "certificates",
    },
    certIso45001: {
        id: "certIso45001",
        label: "ISO 45001",
        width: 140,
        align: "center",
        category: "certificates",
    },
    certIso17025: {
        id: "certIso17025",
        label: "ISO 17025",
        width: 140,
        align: "center",
        category: "certificates",
    },
    certIso14001: {
        id: "certIso14001",
        label: "ISO 14001",
        width: 140,
        align: "center",
        category: "certificates",
    },
    certCodeOfConduct: {
        id: "certCodeOfConduct",
        label: "Code of Conduct",
        width: 200,
        align: "center",
        category: "certificates",
    },
    certNda: {
        id: "certNda",
        label: "NDA",
        width: 200,
        align: "center",
        category: "certificates",
    },
    reach: {
        id: "reach",
        label: "REACH",
        width: 120,
        align: "center",
        category: "certificates",
    },
    rohs: {
        id: "rohs",
        label: "RoHS",
        width: 120,
        align: "center",
        category: "certificates",
    },
    environments: {
        id: "environments",
        label: "Environments",
        width: 140,
        align: "center",
        category: "certificates",
    },
    chemicalSubstances: {
        id: "chemicalSubstances",
        label: "Chem. Substances",
        width: 160,
        align: "center",
        category: "certificates",
    },
    saferAlternatives: {
        id: "saferAlternatives",
        label: "Safer Alternatives",
        width: 160,
        align: "center",
        category: "certificates",
    },
    communicationControls: {
        id: "communicationControls",
        label: "Comm. Controls",
        width: 150,
        align: "center",
        category: "certificates",
    },
    supplierCommunications: {
        id: "supplierCommunications",
        label: "Supplier Comms",
        width: 150,
        align: "center",
        category: "certificates",
    },
    supplierRiskDetail: {
        id: "supplierRiskDetail",
        label: "Risk Detail",
        width: 140,
        align: "center",
        category: "risk",
    },
    supplierFinancials: {
        id: "supplierFinancials",
        label: "Financials",
        width: 140,
        align: "right",
        category: "risk",
    },
    contactPerson: {
        id: "contactPerson",
        label: "Contact Person",
        width: 200,
        align: "left",
        category: "core",
    }
};

export interface SupplierView {
    id: string;
    group: string;
    label: string;
    description: string;
    columns: SupplierColumnId[];
    preset?: (row: SupplierTableRow) => boolean;
    defaultSort?: { id: SupplierColumnId; dir: "asc" | "desc" };
}

const CLASSIFICATION_COLUMNS: SupplierColumnId[] = [
    "supplier",
    "country",
    "orderVolume2025",
    "orderVolume2024",
    "abc",
    "status",
    "supplierType",
    "areaOfNeed",
    "commodityGroup",
    "responsibleBuyer",
    "strategicClassification",
];

const CERTIFICATES_COLUMNS: SupplierColumnId[] = [
    "supplier",
    "country",
    "status",
    "commodityGroup",
    "riskScore",
    "abc",
    "contactEmail",
];

const ONBOARDING_COLUMNS: SupplierColumnId[] = [
    "supplier",
    "country",
    "lifecycle",
    "status",
    "supplierType",
    "responsibleBuyer",
    "strategicClassification",
];

const ESG_COLUMNS: SupplierColumnId[] = [
    "supplier",
    "country",
    "status",
    "commodityGroup",
    "areaOfNeed",
    "riskScore",
    "abc",
];

const RISK_COLUMNS: SupplierColumnId[] = [
    "supplier",
    "country",
    "riskScore",
    "status",
    "lifecycle",
    "tier",
    "strategicClassification",
];

export const SUPPLIER_VIEWS: SupplierView[] = [
    // 1. General Overviews
    {
        id: "classification",
        group: "1. General Overviews",
        label: "1.1 Classification",
        description: "Volume, ABC, and classification posture across the base.",
        columns: CLASSIFICATION_COLUMNS,
        defaultSort: { id: "orderVolume2025", dir: "desc" },
    },
    {
        id: "certificates",
        group: "1. General Overviews",
        label: "1.2 Certificates & Documents",
        description: "Suppliers grouped by certificate and document coverage.",
        columns: CERTIFICATES_COLUMNS,
    },
    // 2. Onboarding
    {
        id: "potential-suppliers",
        group: "2. Onboarding",
        label: "2.1 Potential Suppliers",
        description: "Suppliers with status Potential Supplier.",
        columns: ONBOARDING_COLUMNS,
        preset: (row: any) => row.status === "potential",
    },
    {
        id: "in-qualification",
        group: "2. Onboarding",
        label: "2.2 In qualification",
        description: "Suppliers in evaluation process.",
        columns: ONBOARDING_COLUMNS,
        preset: (row: any) => row.status === "evaluation",
    },
    {
        id: "onboarded-suppliers",
        group: "2. Onboarding",
        label: "2.3 Onboarded Suppliers",
        description: "Fully onboarded suppliers.",
        columns: ONBOARDING_COLUMNS,
        preset: (row: any) => row.status === "onboarded",
    },
    {
        id: "rejected-suppliers",
        group: "2. Onboarding",
        label: "2.4 Rejected Suppliers",
        description: "Suppliers that were rejected.",
        columns: ONBOARDING_COLUMNS,
        preset: (row: any) => row.status === "rejected",
    },
    // 3. Article-Conformity
    {
        id: "reach",
        group: "3. Article-Conformity",
        label: "3.1 REACH",
        description: "REACH conformity overview across suppliers.",
        columns: ESG_COLUMNS,
        preset: (row: any) => {
        const hasChemicalCommodity = row.commodityGroup?.some((c: any) => typeof c === "string" && c.toLowerCase().includes("chemical"));
        const hasChemicalAreaOfNeed = row.areaOfNeed?.some((a: any) => typeof a === "string" && a.toLowerCase().includes("chemical"));
        return (hasChemicalCommodity ?? false) || (hasChemicalAreaOfNeed ?? false);
    },
    },
    // 4. ESG Management
    {
        id: "risk-development",
        group: "4. ESG Management",
        label: "4.1 Risk Development",
        description: "ESG risk development and management.",
        columns: RISK_COLUMNS,
    },
    {
        id: "suspicious-suppliers",
        group: "4. ESG Management",
        label: "4.2 Suspicious Suppliers",
        description: "Suspicious supplier tracking.",
        columns: RISK_COLUMNS,
        preset: (row) => (row.riskScore ?? 0) >= 60,
    },
    {
        id: "public-incidents",
        group: "4. ESG Management",
        label: "4.3 Public Incidents",
        description: "Public incidents and critical risk suppliers.",
        columns: RISK_COLUMNS,
        preset: (row) => (row.riskScore ?? 0) >= 75,
    },
    // 5. ESG Risk Analysis
    {
        id: "esg-risk-overview",
        group: "5. ESG Risk Analysis",
        label: "5.1 Overview",
        description: "Risk-ranked supplier base overview.",
        columns: RISK_COLUMNS,
        defaultSort: { id: "riskScore", dir: "desc" },
    },
    {
        id: "mitigation-factors",
        group: "5. ESG Risk Analysis",
        label: "5.2 Mitigation Factors & Appropriateness",
        description: "High risk suppliers with mitigation factors.",
        columns: RISK_COLUMNS,
        preset: (row) => (row.riskScore ?? 0) >= 60,
        defaultSort: { id: "riskScore", dir: "desc" },
    },
    {
        id: "supplier-self-assessment",
        group: "5. ESG Risk Analysis",
        label: "5.3 Supplier Self-Assessment",
        description: "Watchlist suppliers and self-assessment status.",
        columns: RISK_COLUMNS,
        preset: (row) => (row.riskScore ?? 0) >= 60 || (row.trustScore ?? 0) < 55,
        defaultSort: { id: "riskScore", dir: "desc" },
    },
    {
        id: "own-business-area",
        group: "5. ESG Risk Analysis",
        label: "5.4 Own Business Area",
        description: "Suppliers with critical incidents by business area.",
        columns: RISK_COLUMNS,
        preset: (row) => (row.riskScore ?? 0) >= 75,
        defaultSort: { id: "riskScore", dir: "desc" },
    },
];

export function getView(viewId: string): SupplierView {
    return SUPPLIER_VIEWS.find((view) => view.id === viewId) ?? SUPPLIER_VIEWS[0];
}

export function getViewGroups(): Array<{ group: string; views: SupplierView[] }> {
    const map = new Map<string, SupplierView[]>();
    for (const view of SUPPLIER_VIEWS) {
        const list = map.get(view.group) ?? [];
        list.push(view);
        map.set(view.group, list);
    }
    return Array.from(map.entries()).map(([group, views]) => ({ group, views }));
}
