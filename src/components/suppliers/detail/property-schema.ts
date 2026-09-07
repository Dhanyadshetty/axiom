import type { PropertyValueKind } from "./property-row";

export interface PropertySpec {
    key: string;
    label: string;
    kind: PropertyValueKind;
    options?: string[];
    placeholder?: string;
    group?: string;
}

export interface TableSpec {
    title: string;
    columns: { key: string; label: string; type: "text" | "number"; required?: boolean }[];
}

export const TABLE_SPECS: Record<string, TableSpec> = {
    investmentVolume: {
        title: "Investment volume",
        columns: [
            { key: "year", label: "Year", type: "number", required: true },
            { key: "investment_volume", label: "Investment volume", type: "number", required: true },
        ],
    },
    annualRevenue: {
        title: "Annual revenue",
        columns: [
            { key: "year", label: "Year", type: "number", required: true },
            { key: "revenue", label: "Annual revenue", type: "number", required: true },
        ],
    },
    numberOfEmployees: {
        title: "Number of employees",
        columns: [
            { key: "year", label: "Year", type: "number", required: true },
            { key: "all", label: "All", type: "number" },
            { key: "rnd", label: "R&D", type: "number" },
            { key: "sales", label: "Sales", type: "number" },
            { key: "quality", label: "Quality", type: "number" },
            { key: "production", label: "Production", type: "number" },
        ],
    },
    sites: {
        title: "Sites",
        columns: [
            { key: "description", label: "Description", type: "text", required: true },
            { key: "divisions", label: "Divisions", type: "text" },
            { key: "working_shifts", label: "Working shifts", type: "number" },
        ],
    },
};

const YES_NO = ["Yes", "No"];
const SENT_REVIEWED = ["Sent", "Not sent", "Pending", "Completed"];

export const PROPERTY_SCHEMA: PropertySpec[] = [
    // Supplier profile
    { key: "supplier_number", label: "Supplier number", kind: "text" },
    { key: "company_name", label: "Company name", kind: "text" },
    { key: "address", label: "Address", kind: "text" },
    { key: "public_website", label: "Website", kind: "text" },
    { key: "bank_name", label: "Bank name", kind: "text" },
    { key: "iban", label: "IBAN", kind: "text" },
    { key: "bic_swift", label: "BIC/SWIFT", kind: "text" },
    { key: "account_currency", label: "Account currency", kind: "text" },

    // Legal information
    { key: "legal_form", label: "Legal form", kind: "select", options: ["GmbH", "AG", "KG", "OHG", "GbR", "Einzelunternehmen", "LLP", "Inc.", "LLC", "S.A.", "S.r.l.", "B.V."] },
    { key: "parent_company", label: "Parent company", kind: "text" },
    { key: "tax_number", label: "Tax number", kind: "text" },
    { key: "vat_id", label: "VAT ID", kind: "text" },
    { key: "year_founded", label: "Year founded", kind: "number" },

    // User defined
    { key: "order_volume_2025", label: "Order Volume 2025", kind: "number" },
    { key: "order_volume_2024", label: "Order Volume 2024", kind: "number" },
    { key: "responsible_buyer", label: "Responsible Buyer", kind: "text" },
    { key: "abc_classification", label: "ABC Classification Order Volume", kind: "select", options: ["A", "B", "C"] },
    { key: "supplier_status", label: "Supplier Status", kind: "pill", options: ["Active", "Potential Supplier", "Evaluation Process", "Rejected Supplier"] },
    { key: "area_of_need", label: "Area of Need", kind: "pill", options: ["Direct", "Indirect", "Production", "Tooling", "Services"] },
    { key: "supplier_type", label: "Supplier Type", kind: "pill", options: ["Manufacturer", "Distributor", "Service Provider"] },
    { key: "commodity_group", label: "Commodity Group", kind: "text" },
    { key: "strategic_classification", label: "Strategic Classification (Prettl Pyramid)", kind: "select", options: ["Strategic Supplier", "Preferred Supplier (P)", "Internal Supplier", "Approved Supplier", "New Supplier"] },
    { key: "ssa_sent", label: "SSA sent", kind: "select", options: SENT_REVIEWED },
    { key: "ssa_reviewed", label: "SSA reviewed", kind: "select", options: SENT_REVIEWED },
    { key: "rfq_package_approved", label: "RFQ Package Approved", kind: "boolean" },
    { key: "rfq_package_sent_out", label: "RFQ Package Sent out", kind: "boolean" },
    { key: "onboarding_audit_conducted", label: "Onboarding Audit conducted", kind: "boolean" },
    { key: "onboarding_audit", label: "Onboarding Audit", kind: "select", options: ["Passed", "Failed", "Pending", "Not required"] },
    { key: "ssa_completed", label: "SSA completed", kind: "boolean" },
    { key: "transfer_supplier_number_to_tacto", label: "Transfer supplier number to Tacto", kind: "boolean" },
    { key: "supplier_created_in_erp", label: "Supplier created in ERP", kind: "boolean" },
    { key: "rohs_note", label: "RoHS Note", kind: "text" },
    { key: "rohs_affected", label: "RoHS affected", kind: "select", options: YES_NO },
    { key: "supplier_spend", label: "Supplier spend", kind: "number" },
    { key: "rohs_relevance", label: "RoHS relevance", kind: "select", options: YES_NO },
    { key: "reach_relevance", label: "REACH relevance", kind: "select", options: YES_NO },
    { key: "reach_notes", label: "REACH Notes", kind: "text" },
    { key: "reach_affected", label: "REACH affected", kind: "select", options: YES_NO },
    { key: "core_competences", label: "Core competences – Products and Processes", kind: "multiline" },
    { key: "main_equipment", label: "Main equipment/machinery", kind: "multiline" },
    { key: "annual_purchase_volume_main_suppliers", label: "Annual purchase volume at main suppliers", kind: "list-of-rows" },
    { key: "turnover_share", label: "Turnover share Medicine/Other/Aerospace/Industry/Automotive(%)", kind: "number" },
    { key: "consignation_stock_possible", label: "Consignation stock possible", kind: "boolean" },
    { key: "customers_80_sales", label: "Customers for 80% sales", kind: "number" },
    { key: "customer_audits", label: "Customer audits", kind: "list-of-rows" },
    { key: "main_customers_share", label: "Main Customers and Share of Turnover(%)", kind: "list-of-rows" },
    { key: "number_of_customers", label: "Number of customers", kind: "number" },
    { key: "employees_engineers", label: "Employees engineers", kind: "number" },
    { key: "employees_management", label: "Employees management", kind: "number" },
    { key: "employees_direct", label: "Employees direct", kind: "number" },
    { key: "employees_indirect", label: "Employees indirect", kind: "number" },
    { key: "employees_total_prev", label: "Employees total (prev. year)", kind: "number" },
    { key: "employees_total_current", label: "Employees total (current)", kind: "number" },

    // ESG / LkSG core
    { key: "esg_internal", label: "Internal", kind: "boolean" },
    { key: "esg_risk_status", label: "ESG Risk Status", kind: "select", options: ["Low risk", "Medium risk", "High risk", "Unknown"] },
    { key: "esg_country_code", label: "Country Code", kind: "text" },
    { key: "esg_isic_code", label: "ISIC Code", kind: "text" },
    { key: "esg_analysis_progress", label: "ESG Analysis Progress", kind: "select", options: ["Waiting for SSA", "In progress", "Completed"] },
    { key: "esg_categories", label: "Categories", kind: "text" },
    { key: "esg_environmental_score", label: "Environmental Score ESG", kind: "number" },
    { key: "esg_human_score", label: "Human Rights Score ESG", kind: "number" },
    { key: "esg_workers_score", label: "Workers Rights Score ESG", kind: "number" },
    { key: "esg_concrete_risk_score", label: "Concrete Risk Score ESG", kind: "number" },
    { key: "esg_human_self_assessment", label: "Human Rights Supplier Self Assessment", kind: "select", options: ["Yes", "No", "Partial", "Pending"] },
    { key: "esg_environmental_self_assessment", label: "Environmental Supplier Self Assessment", kind: "select", options: ["Yes", "No", "Partial", "Pending"] },
    { key: "esg_workers_self_assessment", label: "Workers Rights Supplier Self Assessment", kind: "select", options: ["Yes", "No", "Partial", "Pending"] },
    { key: "esg_reporting_organisation", label: "Reporting Organisation", kind: "text" },
    { key: "esg_implementation_environmental", label: "Implementation of Environmental Rights Measures", kind: "select", options: ["Implemented", "Partially implemented", "Planned", "Not implemented"] },
    { key: "esg_implementation_human", label: "Implementation of Measures for Human Rights", kind: "select", options: ["Implemented", "Partially implemented", "Planned", "Not implemented"] },
    { key: "esg_implementation_labor", label: "Implementation of Measures for Labor Rights", kind: "select", options: ["Implemented", "Partially implemented", "Planned", "Not implemented"] },

    { key: "esg_risk_status_egb", label: "Risk Status (EGB)", kind: "select", options: ["Low risk", "Medium risk", "High risk", "Unknown"] },
    { key: "esg_analysis_progress_egb", label: "Analysis progress (EGB)", kind: "select", options: ["Waiting for SSA", "In progress", "Completed"] },
    { key: "esg_reporting_obligation", label: "Reporting Obligation", kind: "select", options: ["Yes", "No", "Unknown"] },
    { key: "esg_contact_person", label: "Contact Person", kind: "text" },
];

export const LKSG_CLAUSE_SPECS: { key: string; label: string }[] = [
    { key: "lksg_3_1", label: "3.1 Identification of a human rights or environmental risk" },
    { key: "lksg_3_2", label: "3.2 Violation of a human rights or environmental obligation" },
    { key: "lksg_4_1", label: "4.1 Responsibilities for monitoring risk" },
    { key: "lksg_4_2", label: "4.2 No Responsibilities" },
    { key: "lksg_4_3", label: "4.3 Aussageverweigerung" },
    { key: "lksg_5_1", label: "5.1 Reporting period" },
    { key: "lksg_5_2", label: "5.2 Steps and methods of risk analysis" },
    { key: "lksg_5_3", label: "5.3 Procedures for identifying violations in own business area" },
    { key: "lksg_5_4", label: "5.4 Procedure direct suppliers" },
    { key: "lksg_5_5", label: "5.5 Procedure for identifying breaches at indirect suppliers" },
    { key: "lksg_6_1", label: "6.1 Industries of the companies in own business area" },
    { key: "lksg_7_1_1", label: "7.1.1 Affiliated company" },
    { key: "lksg_7_1_2", label: "7.1.2 Reporting obligation affiliated company" },
    { key: "lksg_7_1_1_no", label: "7.1.1 (No affiliated company)" },
    { key: "lksg_7_1_3", label: "7.1.3 Head office affiliated company" },
    { key: "lksg_7_1_4", label: "7.1.4 Countries affiliated company" },
    { key: "lksg_7_1_5", label: "7.1.5 Industry related to company" },
    { key: "lksg_7_1_6", label: "7.1.6 Value creation affiliated company" },
    { key: "lksg_8_1", label: "8.1 Production countries direct suppliers" },
    { key: "lksg_8_2", label: "8.2 Number direct suppliers" },
    { key: "lksg_8_3", label: "8.3 Relevant product groups" },
    { key: "lksg_8_4", label: "8.4 Relevant Raw Materials" },
    { key: "lksg_percentage_ownership", label: "Percentage Ownership in Affiliated Company" },
    { key: "lksg_information_auditability", label: "Information on auditability" },
    { key: "lksg_bafa_report", label: "Bestätigung BAFA Report" },
    { key: "lksg_strategic_buyer", label: "Strategic Buyer" },
    { key: "lksg_statement_violations", label: "Statement on potential violations (optional)" },
    { key: "lksg_informant", label: "Informant (optional)" },
    { key: "lksg_abstract_risk_score", label: "Abstract Risk Score ESG" },
    { key: "lksg_comment_subsidiary_type", label: "Comment about Subsidiary Type" },
    { key: "lksg_address_affiliate", label: "Address of Affiliate (EGB)" },
    { key: "lksg_country_subsidiary", label: "Country of Subsidiary (EGB)" },
    { key: "lksg_subsidiary_type", label: "Subsidiary Type (EGB)" },
    { key: "lksg_affiliation_corporate_group", label: "Affiliation with the Corporate Group" },
    { key: "lksg_legal_form", label: "Legal Form" },
    { key: "lksg_comment_affiliation", label: "Comment Field for Affiliation" },
    { key: "lksg_employees_egb", label: "Number of employees (EGB)" },
    { key: "lksg_role_contact", label: "Role of Contact Person" },
    { key: "lksg_email_contact", label: "E-Mail of Contact Person" },
    { key: "lksg_website_affiliate", label: "Website of Affiliate" },
    { key: "lksg_industry_egb", label: "Industry (EGB)" },
    { key: "lksg_products_egb", label: "Products (EGB)" },
    { key: "lksg_significance_affiliate", label: "Significance of Affiliate (EGB)" },
    { key: "lksg_annual_revenue_previous", label: "Annual revenue volume (previous year)" },
    { key: "lksg_supply_chain_egb", label: "Supply Chain Management (EGB)" },
    { key: "lksg_procurement_focus_egb", label: "Procurement Focus (EGB)" },
    { key: "lksg_labor_violation", label: "Labor Rights Violation" },
    { key: "lksg_environmental_violation", label: "Environmental Rights Violation" },
    { key: "lksg_human_violation", label: "Human Rights Violation" },
    { key: "lksg_internal_note", label: "Internal note" },
    { key: "lksg_category", label: "Category" },
    { key: "lksg_captured_on", label: "Captured on" },
    { key: "lksg_sources", label: "Sources" },
    { key: "lksg_existing_knowledge", label: "Existing Knowledge & Existing Suspicion" },
    { key: "lksg_brief_justification", label: "Brief justification" },
    { key: "lksg_status", label: "Status" },
    { key: "lksg_assigned_violation", label: "Assigned violation" },
    { key: "lksg_emas", label: "EMAS" },
    { key: "lksg_emas_requested", label: "EMAS Requested" },
    { key: "lksg_iso_37001", label: "ISO 37001" },
    { key: "lksg_iso_37001_requested", label: "ISO 37001 Requested" },
];

export const CERT_GROUPS: { title: string; certs: { key: string; label: string; requested?: boolean }[] }[] = [
    {
        title: "Quality & Environment",
        certs: [
            { key: "iso_9001", label: "ISO 9001" },
            { key: "iso_14001", label: "ISO 14001" },
            { key: "iso_13485", label: "ISO 13485" },
            { key: "iso_50001", label: "ISO 50001" },
            { key: "iatf_16949", label: "IATF 16949" },
            { key: "iso_45001", label: "ISO 45001" },
            { key: "ohsas_18001", label: "OHSAS 18001" },
            { key: "din_en_iso_3834_2", label: "DIN EN ISO 3834-2" },
            { key: "ad_2000_wx", label: "AD 2000-W[X]" },
            { key: "din_en_1090_2", label: "DIN EN 1090-2" },
            { key: "iso_9000", label: "ISO 9000" },
            { key: "iso_27001", label: "ISO 27001" },
            { key: "iso_iec_80079_34", label: "ISO/IEC 80079-34" },
            { key: "en_as_9100", label: "EN/AS 9100" },
        ],
    },
    {
        title: "Industry & Sector",
        certs: [
            { key: "kat", label: "KAT" },
            { key: "brc", label: "BRC" },
            { key: "fssc", label: "FSSC" },
            { key: "vda_6_1", label: "VDA 6.1" },
            { key: "haccp", label: "HACCP" },
            { key: "iso_iec_27001", label: "ISO/IEC 27001" },
            { key: "mmog", label: "MMOG" },
            { key: "ifs", label: "IFS" },
            { key: "sedex_smeta", label: "SEDEX/SMETA" },
            { key: "halal", label: "Halal" },
            { key: "kosher", label: "Kosher" },
            { key: "iso_26000", label: "ISO 26000" },
            { key: "icti_ietp", label: "ICTI (IETP)" },
            { key: "amfori_bsci", label: "amfori BSCI" },
            { key: "sa_8000", label: "SA 8000" },
            { key: "tisax", label: "TISAX" },
            { key: "din_en_1090_3", label: "DIN EN 1090-3" },
            { key: "din_en_iso_3834", label: "DIN EN ISO 3834" },
            { key: "iso_17025", label: "ISO 17025" },
        ],
    },
    {
        title: "Agreements & Compliance",
        certs: [
            { key: "agb", label: "Allgemeine Einkaufsbedingungen (General Terms)" },
            { key: "entsorgung", label: "Entsorgungsfachbetrieb Zertifikat (Waste Disposal Cert)" },
            { key: "langzeit", label: "Langzeitlieferantenerklärung (Long-term Supplier Declaration)" },
            { key: "qsv", label: "Qualitätssicherungsvereinbarung (Quality Assurance Agreement)" },
            { key: "rahmenvertrag", label: "Rahmenvertrag (Framework Agreement)" },
            { key: "reach", label: "REACH" },
            { key: "rohs", label: "RoHS" },
            { key: "verhaltenskodex", label: "Verhaltenskodex (Code of Conduct)" },
            { key: "verhaltenskodex_requested", label: "Verhaltenskodex Requested" },
            { key: "nda", label: "Vertraulichkeitsvereinbarung (NDA)" },
        ],
    },
];

export const LKSG_TOPICS = [
    "Forced_Labor",
    "Child_Labor",
    "Slavery",
    "Security_Forces",
    "Eviction_Violation",
    "Association_Violation",
    "Unequal_Employment_Violation",
    "Wage_Violation",
    "Occupational_Safety_Violation",
    "Mercury_Violation",
    "Waste_Violation",
    "Environment_Violation",
    "Chemicals_Violation",
] as const;

export const LP_NUMBERS = [1, 2, 3] as const;
export const LP_GROUPING: Record<number, string[]> = {
    1: ["Forced_Labor", "Child_Labor", "Slavery"],
    2: ["Wage_Violation", "Occupational_Safety_Violation", "Association_Violation", "Unequal_Employment_Violation"],
    3: ["Environment_Violation", "Mercury_Violation", "Waste_Violation", "Chemicals_Violation", "Eviction_Violation", "Security_Forces"],
};

export const TOPIC_LABELS: Record<(typeof LKSG_TOPICS)[number], string> = {
    Forced_Labor: "Forced Labor",
    Child_Labor: "Child Labor",
    Slavery: "Slavery",
    Security_Forces: "Security Forces",
    Eviction_Violation: "Eviction Violation",
    Association_Violation: "Association Violation",
    Unequal_Employment_Violation: "Unequal Employment Violation",
    Wage_Violation: "Wage Violation",
    Occupational_Safety_Violation: "Occupational Safety Violation",
    Mercury_Violation: "Mercury Violation",
    Waste_Violation: "Waste Violation",
    Environment_Violation: "Environment Violation",
    Chemicals_Violation: "Chemicals Violation",
};
