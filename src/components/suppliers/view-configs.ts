import { type SupplierView } from "./tacto/suppliers-model";

// View configurations - 15 total numbered views from the spec

export const VIEW_CONFIGS: SupplierView[] = [
  // 1. General Overviews
  {
    id: "classification",
    group: "1. General Overviews",
    label: "1.1 Classification",
    columns: [
      "supplier",
      "country",
      "orderVolume2025",
      "orderVolume2024",
      "abc",
      "status",
      "commodityGroup",
      "responsibleBuyer",
      "strategicClassification",
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
    columns: [
      "supplier",
      "country",
      "status",
      "responsibleBuyer",
      "ssaSent",
    ],
    filters: [
      {
        field: "supplierStatus",
        operator: "is_one_of" as const,
        value: ["Potential Supplier"],
        connector: "and" as const,
      },
    ],
    defaultSort: { id: "supplier", dir: "asc" },
  },
  {
    id: "in-qualification",
    group: "2. Onboarding",
    label: "2.2 In qualification",
    columns: [
      "supplier",
      "country",
      "status",
      "responsibleBuyer",
      "ssaReceived",
      "commodityGroup",
    ],
    filters: [
      {
        field: "supplierStatus",
        operator: "is_one_of" as const,
        value: ["Evaluation Process"],
        connector: "and" as const,
      },
    ],
    defaultSort: { id: "supplier", dir: "asc" },
  },
  {
    id: "onboarded-suppliers",
    group: "2. Onboarding",
    label: "2.3 Onboarded Suppliers",
    columns: [
      "supplier",
      "status",
      "commodityGroup",
      "responsibleBuyer",
      "ssaCompleted",
      "supplierCreatedIn",
    ],
    filters: [
      {
        field: "supplierStatus",
        operator: "is_one_of" as const,
        value: ["Active"],
        connector: "and" as const,
      },
      {
        field: "ssaCompleted",
        operator: "equals" as const,
        value: true,
        connector: "and" as const,
      },
      {
        field: "supplierCreatedIn",
        operator: "equals" as const,
        value: true,
        connector: "and" as const,
      },
    ],
    defaultSort: { id: "status", dir: "asc" },
  },
  {
    id: "rejected-suppliers",
    group: "2. Onboarding",
    label: "2.4 Rejected Suppliers",
    columns: [
      "supplier",
      "responsibleBuyer",
      "status",
      "commodityGroup",
    ],
    filters: [
      {
        field: "supplierStatus",
        operator: "is_one_of" as const,
        value: ["Rejected Supplier"],
        connector: "and" as const,
      },
    ],
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
    filters: [
      {
        field: "reachRelevance",
        operator: "equals" as const,
        value: true,
        connector: "and" as const,
      },
    ],
    defaultSort: { id: "supplier", dir: "asc" },
  },
  {
    id: "rohs",
    group: "3. Article-Conformity",
    label: "3.2 RoHS",
    columns: [
      "supplier",
      "country",
      "rohsRelevance",
      "rohsSupplierSpecific",
      "rohsAffected",
      "rohsNote",
    ],
    filters: [
      {
        field: "rohsRelevance",
        operator: "equals" as const,
        value: true,
        connector: "and" as const,
      },
    ],
    defaultSort: { id: "supplier", dir: "asc" },
  },
  // 4. ESG Management
  {
    id: "risk-development",
    group: "4. ESG Management",
    label: "4.1 Risk Development",
    columns: [
      "supplier",
      "esgAnalysisProgress",
      "esgRiskStatus",
    ],
    filters: [
      {
        field: "esgRiskStatus",
        operator: "is_none_of" as const,
        value: [""],
        connector: "or" as const,
      },
      {
        field: "esgRiskStatusLast",
        operator: "is_none_of" as const,
        value: [""],
        connector: "or" as const,
      },
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
      {
        field: "esgRiskStatus",
        operator: "is_one_of" as const,
        value: ["High risk", "Medium risk"],
        connector: "or" as const,
      },
      {
        field: "esgRiskStatusLast",
        operator: "is_one_of" as const,
        value: ["High risk", "Medium risk"],
        connector: "or" as const,
      },
      {
        field: "esgAnalysisProgress",
        operator: "is_one_of" as const,
        value: ["Completed"],
        connector: "and" as const,
      },
    ],
    defaultSort: { id: "supplier", dir: "asc" },
  },
  {
    id: "public-incidents",
    group: "4. ESG Management",
    label: "4.3 Public Incidents",
    columns: [
      "supplier",
      "incidentStatus",
      "incidentCategory",
      "incidentJustification",
      "incidentSources",
    ],
    filters: [
      {
        field: "incidentStatus",
        operator: "is_one_of" as const,
        value: ["Violation confirmed", "Potential discrepancy"],
        connector: "and" as const,
      },
    ],
    defaultSort: { id: "incidentStatus", dir: "desc" },
  },
  // 5. ESG Risk Analysis
  {
    id: "overview",
    group: "5. ESG Risk Analysis",
    label: "5.1 Overview",
    columns: [
      "supplier",
      "country",
      "isicCode",
      "esgRiskStatus",
      "esgAnalysisProgress",
    ],
    filters: [
      {
        field: "internal",
        operator: "is_blank" as const,
        value: null,
        connector: "and" as const,
      },
      {
        field: "supplierSpend",
        operator: "gte" as const,
        value: 10000,
        connector: "and" as const,
      },
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
      {
        field: "esgAnalysisProgress",
        operator: "is_one_of" as const,
        value: ["In progress"],
        connector: "and" as const,
      },
      {
        field: "esgRiskStatus",
        operator: "is_none_of" as const,
        value: ["Unknown"],
        connector: "and" as const,
      },
    ],
    defaultSort: { id: "esgRiskStatus", dir: "asc" },
  },
  {
    id: "supplier-self-assessment",
    group: "5. ESG Risk Analysis",
    label: "5.3 Supplier Self-Assessment",
    columns: [
      "supplier",
      "country",
      "esgRiskStatus",
      "humanRights",
      "workersRights",
      "environmental",
    ],
    filters: [
      {
        field: "esgAnalysisProgress",
        operator: "is_one_of" as const,
        value: ["Waiting for SSA"],
        connector: "and" as const,
      },
    ],
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
    filters: [
      {
        field: "internal",
        operator: "equals" as const,
        value: true,
        connector: "and" as const,
      },
    ],
    defaultSort: { id: "supplier", dir: "asc" },
  },
];
