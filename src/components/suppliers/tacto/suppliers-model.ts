"use client";

import * as React from "react";
import { useState, useMemo, useCallback } from "react";
import { ChevronDown, Inbox, ArrowUp, ArrowDown, ChevronsUpDown, Check, Plus, Search, X, RotateCcw, Flag, Users, Building, Globe, FileText, Shield, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/currency";
import { flagEmoji, countryName } from "@/lib/utils/countryFlags";

// ---------------------------------------------------------------------------
// Types - Based on the specified data model
// ---------------------------------------------------------------------------

export type CertificateState = "Existent" | "Non-existent";

export type SupplierStatus = 
    | "Potential Supplier"
    | "Evaluation Process" 
    | "Active"
    | "Rejected Supplier";

export type AbcClass = "A" | "B" | "C";

export type EsgAnalysisProgress = "Waiting for SSA" | "In progress" | "Completed";

export type EsgRiskStatus = 
    | "Unknown"
    | "Low risk" 
    | "Medium risk"
    | "High risk";

export type IncidentStatus = "Violation confirmed" | "Potential discrepancy" | "Cleared";

export interface Supplier {
    id: string;
    name: string;
    supplierNumber?: string;
    country: string;
    isicCode: string;
    internal: boolean;
    supplierStatus: SupplierStatus;
    responsibleBuyer: string;
    supplierType?: string;
    areaOfNeed?: string[];
    commodityGroup: string;
    strategicClassification: string;
    abcClassification: AbcClass;
    orderVolume2025: number;
    orderVolume2024: number;
    supplierSpend: number;
    ssaSent: boolean;
    ssaReceived: boolean;
    ssaCompleted: boolean;
    supplierCreatedIn: boolean;
    certificates: {
        iso9001: CertificateState;
        iso13485: CertificateState;
        iso45001: CertificateState;
        iso17025: CertificateState;
        iso14001: CertificateState;
        codeOfConduct: CertificateState;
        nda: CertificateState;
    };
    reach: {
        relevance: boolean;
        affected: string;
        notes: string;
        supplierSpecificNote: string;
    };
    rohs: {
        relevance: boolean;
        affected: string;
        note: string;
        supplierSpecificNote: string;
    };
    esg: {
        analysisProgress: EsgAnalysisProgress;
        riskStatus: EsgRiskStatus;
        riskStatusLast: EsgRiskStatus;
        concreteRisk: string;
        humanRights: string;
        workersRights: string;
        environmental: string;
        existingKnowledge: string;
    };
    ownBusinessArea: {
        analysisProgress: string;
        riskStatus: string;
        implementation1: string;
        implementation2: string;
        implementation3: string;
        contactPerson: string;
    };
    publicIncidents: Array<{
        status: IncidentStatus;
        category: string;
        briefJustification: string;
        sources: string;
    }>;
}

export type ColumnId = 
    | "supplier"
    | "supplierId"
    | "supplierName"
    | "country"
    | "isicCode"
    | "internal"
    | "orderVolume2025"
    | "orderVolume2024"
    | "abc"
    | "status"
    | "supplierType"
    | "areaOfNeed"
    | "commodityGroup"
    | "responsibleBuyer"
    | "strategicClassification"
    | "certIso9001"
    | "certIso13485"
    | "certIso45001"
    | "certIso17025"
    | "certCodeOfConduct"
    | "certNda"
    | "certIso14001"
    | "ssaSent"
    | "ssaReceived"
    | "ssaCompleted"
    | "supplierCreatedIn"
    | "reachRelevance"
    | "reachAffected"
    | "reachNotes"
    | "reachSupplierSpecific"
    | "rohsRelevance"
    | "rohsAffected"
    | "rohsNote"
    | "rohsSupplierSpecific"
    | "esgAnalysisProgress"
    | "esgRiskStatus"
    | "concreteRisk"
    | "humanRights"
    | "workersRights"
    | "environmental"
    | "existingKnowledge"
    | "incidentStatus"
    | "incidentCategory"
    | "incidentJustification"
    | "incidentSources"
    | "egbAnalysisProgress"
    | "egbRiskStatus"
    | "egbImplementation1"
    | "egbImplementation2"
    | "egbImplementation3"
    | "contactPerson";

export interface ColumnDef {
    id: ColumnId;
    label: string;
    width: number;
    type: string;
    align?: "left" | "right" | "center";
    defaultHidden?: boolean;
}

export const SUPPLIER_COLUMNS: Record<ColumnId, ColumnDef> = {
    supplier: { id: "supplier", label: "Supplier", width: 300, type: "text" },
    supplierId: { id: "supplierId", label: "Supplier ID", width: 130, type: "text" },
    supplierName: { id: "supplierName", label: "Supplier Name", width: 240, type: "text" },
    country: { id: "country", label: "Country", width: 190, type: "country" },
    isicCode: { id: "isicCode", label: "ISIC Code", width: 140, type: "text" },
    internal: { id: "internal", label: "Internal", width: 120, type: "boolean", align: "center" },
    orderVolume2025: { id: "orderVolume2025", label: "Order Volume 2025", width: 170, type: "currency", align: "right" },
    orderVolume2024: { id: "orderVolume2024", label: "Order Volume 2024", width: 170, type: "currency", align: "right" },
    abc: { id: "abc", label: "ABC Classification Order", width: 130, type: "abc", align: "center" },
    status: { id: "status", label: "Supplier Status", width: 180, type: "statusPill" },
    commodityGroup: { id: "commodityGroup", label: "Commodity Group", width: 180, type: "text" },
    responsibleBuyer: { id: "responsibleBuyer", label: "Responsible Buyer", width: 200, type: "buyer" },
    strategicClassification: { id: "strategicClassification", label: "Strategic Classification (Prettl…)", width: 220, type: "strategicPill" },
    supplierType: { id: "supplierType", label: "Supplier Type", width: 160, type: "text" },
    areaOfNeed: { id: "areaOfNeed", label: "Area of Need", width: 180, type: "text" },
    certIso9001: { id: "certIso9001", label: "ISO 9001", width: 140, type: "certificate", align: "center" },
    certIso13485: { id: "certIso13485", label: "ISO 13485", width: 140, type: "certificate", align: "center" },
    certIso45001: { id: "certIso45001", label: "ISO 45001", width: 140, type: "certificate", align: "center" },
    certIso17025: { id: "certIso17025", label: "ISO 17025", width: 140, type: "certificate", align: "center" },
    certCodeOfConduct: { id: "certCodeOfConduct", label: "Verhaltenskodex (Code of Conduct)", width: 200, type: "certificate", align: "center" },
    certNda: { id: "certNda", label: "Vertraulichkeitsvereinbarung (NDA)", width: 200, type: "certificate", align: "center" },
    certIso14001: { id: "certIso14001", label: "ISO 14001", width: 140, type: "certificate", align: "center", defaultHidden: true },
    ssaSent: { id: "ssaSent", label: "SSA sent", width: 120, type: "boolean", align: "center" },
    ssaReceived: { id: "ssaReceived", label: "SSA received", width: 130, type: "boolean", align: "center" },
    ssaCompleted: { id: "ssaCompleted", label: "SSA completed", width: 130, type: "boolean", align: "center" },
    supplierCreatedIn: { id: "supplierCreatedIn", label: "Supplier created in …", width: 160, type: "boolean", align: "center" },
    reachRelevance: { id: "reachRelevance", label: "REACH relevance", width: 150, type: "boolean", align: "center" },
    reachAffected: { id: "reachAffected", label: "REACH affected", width: 160, type: "text" },
    reachNotes: { id: "reachNotes", label: "REACH Notes", width: 200, type: "text" },
    reachSupplierSpecific: { id: "reachSupplierSpecific", label: "Supplier specific note (REACH)", width: 200, type: "text" },
    rohsRelevance: { id: "rohsRelevance", label: "RoHS relevance", width: 150, type: "boolean", align: "center" },
    rohsAffected: { id: "rohsAffected", label: "RoHS affected", width: 160, type: "text" },
    rohsNote: { id: "rohsNote", label: "RoHS Note", width: 200, type: "text" },
    rohsSupplierSpecific: { id: "rohsSupplierSpecific", label: "Supplier specific note (RoHS)", width: 200, type: "text" },
    esgAnalysisProgress: { id: "esgAnalysisProgress", label: "ESG Analysis Progress", width: 180, type: "pill" },
    esgRiskStatus: { id: "esgRiskStatus", label: "ESG Risk Status", width: 160, type: "pill" },
    concreteRisk: { id: "concreteRisk", label: "Concrete Risk", width: 200, type: "text" },
    humanRights: { id: "humanRights", label: "Human Rights", width: 160, type: "text" },
    workersRights: { id: "workersRights", label: "Workers Rights", width: 160, type: "text" },
    environmental: { id: "environmental", label: "Environmental", width: 160, type: "text" },
    existingKnowledge: { id: "existingKnowledge", label: "Existing Knowledge & Expertise", width: 220, type: "text" },
    incidentStatus: { id: "incidentStatus", label: "Status", width: 200, type: "pill" },
    incidentCategory: { id: "incidentCategory", label: "Category", width: 180, type: "text" },
    incidentJustification: { id: "incidentJustification", label: "Brief justification", width: 240, type: "text" },
    incidentSources: { id: "incidentSources", label: "Sources", width: 200, type: "text" },
    egbAnalysisProgress: { id: "egbAnalysisProgress", label: "Analysis progress (EGB)", width: 200, type: "pill" },
    egbRiskStatus: { id: "egbRiskStatus", label: "Risk Status (EGB)", width: 180, type: "pill" },
    egbImplementation1: { id: "egbImplementation1", label: "Implementation…", width: 180, type: "text" },
    egbImplementation2: { id: "egbImplementation2", label: "Implementation…", width: 180, type: "text" },
    egbImplementation3: { id: "egbImplementation3", label: "Implementation…", width: 180, type: "text" },
    contactPerson: { id: "contactPerson", label: "Contact Person", width: 200, type: "text" },
};

export type FilterFieldKey =
    | "supplierId"
    | "supplierName"
    | "country"
    | "orderVolume2025"
    | "orderVolume2024"
    | "abcClassification"
    | "supplierStatus"
    | "supplierType"
    | "areaOfNeed"
    | "commodityGroup"
    | "responsibleBuyer"
    | "ssaCompleted"
    | "supplierCreatedIn"
    | "reachRelevance"
    | "rohsRelevance"
    | "esgRiskStatus"
    | "esgRiskStatusLast"
    | "esgAnalysisProgress"
    | "incidentStatus"
    | "internal"
    | "supplierSpend";

export type RawValue = string | number | boolean | string[] | null;

export const FILTER_FIELD_LABELS: Record<FilterFieldKey, string> = {
    supplierId: "Supplier ID",
    supplierName: "Supplier Name",
    country: "Country",
    orderVolume2025: "Order Volume 2025",
    orderVolume2024: "Order Volume 2024",
    abcClassification: "ABC Classification Order Volume",
    supplierStatus: "Supplier Status",
    supplierType: "Supplier Type",
    areaOfNeed: "Area of Need",
    commodityGroup: "Commodity Group",
    responsibleBuyer: "Responsible Buyer",
    ssaCompleted: "SSA completed",
    supplierCreatedIn: "Supplier created in …",
    reachRelevance: "REACH relevance",
    rohsRelevance: "RoHS relevance",
    esgRiskStatus: "ESG Risk Status",
    esgRiskStatusLast: "ESG Risk Status (last…)",
    esgAnalysisProgress: "ESG Analysis Progress",
    incidentStatus: "Status",
    internal: "Internal",
    supplierSpend: "Supplier spend",
};

export const FILTER_FIELD_KIND: Record<FilterFieldKey, "text" | "categorical" | "boolean" | "number" | "country"> = {
    supplierId: "text",
    supplierName: "text",
    country: "country",
    orderVolume2025: "number",
    orderVolume2024: "number",
    abcClassification: "categorical",
    supplierStatus: "categorical",
    supplierType: "categorical",
    areaOfNeed: "categorical",
    commodityGroup: "categorical",
    responsibleBuyer: "categorical",
    ssaCompleted: "boolean",
    supplierCreatedIn: "boolean",
    reachRelevance: "boolean",
    rohsRelevance: "boolean",
    esgRiskStatus: "categorical",
    esgRiskStatusLast: "categorical",
    esgAnalysisProgress: "categorical",
    incidentStatus: "categorical",
    internal: "boolean",
    supplierSpend: "number",
};

export const FILTER_FIELD_OPTIONS: Partial<Record<FilterFieldKey, string[]>> = {
    abcClassification: ["A", "B", "C"],
    supplierStatus: ["Potential Supplier", "Evaluation Process", "Active", "Rejected Supplier"],
    supplierType: ["Manufacturer", "Distributor", "Service Provider", "Wholesaler"],
    areaOfNeed: ["Production", "Logistics", "R&D", "Tooling", "Packaging"],
    commodityGroup: [
        "Machined Components",
        "Raw Steel",
        "Injection Molding",
        "Forgings",
        "Electronics",
        "Optics",
        "Tooling",
        "Connectors",
        "Harness",
        "Turned Parts",
        "Polymers",
    ],
    responsibleBuyer: [
        "Mareike Brandt",
        "Tobias Keller",
        "Aiko Tanaka",
        "Ravi Menon",
        "Marco Rossi",
        "Internal Plant",
    ],
    esgRiskStatus: ["Unknown", "Low risk", "Medium risk", "High risk"],
    esgRiskStatusLast: ["Unknown", "Low risk", "Medium risk", "High risk"],
    esgAnalysisProgress: ["Waiting for SSA", "In progress", "Completed"],
    incidentStatus: ["Violation confirmed", "Potential discrepancy", "Cleared"],
};

export function getFieldValue(supplier: Supplier, key: FilterFieldKey): RawValue {
    switch (key) {
        case "supplierId":
            return supplier.id;
        case "supplierName":
            return supplier.name;
        case "country":
            return supplier.country;
        case "orderVolume2025":
            return supplier.orderVolume2025;
        case "orderVolume2024":
            return supplier.orderVolume2024;
        case "abcClassification":
            return supplier.abcClassification;
        case "supplierStatus":
            return supplier.supplierStatus;
        case "supplierType":
            return supplier.supplierType ?? "";
        case "areaOfNeed":
            return supplier.areaOfNeed ?? [];
        case "commodityGroup":
            return supplier.commodityGroup;
        case "responsibleBuyer":
            return supplier.responsibleBuyer;
        case "ssaCompleted":
            return supplier.ssaCompleted;
        case "supplierCreatedIn":
            return supplier.supplierCreatedIn;
        case "reachRelevance":
            return supplier.reach.relevance;
        case "rohsRelevance":
            return supplier.rohs.relevance;
        case "esgRiskStatus":
            return supplier.esg.riskStatus;
        case "esgRiskStatusLast":
            return supplier.esg.riskStatusLast;
        case "esgAnalysisProgress":
            return supplier.esg.analysisProgress;
        case "incidentStatus": {
            const first = supplier.publicIncidents[0];
            return first ? first.status : "";
        }
        case "internal":
            return supplier.internal;
        case "supplierSpend":
            return supplier.supplierSpend;
        default:
            return null;
    }
}

export type FilterOperator =
    | "is_one_of"
    | "is_none_of"
    | "equals"
    | "not_equals"
    | "contains"
    | "gte"
    | "lte"
    | "is_blank"
    | "is_not_blank";

export const OPERATOR_LABELS: Record<FilterOperator, string> = {
    is_one_of: "is one of",
    is_none_of: "is none of",
    equals: "equals",
    not_equals: "does not equal",
    contains: "contains",
    gte: "greater than or equal to",
    lte: "less than or equal to",
    is_blank: "is empty",
    is_not_blank: "is not empty",
};

export const OPERATORS_BY_KIND: Record<string, FilterOperator[]> = {
    text: ["contains", "equals", "not_equals", "is_blank", "is_not_blank"],
    categorical: ["is_one_of", "is_none_of", "equals", "is_blank", "is_not_blank"],
    country: ["is_one_of", "is_none_of", "is_blank", "is_not_blank"],
    boolean: ["equals", "is_blank", "is_not_blank"],
    number: ["equals", "gte", "lte", "is_blank", "is_not_blank"],
};

export interface FilterRule {
    field: FilterFieldKey;
    operator: FilterOperator;
    value: RawValue;
    connector: "and" | "or";
}

export function createFilter(
    field: FilterFieldKey,
    operator: FilterOperator,
    value: RawValue,
    connector: "and" | "or" = "and"
): FilterRule {
    return { field, operator, value, connector };
}

export interface SupplierView {
    id: string;
    group: string;
    label: string;
    columns: ColumnId[];
    filters: FilterRule[];
    defaultSort?: { id: ColumnId; dir: "asc" | "desc" };
    hasReset?: boolean;
}

export const SUPPLIER_VIEWS: SupplierView[] = [
    // 1. General Overviews
    {
        id: "classification",
        group: "1. General Overviews",
        label: "1.1 Classification",
        columns: [
            "supplierId",
            "supplierName",
            "country",
            "orderVolume2025",
            "orderVolume2024",
            "abc",
            "status",
            "supplierType",
            "areaOfNeed",
            "commodityGroup",
            "responsibleBuyer",
        ],
        filters: [],
        defaultSort: { id: "orderVolume2024", dir: "desc" },
        hasReset: true,
    },
    {
        id: "certificates",
        group: "1. General Overviews",
        label: "1.2 Certificates & Documents",
        columns: [
            "supplier",
            "certIso9001",
            "certIso13485",
            "certIso45001",
            "certIso17025",
            "certCodeOfConduct",
            "certNda",
            "certIso14001",
        ],
        filters: [],
        defaultSort: { id: "supplier", dir: "asc" },
        hasReset: true,
    },
    // 2. Onboarding
    {
        id: "potential-suppliers",
        group: "2. Onboarding",
        label: "2.1 Potential Suppliers",
        columns: ["supplier", "country", "status", "responsibleBuyer", "ssaSent"],
        filters: [createFilter("supplierStatus", "is_one_of", ["Potential Supplier"])],
        defaultSort: { id: "supplier", dir: "asc" },
    },
    {
        id: "in-qualification",
        group: "2. Onboarding",
        label: "2.2 In qualification",
        columns: ["supplier", "country", "status", "responsibleBuyer", "ssaReceived", "commodityGroup"],
        filters: [createFilter("supplierStatus", "is_one_of", ["Evaluation Process"])],
        defaultSort: { id: "supplier", dir: "asc" },
    },
    {
        id: "onboarded-suppliers",
        group: "2. Onboarding",
        label: "2.3 Onboarded Suppliers",
        columns: ["supplier", "status", "commodityGroup", "responsibleBuyer", "ssaCompleted", "supplierCreatedIn"],
        filters: [
            createFilter("supplierStatus", "is_one_of", ["Active"]),
            createFilter("ssaCompleted", "equals", true),
            createFilter("supplierCreatedIn", "equals", true),
        ],
        defaultSort: { id: "status", dir: "asc" },
    },
    {
        id: "rejected-suppliers",
        group: "2. Onboarding",
        label: "2.4 Rejected Suppliers",
        columns: ["supplier", "responsibleBuyer", "status", "commodityGroup"],
        filters: [createFilter("supplierStatus", "is_one_of", ["Rejected Supplier"])],
        defaultSort: { id: "supplier", dir: "asc" },
    },
    // 3. Article-Conformity
    {
        id: "reach",
        group: "3. Article-Conformity",
        label: "3.1 REACH",
        columns: [
            "supplier",
            "country",
            "reachRelevance",
            "reachAffected",
            "reachNotes",
            "reachSupplierSpecific",
        ],
        filters: [createFilter("reachRelevance", "equals", true)],
        defaultSort: { id: "supplier", dir: "asc" },
    },
    {
        id: "rohs",
        group: "3. Article-Conformity",
        label: "3.2 RoHS",
        columns: ["supplier", "country", "rohsRelevance", "rohsSupplierSpecific", "rohsAffected", "rohsNote"],
        filters: [createFilter("rohsRelevance", "equals", true)],
        defaultSort: { id: "supplier", dir: "asc" },
    },
    // 4. ESG Management
    {
        id: "risk-development",
        group: "4. ESG Management",
        label: "4.1 Risk Development",
        columns: ["supplier", "esgAnalysisProgress", "esgRiskStatus"],
        filters: [
            createFilter("esgRiskStatus", "is_none_of", [""], "or"),
            createFilter("esgRiskStatusLast", "is_none_of", [""], "or"),
        ],
        defaultSort: { id: "supplier", dir: "asc" },
    },
    {
        id: "suspicious-suppliers",
        group: "4. ESG Management",
        label: "4.2 Suspicious Suppliers",
        columns: [
            "supplier",
            "esgRiskStatus",
            "concreteRisk",
            "humanRights",
            "workersRights",
            "environmental",
            "existingKnowledge",
        ],
        filters: [
            createFilter("esgRiskStatus", "is_one_of", ["High risk", "Medium risk"], "or"),
            createFilter("esgRiskStatusLast", "is_one_of", ["High risk", "Medium risk"], "or"),
            createFilter("esgAnalysisProgress", "is_one_of", ["Completed"]),
        ],
        defaultSort: { id: "supplier", dir: "asc" },
    },
    {
        id: "public-incidents",
        group: "4. ESG Management",
        label: "4.3 Public Incidents",
        columns: ["supplier", "incidentStatus", "incidentCategory", "incidentJustification", "incidentSources"],
        filters: [createFilter("incidentStatus", "is_one_of", ["Violation confirmed", "Potential discrepancy"])],
        defaultSort: { id: "incidentStatus", dir: "desc" },
    },
    // 5. ESG Risk Analysis
    {
        id: "overview",
        group: "5. ESG Risk Analysis",
        label: "5.1 Overview",
        columns: ["supplier", "country", "isicCode", "esgRiskStatus", "esgAnalysisProgress"],
        filters: [
            createFilter("internal", "is_blank", null),
            createFilter("supplierSpend", "gte", 10000),
        ],
        defaultSort: { id: "esgAnalysisProgress", dir: "asc" },
    },
    {
        id: "mitigation-factors",
        group: "5. ESG Risk Analysis",
        label: "5.2 Mitigation Factors & Appropriateness",
        columns: [
            "supplier",
            "country",
            "esgRiskStatus",
            "concreteRisk",
            "humanRights",
            "workersRights",
            "environmental",
        ],
        filters: [
            createFilter("esgAnalysisProgress", "is_one_of", ["In progress"]),
            createFilter("esgRiskStatus", "is_none_of", ["Unknown"]),
        ],
        defaultSort: { id: "esgRiskStatus", dir: "asc" },
    },
    {
        id: "supplier-self-assessment",
        group: "5. ESG Risk Analysis",
        label: "5.3 Supplier Self-Assessment",
        columns: ["supplier", "country", "esgRiskStatus", "humanRights", "workersRights", "environmental"],
        filters: [createFilter("esgAnalysisProgress", "is_one_of", ["Waiting for SSA"])],
        defaultSort: { id: "supplier", dir: "asc" },
    },
    {
        id: "own-business-area",
        group: "5. ESG Risk Analysis",
        label: "5.4 Own Business Area",
        columns: [
            "supplier",
            "egbAnalysisProgress",
            "egbRiskStatus",
            "egbImplementation1",
            "egbImplementation2",
            "egbImplementation3",
            "contactPerson",
        ],
        filters: [createFilter("internal", "equals", true)],
        defaultSort: { id: "supplier", dir: "asc" },
    },
];

export function getView(viewId: string): SupplierView {
    return SUPPLIER_VIEWS.find((view) => view.id === viewId) ?? SUPPLIER_VIEWS[0];
}

export interface NavGroup {
    group: string;
    views: SupplierView[];
}

export function getNavGroups(): NavGroup[] {
    const map = new Map<string, SupplierView[]>();
    for (const view of SUPPLIER_VIEWS) {
        const list = map.get(view.group) ?? [];
        list.push(view);
        map.set(view.group, list);
    }
    return Array.from(map.entries()).map(([group, views]) => ({ group, views }));
}

// ---------------------------------------------------------------------------
// Mock Data - 15+ sample suppliers covering all fields
// ---------------------------------------------------------------------------

export const MOCK_SUPPLIERS: Supplier[] = [
    // ---- Active, fully onboarded, non-internal, high spend (views 1.1/5.1/2.3) ----
    {
        id: "702478",
        name: "Helios Präzisionsteile GmbH",
        country: "DE",
        isicCode: "2599",
        internal: false,
        supplierStatus: "Active",
        responsibleBuyer: "Mareike Brandt",
        commodityGroup: "Machined Components",
        strategicClassification: "Preferred Supplier (P)",
        abcClassification: "A",
        orderVolume2025: 4820000,
        orderVolume2024: 4150000,
        supplierSpend: 4820000,
        ssaSent: true,
        ssaReceived: true,
        ssaCompleted: true,
        supplierCreatedIn: true,
        certificates: {
            iso9001: "Existent",
            iso13485: "Non-existent",
            iso45001: "Non-existent",
            iso17025: "Non-existent",
            codeOfConduct: "Existent",
            nda: "Existent",
            iso14001: "Non-existent",
        },
        reach: {
            relevance: true,
            affected: "SVHC candidate list < 0.1%",
            notes: "Declared",
            supplierSpecificNote: "No article-level risk",
        },
        rohs: {
            relevance: true,
            affected: "Compliant",
            note: "RoHS 3",
            supplierSpecificNote: "No exemptions used",
        },
        esg: {
            analysisProgress: "Completed",
            riskStatus: "Low risk",
            riskStatusLast: "Low risk",
            concreteRisk: "None identified",
            humanRights: "Audited",
            workersRights: "Audited",
            environmental: "ISO 50001 planned",
            existingKnowledge: "2 prior assessments",
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
    },
    {
        id: "702491",
        name: "Nordpol Stahl AG",
        country: "DE",
        isicCode: "2410",
        internal: false,
        supplierStatus: "Active",
        responsibleBuyer: "Tobias Keller",
        commodityGroup: "Raw Steel",
        strategicClassification: "Strategic Supplier (S)",
        abcClassification: "A",
        orderVolume2025: 6150000,
        orderVolume2024: 5900000,
        supplierSpend: 6150000,
        ssaSent: true,
        ssaReceived: true,
        ssaCompleted: true,
        supplierCreatedIn: true,
        certificates: {
            iso9001: "Existent",
            iso13485: "Existent",
            iso45001: "Non-existent",
            iso17025: "Non-existent",
            codeOfConduct: "Existent",
            nda: "Non-existent",
            iso14001: "Non-existent",
        },
        reach: {
            relevance: true,
            affected: "Substance declared",
            notes: "In progress",
            supplierSpecificNote: "",
        },
        rohs: {
            relevance: true,
            affected: "Compliant",
            note: "RoHS 3",
            supplierSpecificNote: "",
        },
        esg: {
            analysisProgress: "Completed",
            riskStatus: "Medium risk",
            riskStatusLast: "High risk",
            concreteRisk: "Scope 3 emissions gap",
            humanRights: "Partial",
            workersRights: "Audited",
            environmental: "Needs improvement",
            existingKnowledge: "1 prior assessment",
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
    },
    {
        id: "702503",
        name: "Bavaria Kunststoffe e.K.",
        country: "DE",
        isicCode: "2229",
        internal: false,
        supplierStatus: "Active",
        responsibleBuyer: "Mareike Brandt",
        commodityGroup: "Injection Molding",
        strategicClassification: "Preferred Supplier (P)",
        abcClassification: "B",
        orderVolume2025: 1240000,
        orderVolume2024: 980000,
        supplierSpend: 1240000,
        ssaSent: true,
        ssaReceived: true,
        ssaCompleted: true,
        supplierCreatedIn: true,
        certificates: {
            iso9001: "Existent",
            iso13485: "Non-existent",
            iso45001: "Non-existent",
            iso17025: "Non-existent",
            codeOfConduct: "Non-existent",
            nda: "Non-existent",
            iso14001: "Non-existent",
        },
        reach: {
            relevance: true,
            affected: "SVHC < 0.1%",
            notes: "Declared",
            supplierSpecificNote: "",
        },
        rohs: {
            relevance: false,
            affected: "",
            note: "",
            supplierSpecificNote: "",
        },
        esg: {
            analysisProgress: "In progress",
            riskStatus: "Medium risk",
            riskStatusLast: "Medium risk",
            concreteRisk: "Chemical handling",
            humanRights: "Partial",
            workersRights: "Partial",
            environmental: "Under review",
            existingKnowledge: "Self-reported",
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
    },
    {
        id: "702517",
        name: "RheinMetal Components",
        country: "DE",
        isicCode: "2599",
        internal: false,
        supplierStatus: "Active",
        responsibleBuyer: "Tobias Keller",
        commodityGroup: "Forgings",
        strategicClassification: "Strategic Supplier (S)",
        abcClassification: "B",
        orderVolume2025: 2300000,
        orderVolume2024: 2100000,
        supplierSpend: 2300000,
        ssaSent: true,
        ssaReceived: true,
        ssaCompleted: true,
        supplierCreatedIn: true,
        certificates: {
            iso9001: "Existent",
            iso13485: "Non-existent",
            iso45001: "Existent",
            iso17025: "Non-existent",
            codeOfConduct: "Existent",
            nda: "Existent",
            iso14001: "Non-existent",
        },
        reach: {
            relevance: true,
            affected: "Declared",
            notes: "Declared",
            supplierSpecificNote: "",
        },
        rohs: {
            relevance: true,
            affected: "Compliant",
            note: "RoHS 3",
            supplierSpecificNote: "",
        },
        esg: {
            analysisProgress: "Completed",
            riskStatus: "Low risk",
            riskStatusLast: "Low risk",
            concreteRisk: "None",
            humanRights: "Audited",
            workersRights: "Audited",
            environmental: "ISO 14001",
            existingKnowledge: "3 prior assessments",
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
    },
    // ---- Internal / own business area (5.4) ----
    {
        id: "700112",
        name: "Prettl Werkzeugbau (Internal)",
        country: "DE",
        isicCode: "2573",
        internal: true,
        supplierStatus: "Active",
        responsibleBuyer: "Internal Plant",
        commodityGroup: "Tooling",
        strategicClassification: "Internal (I)",
        abcClassification: "C",
        orderVolume2025: 320000,
        orderVolume2024: 300000,
        supplierSpend: 320000,
        ssaSent: true,
        ssaReceived: true,
        ssaCompleted: true,
        supplierCreatedIn: true,
        certificates: {
            iso9001: "Existent",
            iso13485: "Non-existent",
            iso45001: "Non-existent",
            iso17025: "Non-existent",
            codeOfConduct: "Non-existent",
            nda: "Non-existent",
            iso14001: "Non-existent",
        },
        reach: {
            relevance: false,
            affected: "",
            notes: "",
            supplierSpecificNote: "",
        },
        rohs: {
            relevance: false,
            affected: "",
            note: "",
            supplierSpecificNote: "",
        },
        esg: {
            analysisProgress: "Completed",
            riskStatus: "Low risk",
            riskStatusLast: "Low risk",
            concreteRisk: "N/A",
            humanRights: "Internal policy",
            workersRights: "Internal policy",
            environmental: "Internal policy",
            existingKnowledge: "Internal",
        },
        ownBusinessArea: {
            analysisProgress: "Completed",
            riskStatus: "Low risk",
            implementation1: "Energy audit done",
            implementation2: "Waste segregation",
            implementation3: "Training rolled out",
            contactPerson: "Lena Prettl",
        },
        publicIncidents: [],
    },
    {
        id: "700118",
        name: "Prettl Elektronik (Internal)",
        country: "DE",
        isicCode: "2611",
        internal: true,
        supplierStatus: "Active",
        responsibleBuyer: "Internal Plant",
        commodityGroup: "PCBA",
        strategicClassification: "Internal (I)",
        abcClassification: "C",
        orderVolume2025: 540000,
        orderVolume2024: 510000,
        supplierSpend: 540000,
        ssaSent: true,
        ssaReceived: true,
        ssaCompleted: true,
        supplierCreatedIn: true,
        certificates: {
            iso9001: "Existent",
            iso13485: "Non-existent",
            iso45001: "Non-existent",
            iso17025: "Non-existent",
            codeOfConduct: "Non-existent",
            nda: "Non-existent",
            iso14001: "Non-existent",
        },
        reach: {
            relevance: false,
            affected: "",
            notes: "",
            supplierSpecificNote: "",
        },
        rohs: {
            relevance: false,
            affected: "",
            note: "",
            supplierSpecificNote: "",
        },
        esg: {
            analysisProgress: "In progress",
            riskStatus: "Medium risk",
            riskStatusLast: "Unknown",
            concreteRisk: "Tantalum sourcing",
            humanRights: "Partial",
            workersRights: "Partial",
            environmental: "Review",
            existingKnowledge: "Internal",
        },
        ownBusinessArea: {
            analysisProgress: "In progress",
            riskStatus: "Medium risk",
            implementation1: "Conflict minerals check",
            implementation2: "",
            implementation3: "Pending",
            contactPerson: "Jonas Prettl",
        },
        publicIncidents: [],
    },
    // ---- Potential suppliers (2.1) — count 3 ----
    {
        id: "703901",
        name: "Shenzhen Lumen Optics",
        country: "CN",
        isicCode: "2670",
        internal: false,
        supplierStatus: "Potential Supplier",
        responsibleBuyer: "Aiko Tanaka",
        commodityGroup: "Optics",
        strategicClassification: "",
        abcClassification: "C",
        orderVolume2025: 0,
        orderVolume2024: 0,
        supplierSpend: 0,
        ssaSent: true,
        ssaReceived: false,
        ssaCompleted: false,
        supplierCreatedIn: false,
        certificates: {
            iso9001: "Non-existent",
            iso13485: "Non-existent",
            iso45001: "Non-existent",
            iso17025: "Non-existent",
            codeOfConduct: "Non-existent",
            nda: "Non-existent",
            iso14001: "Non-existent",
        },
        reach: {
            relevance: true,
            affected: "Pending declaration",
            notes: "",
            supplierSpecificNote: "",
        },
        rohs: {
            relevance: false,
            affected: "",
            note: "",
            supplierSpecificNote: "",
        },
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
    },
    {
        id: "703904",
        name: "Pune Precision Ltd.",
        country: "IN",
        isicCode: "2599",
        internal: false,
        supplierStatus: "Potential Supplier",
        responsibleBuyer: "Ravi Menon",
        commodityGroup: "Turned Parts",
        strategicClassification: "",
        abcClassification: "B",
        orderVolume2025: 0,
        orderVolume2024: 0,
        supplierSpend: 0,
        ssaSent: true,
        ssaReceived: false,
        ssaCompleted: false,
        supplierCreatedIn: false,
        certificates: {
            iso9001: "Non-existent",
            iso13485: "Non-existent",
            iso45001: "Non-existent",
            iso17025: "Non-existent",
            codeOfConduct: "Non-existent",
            nda: "Non-existent",
            iso14001: "Non-existent",
        },
        reach: {
            relevance: false,
            affected: "",
            notes: "",
            supplierSpecificNote: "",
        },
        rohs: {
            relevance: false,
            affected: "",
            note: "",
            supplierSpecificNote: "",
        },
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
    },
    {
        id: "703907",
        name: "Guadalajara Cables S.A.",
        country: "MX",
        isicCode: "2732",
        internal: false,
        supplierStatus: "Potential Supplier",
        responsibleBuyer: "Aiko Tanaka",
        commodityGroup: "Harness",
        strategicClassification: "",
        abcClassification: "C",
        orderVolume2025: 0,
        orderVolume2024: 0,
        supplierSpend: 0,
        ssaSent: false,
        ssaReceived: false,
        ssaCompleted: false,
        supplierCreatedIn: false,
        certificates: {
            iso9001: "Non-existent",
            iso13485: "Non-existent",
            iso45001: "Non-existent",
            iso17025: "Non-existent",
            codeOfConduct: "Non-existent",
            nda: "Non-existent",
            iso14001: "Non-existent",
        },
        reach: {
            relevance: false,
            affected: "",
            notes: "",
            supplierSpecificNote: "",
        },
        rohs: {
            relevance: false,
            affected: "",
            note: "",
            supplierSpecificNote: "",
        },
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
    },
    // ---- In qualification (2.2) ----
    {
        id: "702650",
        name: "Torino Stampi S.r.l.",
        country: "IT",
        isicCode: "2573",
        internal: false,
        supplierStatus: "Evaluation Process",
        responsibleBuyer: "Marco Rossi",
        commodityGroup: "Tooling",
        strategicClassification: "",
        abcClassification: "B",
        orderVolume2025: 0,
        orderVolume2024: 0,
        supplierSpend: 0,
        ssaSent: true,
        ssaReceived: true,
        ssaCompleted: false,
        supplierCreatedIn: false,
        certificates: {
            iso9001: "Existent",
            iso13485: "Non-existent",
            iso45001: "Non-existent",
            iso17025: "Non-existent",
            codeOfConduct: "Non-existent",
            nda: "Non-existent",
            iso14001: "Non-existent",
        },
        reach: {
            relevance: false,
            affected: "",
            notes: "",
            supplierSpecificNote: "",
        },
        rohs: {
            relevance: false,
            affected: "",
            note: "",
            supplierSpecificNote: "",
        },
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
    },
    {
        id: "702661",
        name: "Kraków Formy Sp. z o.o.",
        country: "PL",
        isicCode: "2573",
        internal: false,
        supplierStatus: "Evaluation Process",
        responsibleBuyer: "Marco Rossi",
        commodityGroup: "Tooling",
        strategicClassification: "",
        abcClassification: "C",
        orderVolume2025: 0,
        orderVolume2024: 0,
        supplierSpend: 0,
        ssaSent: true,
        ssaReceived: true,
        ssaCompleted: false,
        supplierCreatedIn: false,
        certificates: {
            iso9001: "Non-existent",
            iso13485: "Non-existent",
            iso45001: "Non-existent",
            iso17025: "Non-existent",
            codeOfConduct: "Non-existent",
            nda: "Non-existent",
            iso14001: "Non-existent",
        },
        reach: {
            relevance: false,
            affected: "",
            notes: "",
            supplierSpecificNote: "",
        },
        rohs: {
            relevance: false,
            affected: "",
            note: "",
            supplierSpecificNote: "",
        },
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
    },
    // ---- Rejected (2.4) ----
    {
        id: "703002",
        name: "Hanoi Fasteners Co.",
        country: "VN",
        isicCode: "2593",
        internal: false,
        supplierStatus: "Rejected Supplier",
        responsibleBuyer: "Ravi Menon",
        commodityGroup: "Fasteners",
        strategicClassification: "",
        abcClassification: "C",
        orderVolume2025: 0,
        orderVolume2024: 0,
        supplierSpend: 0,
        ssaSent: true,
        ssaReceived: false,
        ssaCompleted: false,
        supplierCreatedIn: false,
        certificates: {
            iso9001: "Non-existent",
            iso13485: "Non-existent",
            iso45001: "Non-existent",
            iso17025: "Non-existent",
            codeOfConduct: "Non-existent",
            nda: "Non-existent",
            iso14001: "Non-existent",
        },
        reach: {
            relevance: false,
            affected: "",
            notes: "",
            supplierSpecificNote: "",
        },
        rohs: {
            relevance: false,
            affected: "",
            note: "",
            supplierSpecificNote: "",
        },
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
    },
    // ---- High-risk suspicious (4.2) + REACH/RoHS ----
    {
        id: "704211",
        name: "Yangon Textiles Ltd.",
        country: "CN",
        isicCode: "1392",
        internal: false,
        supplierStatus: "Active",
        responsibleBuyer: "Aiko Tanaka",
        commodityGroup: "Textiles",
        strategicClassification: "",
        abcClassification: "C",
        orderVolume2025: 780000,
        orderVolume2024: 650000,
        supplierSpend: 780000,
        ssaSent: true,
        ssaReceived: true,
        ssaCompleted: true,
        supplierCreatedIn: true,
        certificates: {
            iso9001: "Non-existent",
            iso13485: "Non-existent",
            iso45001: "Non-existent",
            iso17025: "Non-existent",
            codeOfConduct: "Non-existent",
            nda: "Non-existent",
            iso14001: "Non-existent",
        },
        reach: {
            relevance: true,
            affected: "Substance under review",
            notes: "Open",
            supplierSpecificNote: "Awaiting data",
        },
        rohs: {
            relevance: true,
            affected: "Non-compliant lot flagged",
            note: "RoHS 3",
            supplierSpecificNote: "Investigation",
        },
        esg: {
            analysisProgress: "Completed",
            riskStatus: "High risk",
            riskStatusLast: "Medium risk",
            concreteRisk: "Forced labor allegation",
            humanRights: "Critical gaps",
            workersRights: "Critical gaps",
            environmental: "Pollution incident",
            existingKnowledge: "NGO report",
        },
        ownBusinessArea: {
            analysisProgress: "",
            riskStatus: "",
            implementation1: "",
            implementation2: "",
            implementation3: "",
            contactPerson: "",
        },
        publicIncidents: [
            {
                status: "Violation confirmed",
                category: "Labor",
                briefJustification: "Local audit confirmed wage violations",
                sources: "Labor Watch 2025",
            },
        ],
    },
    {
        id: "704220",
        name: "Manaus Components",
        country: "BR",
        isicCode: "2732",
        internal: false,
        supplierStatus: "Active",
        responsibleBuyer: "Marco Rossi",
        commodityGroup: "Harness",
        strategicClassification: "",
        abcClassification: "C",
        orderVolume2025: 410000,
        orderVolume2024: 360000,
        supplierSpend: 410000,
        ssaSent: true,
        ssaReceived: true,
        ssaCompleted: true,
        supplierCreatedIn: true,
        certificates: {
            iso9001: "Non-existent",
            iso13485: "Non-existent",
            iso45001: "Non-existent",
            iso17025: "Non-existent",
            codeOfConduct: "Non-existent",
            nda: "Non-existent",
            iso14001: "Non-existent",
        },
        reach: {
            relevance: false,
            affected: "",
            notes: "",
            supplierSpecificNote: "",
        },
        rohs: {
            relevance: true,
            affected: "Compliant",
            note: "RoHS 3",
            supplierSpecificNote: "",
        },
        esg: {
            analysisProgress: "Completed",
            riskStatus: "Medium risk",
            riskStatusLast: "High risk",
            concreteRisk: "Deforestation linkage",
            humanRights: "Partial",
            workersRights: "Partial",
            environmental: "High concern",
            existingKnowledge: "Satellite data",
        },
        ownBusinessArea: {
            analysisProgress: "",
            riskStatus: "",
            implementation1: "",
            implementation2: "",
            implementation3: "",
            contactPerson: "",
        },
        publicIncidents: [
            {
                status: "Potential discrepancy",
                category: "Environmental",
                briefJustification: "Unverified claim of illegal logging",
                sources: "Local press",
            },
        ],
    },
    // ---- Waiting for SSA (5.3) ----
    {
        id: "705300",
        name: "Lyon Connecteurs",
        country: "FR",
        isicCode: "2733",
        internal: false,
        supplierStatus: "Active",
        responsibleBuyer: "Marco Rossi",
        commodityGroup: "Connectors",
        strategicClassification: "Preferred Supplier (P)",
        abcClassification: "B",
        orderVolume2025: 620000,
        orderVolume2024: 540000,
        supplierSpend: 620000,
        ssaSent: true,
        ssaReceived: true,
        ssaCompleted: false,
        supplierCreatedIn: true,
        certificates: {
            iso9001: "Non-existent",
            iso13485: "Non-existent",
            iso45001: "Non-existent",
            iso17025: "Non-existent",
            codeOfConduct: "Non-existent",
            nda: "Non-existent",
            iso14001: "Non-existent",
        },
        reach: {
            relevance: false,
            affected: "",
            notes: "",
            supplierSpecificNote: "",
        },
        rohs: {
            relevance: false,
            affected: "",
            note: "",
            supplierSpecificNote: "",
        },
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
    },
    // ---- Low spend, internal blank (drives 5.1 but excluded by spend) ----
    {
        id: "705311",
        name: "Oslo Polymer AS",
        country: "FR",
        isicCode: "2229",
        internal: false,
        supplierStatus: "Active",
        responsibleBuyer: "Mareike Brandt",
        commodityGroup: "Polymers",
        strategicClassification: "",
        abcClassification: "C",
        orderVolume2025: 3200,
        orderVolume2024: 2900,
        supplierSpend: 3200,
        ssaSent: true,
        ssaReceived: true,
        ssaCompleted: true,
        supplierCreatedIn: true,
        certificates: {
            iso9001: "Non-existent",
            iso13485: "Non-existent",
            iso45001: "Non-existent",
            iso17025: "Non-existent",
            codeOfConduct: "Non-existent",
            nda: "Non-existent",
            iso14001: "Non-existent",
        },
        reach: {
            relevance: false,
            affected: "",
            notes: "",
            supplierSpecificNote: "",
        },
        rohs: {
            relevance: false,
            affected: "",
            note: "",
            supplierSpecificNote: "",
        },
        esg: {
            analysisProgress: "In progress",
            riskStatus: "Low risk",
            riskStatusLast: "Low risk",
            concreteRisk: "None",
            humanRights: "Audited",
            workersRights: "Audited",
            environmental: "Good",
            existingKnowledge: "1 assessment",
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
    },
];

// ---------------------------------------------------------------------------
// Sidebar navigation config (JSON as requested)
// ---------------------------------------------------------------------------

export const SUPPLIER_SIDEBAR_CONFIG = {
    "1. General Overviews": [
        {
            id: "classification",
            label: "1.1 Classification",
            count: 2,
        },
        {
            id: "certificates",
            label: "1.2 Certificates & Documents",
            count: 2,
        },
    ],
    "2. Onboarding": [
        {
            id: "potential-suppliers",
            label: "2.1 Potential Suppliers",
            count: 3,
        },
        {
            id: "in-qualification",
            label: "2.2 In qualification",
            count: 2,
        },
        {
            id: "onboarded-suppliers",
            label: "2.3 Onboarded Suppliers",
            count: 2,
        },
        {
            id: "rejected-suppliers",
            label: "2.4 Rejected Suppliers",
            count: 1,
        },
    ],
    "3. Article-Conformity": [
        {
            id: "reach",
            label: "3.1 REACH",
            count: 2,
        },
        {
            id: "rohs",
            label: "3.2 RoHS",
            count: 0,
        },
    ],
    "4. ESG Management": [
        {
            id: "risk-development",
            label: "4.1 Risk Development",
            count: 1,
        },
        {
            id: "suspicious-suppliers",
            label: "4.2 Suspicious Suppliers",
            count: 2,
        },
        {
            id: "public-incidents",
            label: "4.3 Public Incidents",
            count: 2,
        },
    ],
    "5. ESG Risk Analysis": [
        {
            id: "overview",
            label: "5.1 Overview",
            count: 2,
        },
        {
            id: "mitigation-factors",
            label: "5.2 Mitigation Factors & Appropriateness",
            count: 2,
        },
        {
            id: "supplier-self-assessment",
            label: "5.3 Supplier Self-Assessment",
            count: 1,
        },
        {
            id: "own-business-area",
            label: "5.4 Own Business Area",
            count: 2,
        },
    ],
};

// ---------------------------------------------------------------------------
// Per-view config (TypeScript interfaces and objects)
// ---------------------------------------------------------------------------

export type PerViewConfig = {
    [key: string]: {
        filters: FilterRule[];
        columns: ColumnId[];
        defaultSort?: { id: ColumnId; dir: "asc" | "desc" };
        hasReset?: boolean;
    };
};

export const SUPPLIER_PER_VIEW_CONFIG: PerViewConfig = {
    classification: {
        filters: [],
        columns: ["supplier", "country", "orderVolume2025", "orderVolume2024", "abc", "status", "commodityGroup", "responsibleBuyer", "strategicClassification"],
        defaultSort: { id: "orderVolume2024", dir: "desc" },
        hasReset: true,
    },
    certificates: {
        filters: [],
        columns: ["supplier", "certIso9001", "certIso13485", "certIso45001", "certIso17025", "certCodeOfConduct", "certNda", "certIso14001"],
        defaultSort: { id: "supplier", dir: "asc" },
        hasReset: true,
    },
    "potential-suppliers": {
        filters: [createFilter("supplierStatus", "is_one_of", ["Potential Supplier"])],
        columns: ["supplier", "country", "status", "responsibleBuyer", "ssaSent"],
        defaultSort: { id: "supplier", dir: "asc" },
    },
    "in-qualification": {
        filters: [createFilter("supplierStatus", "is_one_of", ["Evaluation Process"])],
        columns: ["supplier", "country", "status", "responsibleBuyer", "ssaReceived", "commodityGroup"],
        defaultSort: { id: "supplier", dir: "asc" },
    },
    "onboarded-suppliers": {
        filters: [
            createFilter("supplierStatus", "is_one_of", ["Active"]),
            createFilter("ssaCompleted", "equals", true),
            createFilter("supplierCreatedIn", "equals", true),
        ],
        columns: ["supplier", "status", "commodityGroup", "responsibleBuyer", "ssaCompleted", "supplierCreatedIn"],
        defaultSort: { id: "status", dir: "asc" },
    },
    "rejected-suppliers": {
        filters: [createFilter("supplierStatus", "is_one_of", ["Rejected Supplier"])],
        columns: ["supplier", "responsibleBuyer", "status", "commodityGroup"],
        defaultSort: { id: "supplier", dir: "asc" },
    },
    reach: {
        filters: [createFilter("reachRelevance", "equals", true)],
        columns: ["supplier", "country", "reachRelevance", "reachAffected", "reachNotes", "reachSupplierSpecific"],
        defaultSort: { id: "supplier", dir: "asc" },
    },
    rohs: {
        filters: [createFilter("rohsRelevance", "equals", true)],
        columns: ["supplier", "country", "rohsRelevance", "rohsSupplierSpecific", "rohsAffected", "rohsNote"],
        defaultSort: { id: "supplier", dir: "asc" },
    },
    "risk-development": {
        filters: [
            createFilter("esgRiskStatus", "is_none_of", [""], "or"),
            createFilter("esgRiskStatusLast", "is_none_of", [""], "or"),
        ],
        columns: ["supplier", "esgAnalysisProgress", "esgRiskStatus"],
        defaultSort: { id: "supplier", dir: "asc" },
    },
    "suspicious-suppliers": {
        filters: [
            createFilter("esgRiskStatus", "is_one_of", ["High risk", "Medium risk"], "or"),
            createFilter("esgRiskStatusLast", "is_one_of", ["High risk", "Medium risk"], "or"),
            createFilter("esgAnalysisProgress", "is_one_of", ["Completed"]),
        ],
        columns: ["supplier", "esgRiskStatus", "concreteRisk", "humanRights", "workersRights", "environmental", "existingKnowledge"],
        defaultSort: { id: "supplier", dir: "asc" },
    },
    "public-incidents": {
        filters: [createFilter("incidentStatus", "is_one_of", ["Violation confirmed", "Potential discrepancy"])],
        columns: ["supplier", "incidentStatus", "incidentCategory", "incidentJustification", "incidentSources"],
        defaultSort: { id: "incidentStatus", dir: "desc" },
    },
    overview: {
        filters: [
            createFilter("internal", "is_blank", null),
            createFilter("supplierSpend", "gte", 10000),
        ],
        columns: ["supplier", "country", "isicCode", "esgRiskStatus", "esgAnalysisProgress"],
        defaultSort: { id: "esgAnalysisProgress", dir: "asc" },
    },
    "mitigation-factors": {
        filters: [
            createFilter("esgAnalysisProgress", "is_one_of", ["In progress"]),
            createFilter("esgRiskStatus", "is_none_of", ["Unknown"]),
        ],
        columns: ["supplier", "country", "esgRiskStatus", "concreteRisk", "humanRights", "workersRights", "environmental"],
        defaultSort: { id: "esgRiskStatus", dir: "asc" },
    },
    "supplier-self-assessment": {
        filters: [createFilter("esgAnalysisProgress", "is_one_of", ["Waiting for SSA"])],
        columns: ["supplier", "country", "esgRiskStatus", "humanRights", "workersRights", "environmental"],
        defaultSort: { id: "supplier", dir: "asc" },
    },
    "own-business-area": {
        filters: [createFilter("internal", "equals", true)],
        columns: ["supplier", "egbAnalysisProgress", "egbRiskStatus", "egbImplementation1", "egbImplementation2", "egbImplementation3", "contactPerson"],
        defaultSort: { id: "supplier", dir: "asc" },
    },
};
