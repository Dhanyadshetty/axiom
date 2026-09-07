"use client";

import * as React from "react";
import { Plus, Inbox, ArrowUp, ArrowDown, ChevronsUpDown, Check, ChevronDown, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/currency";
import { flagEmoji, countryName } from "@/lib/utils/countryFlags";

// Types from suppliers-model.ts
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
    country: string;
    isic_code: string;
    internal: boolean;
    supplier_status: SupplierStatus;
    responsible_buyer: string;
    commodity_group: string;
    strategic_classification: string;
    abc_classification_order: AbcClass;
    order_volume_2025: number;
    order_volume_2024: number;
    supplier_spend: number;
    ssa_sent: boolean;
    ssa_received: boolean;
    ssa_completed: boolean;
    supplier_created_in_x: boolean;
    certificates: {
        iso_9001: "Existent" | "Non-existent";
        iso_13485: "Existent" | "Non-existent";
        iso_45001: "Existent" | "Non-existent";
        iso_17025: "Existent" | "Non-existent";
        code_of_conduct: "Existent" | "Non-existent";
        nda: "Existent" | "Non-existent";
        iso_14001: "Existent" | "Non-existent";
    };
    reach: {
        relevance: boolean;
        affected: string;
        notes: string;
        supplier_specific_note: string;
    };
    rohs: {
        relevance: boolean;
        affected: string;
        note: string;
        supplier_specific_note: string;
    };
    esg: {
        analysis_progress: EsgAnalysisProgress;
        risk_status: EsgRiskStatus;
        risk_status_last: EsgRiskStatus;
        concrete_risk: string;
        human_rights: string;
        workers_rights: string;
        environmental: string;
        existing_knowledge_and_expertise: string;
    };
    own_business_area: {
        analysis_progress: string;
        risk_status: string;
        implementation_1: string;
        implementation_2: string;
        implementation_3: string;
        contact_person: string;
    };
    public_incidents: Array<{
        status: IncidentStatus;
        category: string;
        brief_justification: string;
        sources: string;
    }>;
}

// Column definitions matching the spec
export const COLUMN_CONFIGS = {
    supplier: {
        id: "supplier",
        label: "Supplier",
        width: 300,
        type: "text" as const,
        align: "left" as const,
    },
    country: {
        id: "country",
        label: "Country",
        width: 190,
        type: "country" as const,
        align: "left" as const,
    },
    isicCode: {
        id: "isicCode",
        label: "ISIC Code",
        width: 140,
        type: "text" as const,
        align: "left" as const,
    },
    orderVolume2025: {
        id: "orderVolume2025",
        label: "Order Volume 2025",
        width: 170,
        type: "currency" as const,
        align: "right" as const,
    },
    orderVolume2024: {
        id: "orderVolume2024",
        label: "Order Volume 2024",
        width: 170,
        type: "currency" as const,
        align: "right" as const,
    },
    abc: {
        id: "abc",
        label: "ABC Classification Order",
        width: 130,
        type: "abc" as const,
        align: "center" as const,
    },
    status: {
        id: "status",
        label: "Supplier Status",
        width: 180,
        type: "statusPill" as const,
        align: "left" as const,
    },
    commodityGroup: {
        id: "commodityGroup",
        label: "Commodity Group",
        width: 180,
        type: "text" as const,
        align: "left" as const,
    },
    responsibleBuyer: {
        id: "responsibleBuyer",
        label: "Responsible Buyer",
        width: 200,
        type: "text" as const,
        align: "left" as const,
    },
    strategicClassification: {
        id: "strategicClassification",
        label: "Strategic Classification (Prettl…)",
        width: 220,
        type: "strategicPill" as const,
        align: "left" as const,
    },
    certIso9001: {
        id: "certIso9001",
        label: "ISO 9001",
        width: 140,
        type: "certificate" as const,
        align: "center" as const,
    },
    certIso13485: {
        id: "certIso13485",
        label: "ISO 13485",
        width: 140,
        type: "certificate" as const,
        align: "center" as const,
    },
    certIso45001: {
        id: "certIso45001",
        label: "ISO 45001",
        width: 140,
        type: "certificate" as const,
        align: "center" as const,
    },
    certIso17025: {
        id: "certIso17025",
        label: "ISO 17025",
        width: 140,
        type: "certificate" as const,
        align: "center" as const,
    },
    certIso14001: {
        id: "certIso14001",
        label: "ISO 14001",
        width: 140,
        type: "certificate" as const,
        align: "center" as const,
    },
    certCodeOfConduct: {
        id: "certCodeOfConduct",
        label: "Verhaltenskodex (Code of Conduct)",
        width: 200,
        type: "certificate" as const,
        align: "center" as const,
    },
    certNda: {
        id: "certNda",
        label: "Vertraulichkeitsvereinbarung (NDA)",
        width: 200,
        type: "certificate" as const,
        align: "center" as const,
    },
    ssaSent: {
        id: "ssaSent",
        label: "SSA sent",
        width: 120,
        type: "boolean" as const,
        align: "center" as const,
    },
    ssaReceived: {
        id: "ssaReceived",
        label: "SSA received",
        width: 130,
        type: "boolean" as const,
        align: "center" as const,
    },
    ssaCompleted: {
        id: "ssaCompleted",
        label: "SSA completed",
        width: 130,
        type: "boolean" as const,
        align: "center" as const,
    },
    supplierCreatedIn: {
        id: "supplierCreatedIn",
        label: "Supplier created in …",
        width: 160,
        type: "boolean" as const,
        align: "center" as const,
    },
    reachRelevance: {
        id: "reachRelevance",
        label: "REACH relevance",
        width: 150,
        type: "boolean" as const,
        align: "center" as const,
    },
    reachAffected: {
        id: "reachAffected",
        label: "REACH affected",
        width: 160,
        type: "text" as const,
        align: "left" as const,
    },
    reachNotes: {
        id: "reachNotes",
        label: "REACH Notes",
        width: 200,
        type: "text" as const,
        align: "left" as const,
    },
    reachSupplierSpecific: {
        id: "reachSupplierSpecific",
        label: "Supplier specific note (REACH)",
        width: 200,
        type: "text" as const,
        align: "left" as const,
    },
    rohsRelevance: {
        id: "rohsRelevance",
        label: "RoHS relevance",
        width: 150,
        type: "boolean" as const,
        align: "center" as const,
    },
    rohsSupplierSpecific: {
        id: "rohsSupplierSpecific",
        label: "Supplier specific note (RoHS)",
        width: 200,
        type: "text" as const,
        align: "left" as const,
    },
    rohsAffected: {
        id: "rohsAffected",
        label: "RoHS affected",
        width: 160,
        type: "text" as const,
        align: "left" as const,
    },
    rohsNote: {
        id: "rohsNote",
        label: "RoHS Note",
        width: 200,
        type: "text" as const,
        align: "left" as const,
    },
    esgAnalysisProgress: {
        id: "esgAnalysisProgress",
        label: "ESG Analysis Progress",
        width: 180,
        type: "pill" as const,
        align: "left" as const,
    },
    esgRiskStatus: {
        id: "esgRiskStatus",
        label: "ESG Risk Status",
        width: 160,
        type: "pill" as const,
        align: "left" as const,
    },
    concreteRisk: {
        id: "concreteRisk",
        label: "Concrete Risk",
        width: 200,
        type: "text" as const,
        align: "left" as const,
    },
    humanRights: {
        id: "humanRights",
        label: "Human Rights",
        width: 160,
        type: "text" as const,
        align: "left" as const,
    },
    workersRights: {
        id: "workersRights",
        label: "Workers Rights",
        width: 160,
        type: "text" as const,
        align: "left" as const,
    },
    environmental: {
        id: "environmental",
        label: "Environmental",
        width: 160,
        type: "text" as const,
        align: "left" as const,
    },
    existingKnowledge: {
        id: "existingKnowledge",
        label: "Existing Knowledge & Expertise",
        width: 220,
        type: "text" as const,
        align: "left" as const,
    },
    incidentStatus: {
        id: "incidentStatus",
        label: "Status",
        width: 200,
        type: "pill" as const,
        align: "left" as const,
    },
    incidentCategory: {
        id: "incidentCategory",
        label: "Category",
        width: 180,
        type: "text" as const,
        align: "left" as const,
    },
    incidentJustification: {
        id: "incidentJustification",
        label: "Brief justification",
        width: 240,
        type: "text" as const,
        align: "left" as const,
    },
    incidentSources: {
        id: "incidentSources",
        label: "Sources",
        width: 200,
        type: "text" as const,
        align: "left" as const,
    },
    egbAnalysisProgress: {
        id: "egbAnalysisProgress",
        label: "Analysis progress (EGB)",
        width: 200,
        type: "pill" as const,
        align: "left" as const,
    },
    egbRiskStatus: {
        id: "egbRiskStatus",
        label: "Risk Status (EGB)",
        width: 180,
        type: "pill" as const,
        align: "left" as const,
    },
    egbImplementation1: {
        id: "egbImplementation1",
        label: "Implementation…",
        width: 180,
        type: "text" as const,
        align: "left" as const,
    },
    egbImplementation2: {
        id: "egbImplementation2",
        label: "Implementation…",
        width: 180,
        type: "text" as const,
        align: "left" as const,
    },
    egbImplementation3: {
        id: "egbImplementation3",
        label: "Implementation…",
        width: 180,
        type: "text" as const,
        align: "left" as const,
    },
    contactPerson: {
        id: "contactPerson",
        label: "Contact Person",
        width: 200,
        type: "text" as const,
        align: "left" as const,
    },
};

export type ColumnId = keyof typeof COLUMN_CONFIGS;
export type ColumnConfig = typeof COLUMN_CONFIGS[ColumnId];

// Filter types matching the spec
export type FilterOperator = 
    | "is_one_of"
    | "is_none_of" 
    | "equals"
    | "gte"
    | "is_blank"
    | "is_not_blank";

export interface FilterRule {
    field: string;
    operator: FilterOperator;
    value: any;
    connector: "and" | "or";
}

export interface ViewConfig {
    id: string;
    label: string;
    group: string;
    columns: ColumnId[];
    filters: FilterRule[];
    defaultSort?: { column: ColumnId; dir: "asc" | "desc" };
    hasReset?: boolean;
}

export const VIEW_CONFIGS: ViewConfig[] = [
    // 1. General Overviews
    {
        id: "classification",
        label: "1.1 Classification",
        group: "1. General Overviews",
        columns: ["supplier", "country", "orderVolume2025", "orderVolume2024", "abc", "status", "commodityGroup", "responsibleBuyer", "strategicClassification"],
        filters: [],
        defaultSort: { column: "orderVolume2024", dir: "desc" },
        hasReset: true,
    },
    {
        id: "certificates",
        label: "1.2 Certificates & Documents",
        group: "1. General Overviews",
        columns: ["supplier", "certIso9001", "certIso13485", "certIso45001", "certIso17025", "certCodeOfConduct", "certNda", "certIso14001"],
        filters: [],
        defaultSort: { column: "supplier", dir: "asc" },
        hasReset: true,
    },
    // 2. Onboarding
    {
        id: "potential-suppliers",
        label: "2.1 Potential Suppliers",
        group: "2. Onboarding",
        columns: ["supplier", "country", "status", "responsibleBuyer", "ssaSent"],
        filters: [
            { field: "supplier_status", operator: "is_one_of", value: ["Potential Supplier"], connector: "and" }
        ],
        defaultSort: { column: "supplier", dir: "asc" },
    },
    {
        id: "in-qualification",
        label: "2.2 In qualification",
        group: "2. Onboarding",
        columns: ["supplier", "country", "status", "responsibleBuyer", "ssaReceived", "commodityGroup"],
        filters: [
            { field: "supplier_status", operator: "is_one_of", value: ["Evaluation Process"], connector: "and" }
        ],
        defaultSort: { column: "supplier", dir: "asc" },
    },
    {
        id: "onboarded-suppliers",
        label: "2.3 Onboarded Suppliers",
        group: "2. Onboarding",
        columns: ["supplier", "status", "commodityGroup", "responsibleBuyer", "ssaCompleted", "supplierCreatedIn"],
        filters: [
            { field: "supplier_status", operator: "is_one_of", value: ["Active"], connector: "and" },
            { field: "ssa_completed", operator: "equals", value: true, connector: "and" },
            { field: "supplier_created_in_x", operator: "equals", value: true, connector: "and" }
        ],
        defaultSort: { column: "status", dir: "asc" },
    },
    {
        id: "rejected-suppliers",
        label: "2.4 Rejected Suppliers",
        group: "2. Onboarding",
        columns: ["supplier", "responsibleBuyer", "status", "commodityGroup"],
        filters: [
            { field: "supplier_status", operator: "is_one_of", value: ["Rejected Supplier"], connector: "and" }
        ],
        defaultSort: { column: "supplier", dir: "asc" },
    },
    // 3. Article-Conformity
    {
        id: "reach",
        label: "3.1 REACH",
        group: "3. Article-Conformity",
        columns: ["supplier", "country", "reachRelevance", "reachAffected", "reachNotes", "reachSupplierSpecific"],
        filters: [
            { field: "reach.relevance", operator: "equals", value: true, connector: "and" }
        ],
        defaultSort: { column: "supplier", dir: "asc" },
    },
    {
        id: "rohs",
        label: "3.2 RoHS",
        group: "3. Article-Conformity",
        columns: ["supplier", "country", "rohsRelevance", "rohsSupplierSpecific", "rohsAffected", "rohsNote"],
        filters: [
            { field: "rohs.relevance", operator: "equals", value: true, connector: "and" }
        ],
        defaultSort: { column: "supplier", dir: "asc" },
    },
    // 4. ESG Management
    {
        id: "risk-development",
        label: "4.1 Risk Development",
        group: "4. ESG Management",
        columns: ["supplier", "esgAnalysisProgress", "esgRiskStatus"],
        filters: [
            { field: "esg.risk_status", operator: "is_none_of", value: ["", "Unknown"], connector: "or" },
            { field: "esg.risk_status_last", operator: "is_none_of", value: ["", "Unknown"], connector: "or" }
        ],
        defaultSort: { column: "supplier", dir: "asc" },
    },
    {
        id: "suspicious-suppliers",
        label: "4.2 Suspicious Suppliers",
        group: "4. ESG Management",
        columns: ["supplier", "esgRiskStatus", "concreteRisk", "humanRights", "workersRights", "environmental", "existingKnowledge"],
        filters: [
            { field: "esg.risk_status", operator: "is_one_of", value: ["High risk", "Medium risk"], connector: "or" },
            { field: "esg.risk_status_last", operator: "is_one_of", value: ["High risk", "Medium risk"], connector: "or" },
            { field: "esg.analysis_progress", operator: "is_one_of", value: ["Completed"], connector: "and" }
        ],
        defaultSort: { column: "supplier", dir: "asc" },
    },
    {
        id: "public-incidents",
        label: "4.3 Public Incidents",
        group: "4. ESG Management",
        columns: ["supplier", "incidentStatus", "incidentCategory", "incidentJustification", "incidentSources"],
        filters: [
            { field: "public_incidents[0].status", operator: "is_one_of", value: ["Violation confirmed", "Potential discrepancy"], connector: "and" }
        ],
        defaultSort: { column: "incidentStatus", dir: "desc" },
    },
    // 5. ESG Risk Analysis
    {
        id: "overview",
        label: "5.1 Overview",
        group: "5. ESG Risk Analysis",
        columns: ["supplier", "country", "isicCode", "esgRiskStatus", "esgAnalysisProgress"],
        filters: [
            { field: "internal", operator: "is_blank", value: null, connector: "and" },
            { field: "supplier_spend", operator: "gte", value: 10000, connector: "and" }
        ],
        defaultSort: { column: "esgAnalysisProgress", dir: "asc" },
    },
    {
        id: "mitigation-factors",
        label: "5.2 Mitigation Factors & Appropriateness",
        group: "5. ESG Risk Analysis",
        columns: ["supplier", "country", "esgRiskStatus", "concreteRisk", "humanRights", "workersRights", "environmental"],
        filters: [
            { field: "esg.analysis_progress", operator: "is_one_of", value: ["In progress"], connector: "and" },
            { field: "esg.risk_status", operator: "is_none_of", value: ["Unknown"], connector: "and" }
        ],
        defaultSort: { column: "esgRiskStatus", dir: "asc" },
    },
    {
        id: "supplier-self-assessment",
        label: "5.3 Supplier Self-Assessment",
        group: "5. ESG Risk Analysis",
        columns: ["supplier", "country", "esgRiskStatus", "humanRights", "workersRights", "environmental"],
        filters: [
            { field: "esg.analysis_progress", operator: "is_one_of", value: ["Waiting for SSA"], connector: "and" }
        ],
        defaultSort: { column: "supplier", dir: "asc" },
    },
    {
        id: "own-business-area",
        label: "5.4 Own Business Area",
        group: "5. ESG Risk Analysis",
        columns: ["supplier", "egbAnalysisProgress", "egbRiskStatus", "egbImplementation1", "egbImplementation2", "egbImplementation3", "contactPerson"],
        filters: [
            { field: "internal", operator: "equals", value: true, connector: "and" }
        ],
        defaultSort: { column: "supplier", dir: "asc" },
    },
];

export function getColumnConfig(columnId: ColumnId) {
    return COLUMN_CONFIGS[columnId];
}

export function getViewConfig(viewId: string): ViewConfig | undefined {
    return VIEW_CONFIGS.find(v => v.id === viewId);
}

export const MOCK_SUPPLIERS: Supplier[] = [
    {
        id: "702478",
        name: "Helios Präzisionsteile GmbH",
        country: "DE",
        isic_code: "2599",
        internal: false,
        supplier_status: "Active",
        responsible_buyer: "Mareike Brandt",
        commodity_group: "Machined Components",
        strategic_classification: "Preferred Supplier (P)",
        abc_classification_order: "A",
        order_volume_2025: 4820000,
        order_volume_2024: 4150000,
        supplier_spend: 4820000,
        ssa_sent: true,
        ssa_received: true,
        ssa_completed: true,
        supplier_created_in_x: true,
        certificates: {
            iso_9001: "Existent",
            iso_13485: "Non-existent",
            iso_45001: "Non-existent",
            iso_17025: "Non-existent",
            code_of_conduct: "Existent",
            nda: "Existent",
            iso_14001: "Non-existent",
        },
        reach: {
            relevance: true,
            affected: "SVHC candidate list < 0.1%",
            notes: "Declared",
            supplier_specific_note: "No article-level risk",
        },
        rohs: {
            relevance: true,
            affected: "Compliant",
            note: "RoHS 3",
            supplier_specific_note: "No exemptions used",
        },
        esg: {
            analysis_progress: "Completed",
            risk_status: "Low risk",
            risk_status_last: "Low risk",
            concrete_risk: "None identified",
            human_rights: "Audited",
            workers_rights: "Audited",
            environmental: "ISO 50001 planned",
            existing_knowledge_and_expertise: "2 prior assessments",
        },
        own_business_area: {
            analysis_progress: "",
            risk_status: "",
            implementation_1: "",
            implementation_2: "",
            implementation_3: "",
            contact_person: "",
        },
        public_incidents: [],
    },
    {
        id: "702491",
        name: "Nordpol Stahl AG",
        country: "DE",
        isic_code: "2410",
        internal: false,
        supplier_status: "Active",
        responsible_buyer: "Tobias Keller",
        commodity_group: "Raw Steel",
        strategic_classification: "Strategic Supplier (S)",
        abc_classification_order: "A",
        order_volume_2025: 6150000,
        order_volume_2024: 5900000,
        supplier_spend: 6150000,
        ssa_sent: true,
        ssa_received: true,
        ssa_completed: true,
        supplier_created_in_x: true,
        certificates: {
            iso_9001: "Existent",
            iso_13485: "Existent",
            iso_45001: "Non-existent",
            iso_17025: "Non-existent",
            code_of_conduct: "Existent",
            nda: "Non-existent",
            iso_14001: "Non-existent",
        },
        reach: {
            relevance: true,
            affected: "Substance declared",
            notes: "In progress",
            supplier_specific_note: "",
        },
        rohs: {
            relevance: true,
            affected: "Compliant",
            note: "RoHS 3",
            supplier_specific_note: "",
        },
        esg: {
            analysis_progress: "Completed",
            risk_status: "Medium risk",
            risk_status_last: "High risk",
            concrete_risk: "Scope 3 emissions gap",
            human_rights: "Partial",
            workers_rights: "Audited",
            environmental: "Needs improvement",
            existing_knowledge_and_expertise: "1 prior assessment",
        },
        own_business_area: {
            analysis_progress: "",
            risk_status: "",
            implementation_1: "",
            implementation_2: "",
            implementation_3: "",
            contact_person: "",
        },
        public_incidents: [],
    },
    {
        id: "702503",
        name: "Bavaria Kunststoffe e.K.",
        country: "DE",
        isic_code: "2229",
        internal: false,
        supplier_status: "Active",
        responsible_buyer: "Mareike Brandt",
        commodity_group: "Injection Molding",
        strategic_classification: "Preferred Supplier (P)",
        abc_classification_order: "B",
        order_volume_2025: 1240000,
        order_volume_2024: 980000,
        supplier_spend: 1240000,
        ssa_sent: true,
        ssa_received: true,
        ssa_completed: true,
        supplier_created_in_x: true,
        certificates: {
            iso_9001: "Existent",
            iso_13485: "Non-existent",
            iso_45001: "Non-existent",
            iso_17025: "Non-existent",
            code_of_conduct: "Non-existent",
            nda: "Non-existent",
            iso_14001: "Non-existent",
        },
        reach: {
            relevance: true,
            affected: "SVHC < 0.1%",
            notes: "Declared",
            supplier_specific_note: "",
        },
        rohs: {
            relevance: false,
            affected: "",
            note: "",
            supplier_specific_note: "",
        },
        esg: {
            analysis_progress: "In progress",
            risk_status: "Medium risk",
            risk_status_last: "Medium risk",
            concrete_risk: "Chemical handling",
            human_rights: "Partial",
            workers_rights: "Partial",
            environmental: "Under review",
            existing_knowledge_and_expertise: "Self-reported",
        },
        own_business_area: {
            analysis_progress: "",
            risk_status: "",
            implementation_1: "",
            implementation_2: "",
            implementation_3: "",
            contact_person: "",
        },
        public_incidents: [],
    },
    {
        id: "702517",
        name: "RheinMetal Components",
        country: "DE",
        isic_code: "2599",
        internal: false,
        supplier_status: "Active",
        responsible_buyer: "Tobias Keller",
        commodity_group: "Forgings",
        strategic_classification: "Strategic Supplier (S)",
        abc_classification_order: "B",
        order_volume_2025: 2300000,
        order_volume_2024: 2100000,
        supplier_spend: 2300000,
        ssa_sent: true,
        ssa_received: true,
        ssa_completed: true,
        supplier_created_in_x: true,
        certificates: {
            iso_9001: "Existent",
            iso_13485: "Non-existent",
            iso_45001: "Existent",
            iso_17025: "Non-existent",
            code_of_conduct: "Existent",
            nda: "Existent",
            iso_14001: "Non-existent",
        },
        reach: {
            relevance: true,
            affected: "Declared",
            notes: "Declared",
            supplier_specific_note: "",
        },
        rohs: {
            relevance: true,
            affected: "Compliant",
            note: "RoHS 3",
            supplier_specific_note: "",
        },
        esg: {
            analysis_progress: "Completed",
            risk_status: "Low risk",
            risk_status_last: "Low risk",
            concrete_risk: "None",
            human_rights: "Audited",
            workers_rights: "Audited",
            environmental: "ISO 14001",
            existing_knowledge_and_expertise: "3 prior assessments",
        },
        own_business_area: {
            analysis_progress: "",
            risk_status: "",
            implementation_1: "",
            implementation_2: "",
            implementation_3: "",
            contact_person: "",
        },
        public_incidents: [],
    },
    {
        id: "700112",
        name: "Prettl Werkzeugbau (Internal)",
        country: "DE",
        isic_code: "2573",
        internal: true,
        supplier_status: "Active",
        responsible_buyer: "Internal Plant",
        commodity_group: "Tooling",
        strategic_classification: "Internal (I)",
        abc_classification_order: "C",
        order_volume_2025: 320000,
        order_volume_2024: 300000,
        supplier_spend: 320000,
        ssa_sent: true,
        ssa_received: true,
        ssa_completed: true,
        supplier_created_in_x: true,
        certificates: {
            iso_9001: "Existent",
            iso_13485: "Non-existent",
            iso_45001: "Non-existent",
            iso_17025: "Non-existent",
            code_of_conduct: "Non-existent",
            nda: "Non-existent",
            iso_14001: "Non-existent",
        },
        reach: {
            relevance: false,
            affected: "",
            notes: "",
            supplier_specific_note: "",
        },
        rohs: {
            relevance: false,
            affected: "",
            note: "",
            supplier_specific_note: "",
        },
        esg: {
            analysis_progress: "Completed",
            risk_status: "Low risk",
            risk_status_last: "Low risk",
            concrete_risk: "N/A",
            human_rights: "Internal policy",
            workers_rights: "Internal policy",
            environmental: "Internal policy",
            existing_knowledge_and_expertise: "Internal",
        },
        own_business_area: {
            analysis_progress: "Completed",
            risk_status: "Low risk",
            implementation_1: "Energy audit done",
            implementation_2: "Waste segregation",
            implementation_3: "Training rolled out",
            contact_person: "Lena Prettl",
        },
        public_incidents: [],
    },
    {
        id: "703901",
        name: "Shenzhen Lumen Optics",
        country: "CN",
        isic_code: "2670",
        internal: false,
        supplier_status: "Potential Supplier",
        responsible_buyer: "Aiko Tanaka",
        commodity_group: "Optics",
        strategic_classification: "",
        abc_classification_order: "C",
        order_volume_2025: 0,
        order_volume_2024: 0,
        supplier_spend: 0,
        ssa_sent: true,
        ssa_received: false,
        ssa_completed: false,
        supplier_created_in_x: false,
        certificates: {
            iso_9001: "Non-existent",
            iso_13485: "Non-existent",
            iso_45001: "Non-existent",
            iso_17025: "Non-existent",
            code_of_conduct: "Non-existent",
            nda: "Non-existent",
            iso_14001: "Non-existent",
        },
        reach: {
            relevance: true,
            affected: "Pending declaration",
            notes: "",
            supplier_specific_note: "",
        },
        rohs: {
            relevance: false,
            affected: "",
            note: "",
            supplier_specific_note: "",
        },
        esg: {
            analysis_progress: "Waiting for SSA",
            risk_status: "Unknown",
            risk_status_last: "Unknown",
            concrete_risk: "",
            human_rights: "",
            workers_rights: "",
            environmental: "",
            existing_knowledge_and_expertise: "",
        },
        own_business_area: {
            analysis_progress: "",
            risk_status: "",
            implementation_1: "",
            implementation_2: "",
            implementation_3: "",
            contact_person: "",
        },
        public_incidents: [],
    },
    {
        id: "703904",
        name: "Pune Precision Ltd.",
        country: "IN",
        isic_code: "2599",
        internal: false,
        supplier_status: "Potential Supplier",
        responsible_buyer: "Ravi Menon",
        commodity_group: "Turned Parts",
        strategic_classification: "",
        abc_classification_order: "B",
        order_volume_2025: 0,
        order_volume_2024: 0,
        supplier_spend: 0,
        ssa_sent: true,
        ssa_received: false,
        ssa_completed: false,
        supplier_created_in_x: false,
        certificates: {
            iso_9001: "Non-existent",
            iso_13485: "Non-existent",
            iso_45001: "Non-existent",
            iso_17025: "Non-existent",
            code_of_conduct: "Non-existent",
            nda: "Non-existent",
            iso_14001: "Non-existent",
        },
        reach: {
            relevance: false,
            affected: "",
            notes: "",
            supplier_specific_note: "",
        },
        rohs: {
            relevance: false,
            affected: "",
            note: "",
            supplier_specific_note: "",
        },
        esg: {
            analysis_progress: "Waiting for SSA",
            risk_status: "Unknown",
            risk_status_last: "Unknown",
            concrete_risk: "",
            human_rights: "",
            workers_rights: "",
            environmental: "",
            existing_knowledge_and_expertise: "",
        },
        own_business_area: {
            analysis_progress: "",
            risk_status: "",
            implementation_1: "",
            implementation_2: "",
            implementation_3: "",
            contact_person: "",
        },
        public_incidents: [],
    },
    {
        id: "703907",
        name: "Guadalajara Cables S.A.",
        country: "MX",
        isic_code: "2732",
        internal: false,
        supplier_status: "Potential Supplier",
        responsible_buyer: "Aiko Tanaka",
        commodity_group: "Harness",
        strategic_classification: "",
        abc_classification_order: "C",
        order_volume_2025: 0,
        order_volume_2024: 0,
        supplier_spend: 0,
        ssa_sent: false,
        ssa_received: false,
        ssa_completed: false,
        supplier_created_in_x: false,
        certificates: {
            iso_9001: "Non-existent",
            iso_13485: "Non-existent",
            iso_45001: "Non-existent",
            iso_17025: "Non-existent",
            code_of_conduct: "Non-existent",
            nda: "Non-existent",
            iso_14001: "Non-existent",
        },
        reach: {
            relevance: false,
            affected: "",
            notes: "",
            supplier_specific_note: "",
        },
        rohs: {
            relevance: false,
            affected: "",
            note: "",
            supplier_specific_note: "",
        },
        esg: {
            analysis_progress: "Waiting for SSA",
            risk_status: "Unknown",
            risk_status_last: "Unknown",
            concrete_risk: "",
            human_rights: "",
            workers_rights: "",
            environmental: "",
            existing_knowledge_and_expertise: "",
        },
        own_business_area: {
            analysis_progress: "",
            risk_status: "",
            implementation_1: "",
            implementation_2: "",
            implementation_3: "",
            contact_person: "",
        },
        public_incidents: [],
    },
    {
        id: "702650",
        name: "Torino Stampi S.r.l.",
        country: "IT",
        isic_code: "2573",
        internal: false,
        supplier_status: "Evaluation Process",
        responsible_buyer: "Marco Rossi",
        commodity_group: "Tooling",
        strategic_classification: "",
        abc_classification_order: "B",
        order_volume_2025: 0,
        order_volume_2024: 0,
        supplier_spend: 0,
        ssa_sent: true,
        ssa_received: true,
        ssa_completed: false,
        supplier_created_in_x: false,
        certificates: {
            iso_9001: "Existent",
            iso_13485: "Non-existent",
            iso_45001: "Non-existent",
            iso_17025: "Non-existent",
            code_of_conduct: "Non-existent",
            nda: "Non-existent",
            iso_14001: "Non-existent",
        },
        reach: {
            relevance: false,
            affected: "",
            notes: "",
            supplier_specific_note: "",
        },
        rohs: {
            relevance: false,
            affected: "",
            note: "",
            supplier_specific_note: "",
        },
        esg: {
            analysis_progress: "Waiting for SSA",
            risk_status: "Unknown",
            risk_status_last: "Unknown",
            concrete_risk: "",
            human_rights: "",
            workers_rights: "",
            environmental: "",
            existing_knowledge_and_expertise: "",
        },
        own_business_area: {
            analysis_progress: "",
            risk_status: "",
            implementation_1: "",
            implementation_2: "",
            implementation_3: "",
            contact_person: "",
        },
        public_incidents: [],
    },
    {
        id: "704211",
        name: "Yangon Textiles Ltd.",
        country: "CN",
        isic_code: "1392",
        internal: false,
        supplier_status: "Active",
        responsible_buyer: "Aiko Tanaka",
        commodity_group: "Textiles",
        strategic_classification: "",
        abc_classification_order: "C",
        order_volume_2025: 780000,
        order_volume_2024: 650000,
        supplier_spend: 780000,
        ssa_sent: true,
        ssa_received: true,
        ssa_completed: true,
        supplier_created_in_x: true,
        certificates: {
            iso_9001: "Non-existent",
            iso_13485: "Non-existent",
            iso_45001: "Non-existent",
            iso_17025: "Non-existent",
            code_of_conduct: "Non-existent",
            nda: "Non-existent",
            iso_14001: "Non-existent",
        },
        reach: {
            relevance: true,
            affected: "Substance under review",
            notes: "Open",
            supplier_specific_note: "Awaiting data",
        },
        rohs: {
            relevance: true,
            affected: "Non-compliant lot flagged",
            note: "RoHS 3",
            supplier_specific_note: "Investigation",
        },
        esg: {
            analysis_progress: "Completed",
            risk_status: "High risk",
            risk_status_last: "Medium risk",
            concrete_risk: "Forced labor allegation",
            human_rights: "Critical gaps",
            workers_rights: "Critical gaps",
            environmental: "Pollution incident",
            existing_knowledge_and_expertise: "NGO report",
        },
        own_business_area: {
            analysis_progress: "",
            risk_status: "",
            implementation_1: "",
            implementation_2: "",
            implementation_3: "",
            contact_person: "",
        },
        public_incidents: [
            {
                status: "Violation confirmed",
                category: "Labor",
                brief_justification: "Local audit confirmed wage violations",
                sources: "Labor Watch 2025",
            },
        ],
    },
];

export function filterSuppliers(suppliers: Supplier[], filters: FilterRule[]): Supplier[] {
    return suppliers.filter(supplier => {
        return filters.every((filter, index) => {
            const connector = index > 0 ? filters[index - 1].connector : 'and';
            const result = evaluateFilter(supplier, filter);
            return connector === 'and' ? result : !result;
        });
    });
}

export function evaluateFilter(supplier: Supplier, filter: FilterRule): boolean {
    const getValue = (path: string): any => {
        const parts = path.split('.');
        let value: any = supplier;
        for (const part of parts) {
            if (value === null || value === undefined) return null;
            value = value[part];
        }
        return value;
    };
    
    const fieldValue = getValue(filter.field);
    
    switch (filter.operator) {
        case "is_one_of":
            return Array.isArray(filter.value) && Array.isArray(fieldValue) && 
                filter.value.some(v => fieldValue.includes(v));
        case "is_none_of":
            return Array.isArray(filter.value) && Array.isArray(fieldValue) &&
                !fieldValue.some(v => filter.value.includes(v));
        case "equals":
            return fieldValue === filter.value;
        case "gte":
            return typeof fieldValue === 'number' && fieldValue >= filter.value;
        case "is_blank":
            return fieldValue === null || fieldValue === undefined || fieldValue === '' ||
                (Array.isArray(fieldValue) && fieldValue.length === 0);
        case "is_not_blank":
            return fieldValue !== null && fieldValue !== undefined && fieldValue !== '' &&
                !(Array.isArray(fieldValue) && fieldValue.length === 0);
        default:
            return true;
    }
}

export function sortSuppliers(suppliers: Supplier[], sortColumn: string, sortDirection: 'asc' | 'desc'): Supplier[] {
    return [...suppliers].sort((a, b) => {
        const getValue = (path: string): any => {
            const parts = path.split('.');
            let value: any = a;
            for (const part of parts) {
                if (value === null || value === undefined) return null;
                value = value[part];
            }
            return value;
        };
        
        const aValue = getValue(sortColumn);
        const bValue = getValue(sortColumn);
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        
        if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
        if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
}

export function getSuppliersByView(
    viewId: string,
    suppliers: Supplier[] = MOCK_SUPPLIERS,
    searchTerm: string = ''
): Supplier[] {
    const view = getViewConfig(viewId);
    if (!view) return [];
    
    let filtered = filterSuppliers(suppliers, view.filters);
    
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(supplier =>
            supplier.name.toLowerCase().includes(term) ||
            supplier.id.toLowerCase().includes(term) ||
            supplier.country.toLowerCase().includes(term) ||
            supplier.responsible_buyer.toLowerCase().includes(term)
        );
    }
    
    return filtered;
}
