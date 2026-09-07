import type { Supplier as GridSupplier, SupplierStatus } from "./tacto/suppliers-model";

type DbSupplierRow = {
    id: string;
    name: string;
    supplierNumber?: string | null;
    countryCode?: string | null;
    city?: string | null;
    status?: string | null;
    supplierType?: string | null;
    areaOfNeed?: string[] | null;
    commodityGroup?: string[] | null;
    responsibleBuyer?: string[] | null;
    strategicClassification?: string | null;
    lifecycleStatus?: string | null;
    tierLevel?: string | null;
    abcClassification?: string | null;
    currentYearVolume?: number | null;
    previousYearVolume?: number | null;
};

const NON_EXISTENT = "Non-existent" as const;

type DbAbcValue = "A" | "B" | "C" | "X" | "Y" | "Z" | "None" | string;

function mapAbcClass(value: DbAbcValue | null | undefined): "A" | "B" | "C" {
    const upper = (value ?? "").toString().toUpperCase();
    if (upper === "A") return "A";
    if (upper === "B") return "B";
    if (upper === "C") return "C";
    return "C";
}

function mapSupplierStatus(value: string | null | undefined): SupplierStatus {
    const v = (value ?? "active").toLowerCase();
    if (v === "active") return "Active";
    if (v === "inactive") return "Potential Supplier";
    if (v === "blacklisted") return "Rejected Supplier";
    if (v === "prospect") return "Potential Supplier";
    return "Potential Supplier";
}

export function dbRowToGridSupplier(row: DbSupplierRow): GridSupplier {
    const buyerList = (row.responsibleBuyer ?? []).filter(Boolean);
    const buyer = buyerList.join(", ");
    const areaList = row.areaOfNeed ?? [];
    const commodity = (row.commodityGroup ?? []).join(", ");

    return {
        id: row.id,
        name: row.name,
        supplierNumber: row.supplierNumber ?? undefined,
        country: (row.countryCode ?? "").toLowerCase(),
        isicCode: "",
        internal: false,
        supplierStatus: mapSupplierStatus(row.status),
        responsibleBuyer: buyer,
        supplierType: row.supplierType ?? undefined,
        areaOfNeed: areaList,
        commodityGroup: commodity,
        strategicClassification: row.strategicClassification ?? "",
        abcClassification: mapAbcClass(row.abcClassification),
        orderVolume2025: Number(row.currentYearVolume ?? 0),
        orderVolume2024: Number(row.previousYearVolume ?? 0),
        supplierSpend: Number(row.currentYearVolume ?? 0),
        ssaSent: false,
        ssaReceived: false,
        ssaCompleted: false,
        supplierCreatedIn: false,
        certificates: {
            iso9001: NON_EXISTENT,
            iso13485: NON_EXISTENT,
            iso45001: NON_EXISTENT,
            iso17025: NON_EXISTENT,
            codeOfConduct: NON_EXISTENT,
            nda: NON_EXISTENT,
            iso14001: NON_EXISTENT,
        },
        reach: { relevance: false, affected: "", notes: "", supplierSpecificNote: "" },
        rohs: { relevance: false, affected: "", note: "", supplierSpecificNote: "" },
        esg: {
            analysisProgress: "Waiting for SSA",
            riskStatus: "Unknown",
            riskStatusLast: "Unknown",
            concreteRisk: "",
            humanRights: "",
            workersRights: "",
            environmental: "",
            existingKnowledge: "",
        },
        ownBusinessArea: {
            analysisProgress: "",
            riskStatus: "",
            implementation1: "",
            implementation2: "",
            implementation3: "",
            contactPerson: "",
        },
        publicIncidents: [],
    };
}