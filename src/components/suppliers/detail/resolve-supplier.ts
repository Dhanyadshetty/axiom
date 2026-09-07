import { MOCK_SUPPLIERS } from "@/components/suppliers/tacto/suppliers-mock-data";
import { PMA_SEED, PMA_SUPPLIER_ID, PMA_SUPPLIER_NAME } from "./pma-seed";
import type { CertValue } from "./certifications-block";

export interface SupplierDetail {
    id: string;
    supplierNumber: string;
    name: string;
    countryCode: string | null;
    countryName: string | null;
    city: string | null;
    website: string | null;
    supplierStatus: string | null;
    supplierType: string | null;
    areaOfNeed: string[];
    commodityGroup: string[];
    responsibleBuyer: string[];
    strategicClassification: string | null;
    abcClassification: string | null;
    orderVolume2025: number | null;
    notes: string;
    goals: string;
    aiSummary: string;
    transactionVolume: { year: number; volume: number }[];
    categoryVolume: { category: string; share: number }[];
    properties: Record<string, unknown>;
    tables: {
        investmentVolume: Array<Record<string, unknown>>;
        annualRevenue: Array<Record<string, unknown>>;
        numberOfEmployees: Array<Record<string, unknown>>;
        sites: Array<Record<string, unknown>>;
    };
    certificates: Record<string, CertValue | undefined>;
}

function getMockSupplier(idOrNumber: string) {
    return (
        MOCK_SUPPLIERS.find((s) => s.id === idOrNumber) ??
        MOCK_SUPPLIERS.find((s) => s.id === idOrNumber.replace(/[^0-9]/g, "")) ??
        null
    );
}

export function resolveSupplierDetail(idOrNumber: string): SupplierDetail | null {
    // 1) The seeded test Lieferant PMA supplier with full data
    if (
        idOrNumber === PMA_SUPPLIER_ID ||
        idOrNumber === "PMA-9001" ||
        idOrNumber.toLowerCase().includes("pma")
    ) {
        return {
            id: PMA_SUPPLIER_ID,
            supplierNumber: "PMA-9001",
            name: PMA_SUPPLIER_NAME,
            countryCode: "DE",
            countryName: "Germany",
            city: "Lossburg-Betzweiler",
            website: "www.prettl.com",
            supplierStatus: "Potential Supplier",
            supplierType: "Manufacturer",
            areaOfNeed: ["Direct"],
            commodityGroup: ["Precision Machined Parts"],
            responsibleBuyer: ["Anna Müller"],
            strategicClassification: "Preferred Supplier (P)",
            abcClassification: "A",
            orderVolume2025: 4_280_000,
            notes: "",
            goals: "",
            aiSummary: PMA_SEED.overview.aiSummary,
            transactionVolume: PMA_SEED.overview.transactionVolume,
            categoryVolume: PMA_SEED.overview.categoryVolume,
            properties: PMA_SEED.properties,
            tables: PMA_SEED.tables,
            certificates: PMA_SEED.certificates,
        };
    }

    // 2) Otherwise, use the existing mock data, with empty/default for everything else
    const mock = getMockSupplier(idOrNumber);
    if (!mock) {
    // Last-ditch: return a sparse placeholder so detail pages render
    return {
        id: idOrNumber,
        supplierNumber: idOrNumber,
        name: `Supplier ${idOrNumber}`,
        countryCode: null,
        countryName: null,
        city: null,
        website: null,
        supplierStatus: null,
        supplierType: null,
        areaOfNeed: [],
        commodityGroup: [],
        responsibleBuyer: [],
        strategicClassification: null,
        abcClassification: null,
        orderVolume2025: null,
        notes: "",
        goals: "",
        aiSummary: "",
        transactionVolume: [],
        categoryVolume: [],
        properties: {},
        tables: {
            investmentVolume: [],
            annualRevenue: [],
            numberOfEmployees: [],
            sites: [],
        },
        certificates: {},
    };
    }

    return {
        id: mock.id,
        supplierNumber: mock.id,
        name: mock.name,
        countryCode: mock.country,
        countryName: mock.country,
        city: null,
        website: null,
        supplierStatus: mock.supplierStatus,
        supplierType: mock.supplierType ?? null,
        areaOfNeed: mock.areaOfNeed ?? [],
        commodityGroup: mock.commodityGroup ? [mock.commodityGroup] : [],
        responsibleBuyer: mock.responsibleBuyer ? [mock.responsibleBuyer] : [],
        strategicClassification: mock.strategicClassification,
        abcClassification: mock.abcClassification,
        orderVolume2025: mock.orderVolume2025,
        notes: "",
        goals: "",
        aiSummary: "",
        transactionVolume: [],
        categoryVolume: [],
        properties: {},
        tables: {
            investmentVolume: [],
            annualRevenue: [],
            numberOfEmployees: [],
            sites: [],
        },
        certificates: {},
    };
}
