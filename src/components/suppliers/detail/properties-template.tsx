"use client";

import * as React from "react";
import {
    Building2,
    Globe2,
    Scale,
    Search,
    Database,
    Globe,
    ShieldCheck,
    Leaf,
    ClipboardList,
    Save,
    Loader2,
    Check,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SupplierHeader } from "./supplier-header";
import { Section } from "./section";
import { PropertyRow, type PropertyField } from "./property-row";
import { KeyFigureTable } from "./key-figure-table";
import { CertificationsBlock, type CertValue, type CertSection } from "./certifications-block";
import {
    LKSG_CLAUSE_SPECS,
    CERT_GROUPS,
    LKSG_TOPICS,
    LP_NUMBERS,
    LP_GROUPING,
    TOPIC_LABELS,
} from "./property-schema";
import { isNonEmpty } from "./styling";
import { toast } from "sonner";

export interface PropertiesSupplier {
    id: string;
    supplierNumber?: string | null;
    name: string;
    countryCode?: string | null;
    countryName?: string | null;
    city?: string | null;
    website?: string | null;
    [key: string]: unknown;
}

export interface PropertiesTemplateProps {
    supplier: PropertiesSupplier;
    values: Record<string, unknown>;
    tables?: {
        investmentVolume?: Array<Record<string, unknown>>;
        annualRevenue?: Array<Record<string, unknown>>;
        numberOfEmployees?: Array<Record<string, unknown>>;
        sites?: Array<Record<string, unknown>>;
    };
    certValues?: Record<string, CertValue | undefined>;
    onCommit?: (key: string, value: unknown) => void;
    onAddTable?: (table: string, row: Record<string, unknown>) => void;
    onEditTable?: (table: string, index: number, row: Record<string, unknown>) => void;
    onRemoveTable?: (table: string, index: number) => void;
    onCommitCert?: (key: string, value: CertValue) => void;
    breadcrumbLabel?: string;
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={cn(
                "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                checked ? "bg-emerald-500" : "bg-slate-300",
            )}
        >
            <span
                className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    checked ? "translate-x-4" : "translate-x-0.5",
                )}
            />
        </button>
    );
}

export function PropertiesTemplate(props: PropertiesTemplateProps) {
    const { supplier, values, tables, certValues, breadcrumbLabel } = props;
    const supplierNumber = supplier.supplierNumber ?? supplier.id;
    const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
    const [search, setSearch] = React.useState("");
    const router = useRouter();
    const searchParams = useSearchParams();
    const [onlyWithValues, setOnlyWithValues] = React.useState<boolean>(
        () => searchParams?.get("onlyWithValues") === "1" || searchParams?.get("onlyWithValues") === "true",
    );

    const storageKey = React.useMemo(
        () => `supplier-properties-draft:${supplierNumber}`,
        [supplierNumber],
    );

    const [draftValues, setDraftValues] = React.useState<Record<string, unknown>>(() => {
        if (typeof window === "undefined") return {};
        try {
            const raw = window.localStorage.getItem(storageKey);
            return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
        } catch {
            return {};
        }
    });
    const [isSaving, setIsSaving] = React.useState(false);

    React.useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            window.localStorage.setItem(storageKey, JSON.stringify(draftValues));
        } catch {
            // ignore quota / serialization errors
        }
    }, [draftValues, storageKey]);

    const currentValues = React.useMemo(
        () => ({ ...values, ...draftValues }),
        [values, draftValues],
    );

    const dirtyCount = Object.keys(draftValues).length;

    const updateOnlyWithValues = React.useCallback(
        (next: boolean) => {
            setOnlyWithValues(next);
            const params = new URLSearchParams(searchParams?.toString() ?? "");
            if (next) {
                params.set("onlyWithValues", "1");
            } else {
                params.delete("onlyWithValues");
            }
            const query = params.toString();
            router.replace(query ? `?${query}` : "?", { scroll: false });
        },
        [router, searchParams],
    );

    const handleSave = React.useCallback(async () => {
        if (Object.keys(draftValues).length === 0) return;
        setIsSaving(true);
        try {
            props.onCommit?.("_batch", draftValues);
            await new Promise((resolve) => setTimeout(resolve, 250));
            if (typeof window !== "undefined") {
                window.localStorage.setItem(storageKey, JSON.stringify(draftValues));
            }
            const count = Object.keys(draftValues).length;
            toast.success(`Saved ${count} propert${count === 1 ? "y" : "ies"}`);
            setDraftValues({});
            router.refresh();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to save properties");
        } finally {
            setIsSaving(false);
        }
    }, [draftValues, props, router, storageKey]);

    const matchesSearch = (label: string, value: unknown) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        const v = Array.isArray(value) ? value.join(" ") : String(value ?? "");
        return label.toLowerCase().includes(q) || v.toLowerCase().includes(q);
    };

    const field = (key: string, label: string, kind: PropertyField["kind"], extra: Partial<PropertyField> = {}): PropertyField => ({
        key,
        label,
        value: currentValues[key],
        kind,
        ...extra,
        onCommit: (v) => {
            setDraftValues((prev) => ({ ...prev, [key]: v }));
        },
    });

    const filterFields = (rows: PropertyField[]) =>
        rows.filter((f) => {
            if (onlyWithValues && !isNonEmpty(f.value)) return false;
            if (search.trim() && !matchesSearch(f.label, f.value)) return false;
            return true;
        });

    const supplierProfile: PropertyField[] = [
        field("supplier_number", "Supplier number", "text", { hasHistory: true }),
        field("company_name", "Company name", "text", { hasHistory: true }),
        field("address", "Address", "text", { hasHistory: true }),
        field("public_website", "Website", "text", { hasHistory: true }),
        field("bank_name", "Bank name", "text", { hasHistory: true }),
        field("iban", "IBAN", "text", { hasHistory: true }),
        field("bic_swift", "BIC/SWIFT", "text", { hasHistory: true }),
        field("account_currency", "Account currency", "text", { hasHistory: true }),
    ];

    const legalFields: PropertyField[] = [
        field("legal_form", "Legal form", "select", { options: ["GmbH", "AG", "KG", "OHG", "GbR", "Einzelunternehmen", "Inc.", "LLC"] }),
        field("parent_company", "Parent company", "text"),
        field("tax_number", "Tax number", "text"),
        field("vat_id", "VAT ID", "text"),
        field("year_founded", "Year founded", "number"),
    ];

    const userDefinedFields: PropertyField[] = [
        field("order_volume_2025", "Order Volume 2025", "number", { hasHistory: true }),
        field("order_volume_2024", "Order Volume 2024", "number", { hasHistory: true }),
        field("responsible_buyer", "Responsible Buyer", "text"),
        field("abc_classification", "ABC Classification Order Volume", "select", { options: ["A", "B", "C"] }),
        field("supplier_status", "Supplier Status", "pill", { pillClass: "bg-emerald-50 text-emerald-700 border-emerald-200" }),
        field("area_of_need", "Area of Need", "pill", { pillClass: "bg-blue-50 text-blue-700 border-blue-200" }),
        field("supplier_type", "Supplier Type", "pill", { pillClass: "bg-violet-50 text-violet-700 border-violet-200" }),
        field("commodity_group", "Commodity Group", "text"),
        field("strategic_classification", "Strategic Classification (Prettl Pyramid)", "select", { options: ["Strategic Supplier", "Preferred Supplier (P)", "Internal Supplier", "Approved Supplier", "New Supplier"] }),
        field("ssa_sent", "SSA sent", "select", { options: ["Sent", "Not sent", "Pending"] }),
        field("ssa_reviewed", "SSA reviewed", "select", { options: ["Reviewed", "Pending", "Not reviewed"] }),
        field("rfq_package_approved", "RFQ Package Approved", "boolean"),
        field("rfq_package_sent_out", "RFQ Package Sent out", "boolean"),
        field("onboarding_audit_conducted", "Onboarding Audit conducted", "boolean"),
        field("onboarding_audit", "Onboarding Audit", "select", { options: ["Passed", "Failed", "Pending", "Not required"] }),
        field("ssa_completed", "SSA completed", "boolean"),
        field("transfer_supplier_number_to_tacto", "Transfer supplier number to Tacto", "boolean"),
        field("supplier_created_in_erp", "Supplier created in ERP", "boolean"),
        field("rohs_note", "RoHS Note", "text"),
        field("rohs_affected", "RoHS affected", "select", { options: ["Yes", "No"] }),
        field("supplier_spend", "Supplier spend", "number"),
        field("rohs_relevance", "RoHS relevance", "select", { options: ["Yes", "No"] }),
        field("reach_relevance", "REACH relevance", "select", { options: ["Yes", "No"] }),
        field("reach_notes", "REACH Notes", "text"),
        field("reach_affected", "REACH affected", "select", { options: ["Yes", "No"] }),
        field("core_competences", "Core competences – Products and Processes", "multiline"),
        field("main_equipment", "Main equipment/machinery", "multiline"),
        field("annual_purchase_volume_main_suppliers", "Annual purchase volume at main suppliers", "list-of-rows"),
        field("turnover_share", "Turnover share Medicine/Other/Aerospace/Industry/Automotive(%)", "number"),
        field("consignation_stock_possible", "Consignation stock possible", "boolean"),
        field("customers_80_sales", "Customers for 80% sales", "number"),
        field("customer_audits", "Customer audits", "list-of-rows"),
        field("main_customers_share", "Main Customers and Share of Turnover(%)", "list-of-rows"),
        field("number_of_customers", "Number of customers", "number"),
        field("employees_engineers", "Employees engineers", "number"),
        field("employees_management", "Employees management", "number"),
        field("employees_direct", "Employees direct", "number"),
        field("employees_indirect", "Employees indirect", "number"),
        field("employees_total_prev", "Employees total (prev. year)", "number"),
        field("employees_total_current", "Employees total (current)", "number"),
    ];

    // role contact blocks
    const roleContactFields: PropertyField[] = [];
    const roles = [
        "Order",
        "Emergency",
        "Purchasing",
        "Complaints",
        "Quality",
        "Engineering",
        "Logistic",
        "Sales",
        "CEO",
    ];
    roles.forEach((role) => {
        ["phone", "email", "name_planned_site"].forEach((sub) => {
            roleContactFields.push(
                field(
                    `contact_${role.toLowerCase()}_${sub}`,
                    `${role} ${sub.replace("_", " / ")} (planned site)`,
                    "text",
                ),
            );
        });
    });
    roleContactFields.push(
        field("production_site_contact_phone", "Production site contact phone", "text"),
        field("production_site_contact_email", "Production site contact e-mail", "text"),
        field("production_site_contact_name", "Production site contact name", "text"),
        field("production_site_country", "Production site Country", "text"),
        field("production_site_area_m2", "Production site area (m²)", "number"),
        field("production_site_postal_city", "Production site postal code & city", "text"),
        field("production_site_company_name", "Production site Company name", "text"),
        field("insurance_no", "Insurance No.", "number"),
        field("amount_insured", "Amount insured", "number"),
        field("location_headquarter", "Location headquarter", "text"),
        field("local_trade_register", "Local trade register", "text"),
        field("insurer", "Insurer", "text"),
        field("duns_no", "D-U-N-S-No.", "number"),
        field("year_established", "Year established", "number"),
        field("eori_no", "EORI-No.", "number"),
    );

    const esgCoreFields: PropertyField[] = [
        field("esg_internal", "Internal", "boolean"),
        field("esg_risk_status", "ESG Risk Status", "select", { options: ["Low risk", "Medium risk", "High risk", "Unknown"] }),
        field("esg_country_code", "Country Code", "text"),
        field("esg_isic_code", "ISIC Code", "text"),
        field("esg_analysis_progress", "ESG Analysis Progress", "select", { options: ["Waiting for SSA", "In progress", "Completed"] }),
        field("esg_categories", "Categories", "text"),
        field("esg_environmental_score", "Environmental Score ESG", "number"),
        field("esg_human_score", "Human Rights Score ESG", "number"),
        field("esg_workers_score", "Workers Rights Score ESG", "number"),
        field("esg_concrete_risk_score", "Concrete Risk Score ESG", "number"),
        field("esg_human_self_assessment", "Human Rights Supplier Self Assessment", "select", { options: ["Yes", "No", "Partial", "Pending"] }),
        field("esg_environmental_self_assessment", "Environmental Supplier Self Assessment", "select", { options: ["Yes", "No", "Partial", "Pending"] }),
        field("esg_workers_self_assessment", "Workers Rights Supplier Self Assessment", "select", { options: ["Yes", "No", "Partial", "Pending"] }),
        field("esg_reporting_organisation", "Reporting Organisation", "text"),
        field("esg_implementation_environmental", "Implementation of Environmental Rights Measures", "select", { options: ["Implemented", "Partially implemented", "Planned", "Not implemented"] }),
        field("esg_implementation_human", "Implementation of Measures for Human Rights", "select", { options: ["Implemented", "Partially implemented", "Planned", "Not implemented"] }),
        field("esg_implementation_labor", "Implementation of Measures for Labor Rights", "select", { options: ["Implemented", "Partially implemented", "Planned", "Not implemented"] }),
        field("esg_risk_status_egb", "Risk Status (EGB)", "select", { options: ["Low risk", "Medium risk", "High risk", "Unknown"] }),
        field("esg_analysis_progress_egb", "Analysis progress (EGB)", "select", { options: ["Waiting for SSA", "In progress", "Completed"] }),
        field("esg_reporting_obligation", "Reporting Obligation", "select", { options: ["Yes", "No", "Unknown"] }),
        field("esg_contact_person", "Contact Person", "text"),
    ];

    const lksgClauseFields: PropertyField[] = LKSG_CLAUSE_SPECS.map((s) =>
        field(s.key, s.label, s.key.startsWith("lksg_8_2") || s.key === "lksg_abstract_risk_score" || s.key === "lksg_employees_egb" || s.key === "lksg_annual_revenue_previous" || s.key === "lksg_percentage_ownership" ? "number" : "text"),
    );

    const lksgMitigationFields: PropertyField[] = [
        field("esg_risk_assessment_labor", "Risk Assessment Labor Rights", "select", { options: ["Low", "Medium", "High", "Not evaluated"] }),
        field("esg_reasoning_labor", "Reasoning for Risk Assessment of Labor Rights", "text"),
        field("esg_risk_assessment_human", "Risk Assessment Human Rights", "select", { options: ["Low", "Medium", "High", "Not evaluated"] }),
        field("esg_reasoning_human", "Reasoning for Risk Assessment of Human Rights", "text"),
        field("esg_risk_assessment_environmental", "Risk Assessment Environmental Rights", "select", { options: ["Low", "Medium", "High", "Not evaluated"] }),
        field("esg_reasoning_environmental", "Reasoning for Risk Assessment of Environmental Rights", "text"),
    ];

    const lpFields: PropertyField[] = [];
    LP_NUMBERS.forEach((n) => {
        ["Appropriateness_Causation", "Influence_1", "Severity", "Likelihood"].forEach((suffix) => {
            lpFields.push(
                field(
                    `lp_${n}_${suffix.toLowerCase()}`,
                    `LP_${n} ${suffix.replace(/_/g, " ")}`,
                    "select",
                    { options: ["Low", "Medium", "High", "Not evaluated"] },
                ),
            );
        });
    });

    const lksgFinalFields: PropertyField[] = [
        field("esg_human_score_final", "Human Rights Score", "number"),
        field("esg_environmental_score_final", "Environmental Rights Score", "number"),
        field("esg_workers_score_final", "Workers Rights Score", "number"),
        field("esg_score_mitigation", "Score with Mitigation Factors", "number"),
        field("esg_industry_score", "Industry Score", "number"),
        field("esg_country_score", "Country Score", "number"),
        field("esg_appropriateness_1", "Appropriateness factor (between 0.5 and 1...)", "number"),
        field("esg_appropriateness_2", "Appropriateness factor (between 0.5 and 1...)", "number"),
        field("esg_appropriateness_3", "Appropriateness factor (between 0.5 and 1...)", "number"),
        field("esg_risk_analysis_skipped_comment", "Risk analysis skipped – comment", "text"),
        field("esg_skip_risk_analysis", "Skip risk analysis", "select", { options: ["Yes", "No"] }),
        field("esg_risk_analysis_doc", "Risk analysis skipped – Document", "file"),
        field("esg_attachment_dropzone", "Attachment Dropzone", "file"),
        field("esg_comment", "Comment", "text"),
        field("esg_risk_status_workers", "Risk Status Workers Rights", "select", { options: ["Low risk", "Medium risk", "High risk", "Unknown"] }),
        field("esg_risk_status_human", "Risk Status Human Rights", "select", { options: ["Low risk", "Medium risk", "High risk", "Unknown"] }),
        field("esg_risk_status_environmental", "Risk Status Environmental Rights", "select", { options: ["Low risk", "Medium risk", "High risk", "Unknown"] }),
    ];

    const lpTopicFields: PropertyField[] = [];
    LP_NUMBERS.forEach((n) => {
        LKSG_TOPICS.forEach((topic) => {
            const topicLabel = TOPIC_LABELS[topic];
            lpTopicFields.push(
                field(
                    `lksg_lp_${n}_q_${topic}_process_2025_wahl`,
                    `lksg_lp_${n}_q_${topic}_process_2025_wahl`,
                    "select",
                    { options: ["Yes", "No", "Partial", "Not evaluated"] },
                ),
            );
            lpTopicFields.push(
                field(
                    `lp_${n}_q_${topic}`,
                    `[LP_${n}_Q_${topicLabel}] Does your company violate/use...`,
                    "select",
                    { options: ["Yes", "No", "Partial", "Not evaluated"] },
                ),
            );
            lpTopicFields.push(field(`lp_${n}_${topic}_1`, `(1) Violations of ${topicLabel}`, "select", { options: ["Yes", "No", "Not evaluated"] }));
            lpTopicFields.push(field(`lp_${n}_${topic}_2`, `(2) Main Causes for ${topicLabel} Violations`, "text"));
            lpTopicFields.push(field(`lp_${n}_${topic}_3`, `(3) Processes against ${topicLabel} Risks`, "select", { options: ["Yes", "No", "Partial", "Not evaluated"] }));
            lpTopicFields.push(field(`lp_${n}_${topic}_4`, `(4) Process Description(s) against/for ${topicLabel}`, "text"));
            lpTopicFields.push(field(`lp_${n}_${topic}_5`, `(5) Effectiveness Rating ${topicLabel}`, "select", { options: ["Effective", "Partially effective", "Ineffective", "Not evaluated"] }));
            lpTopicFields.push(field(`lp_${n}_${topic}_6`, `(6) Effectiveness/Effectivenesss Description of ${topicLabel}`, "text"));
        });
    });

    const standaloneAssessmentFields: PropertyField[] = [
        field("esg_ssa", "ESG Risk Analysis – Supplier Self-Assessment", "text", { editable: false }),
        field("esg_occasion", "Occasion-based", "text", { editable: false }),
        field("esg_own_business", "Own Business Areas", "text", { editable: false }),
        field("esg_mitigation", "Mitigation Factors & ...", "text", { editable: false }),
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <SupplierHeader
                supplier={supplier}
                section="properties"
                supplierNumber={supplierNumber}
                sidebarCollapsed={sidebarCollapsed}
                onToggleSidebar={() => setSidebarCollapsed((c) => !c)}
                currentLabel={breadcrumbLabel}
            />
            <div className="mx-auto max-w-7xl px-6 py-4">
                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="relative min-w-[260px] flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search properties..."
                            className="pl-9"
                        />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                        Only show properties with values
                        <Toggle checked={onlyWithValues} onChange={updateOnlyWithValues} />
                    </label>
                    <div className="flex items-center gap-2">
                        {dirtyCount > 0 ? (
                            <span className="text-xs font-medium text-amber-600">
                                {dirtyCount} unsaved change{dirtyCount === 1 ? "" : "s"}
                            </span>
                        ) : null}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setDraftValues({});
                                toast.success("Reverted unsaved changes");
                            }}
                            disabled={dirtyCount === 0 || isSaving}
                        >
                            Revert
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSave}
                            disabled={dirtyCount === 0 || isSaving}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            {isSaving ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : dirtyCount === 0 ? (
                                <Check className="mr-2 h-4 w-4" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            {dirtyCount === 0 ? "Saved" : "Save"}
                        </Button>
                    </div>
                </div>

                <div className="mt-4 space-y-4">
                    {(() => {
                        const filteredSupplierProfile = filterFields(supplierProfile);
                        if (filteredSupplierProfile.length === 0) return null;
                        return (
                            <Section title="Supplier profile" icon={Building2}>
                                <RowsRenderer rows={filteredSupplierProfile} />
                            </Section>
                        );
                    })()}

                    {(() => {
                        const filteredLegal = filterFields(legalFields);
                        if (filteredLegal.length === 0) return null;
                        return (
                            <Section title="Legal information" icon={Scale}>
                                <RowsRenderer rows={filteredLegal} />
                            </Section>
                        );
                    })()}

                    <Section title="Supplier key figures" icon={Database}>
                        <div className="space-y-4 p-4">
                            <KeyFigureTable
                                title="Investment volume"
                                columns={[
                                    { key: "year", label: "Year", type: "number", required: true },
                                    { key: "investment_volume", label: "Investment volume", type: "number", required: true },
                                ]}
                                rows={tables?.investmentVolume ?? []}
                                onAdd={(r) => props.onAddTable?.("investmentVolume", r)}
                                onEdit={(i, r) => props.onEditTable?.("investmentVolume", i, r)}
                                onRemove={(i) => props.onRemoveTable?.("investmentVolume", i)}
                                emptyHint="No investment volume entries."
                            />
                            <KeyFigureTable
                                title="Annual revenue"
                                columns={[
                                    { key: "year", label: "Year", type: "number", required: true },
                                    { key: "revenue", label: "Annual revenue", type: "number", required: true },
                                ]}
                                rows={tables?.annualRevenue ?? []}
                                onAdd={(r) => props.onAddTable?.("annualRevenue", r)}
                                onEdit={(i, r) => props.onEditTable?.("annualRevenue", i, r)}
                                onRemove={(i) => props.onRemoveTable?.("annualRevenue", i)}
                                emptyHint="No annual revenue entries."
                            />
                            <KeyFigureTable
                                title="Number of employees"
                                columns={[
                                    { key: "year", label: "Year", type: "number", required: true },
                                    { key: "all", label: "All", type: "number" },
                                    { key: "rnd", label: "R&D", type: "number" },
                                    { key: "sales", label: "Sales", type: "number" },
                                    { key: "quality", label: "Quality", type: "number" },
                                    { key: "production", label: "Production", type: "number" },
                                ]}
                                rows={tables?.numberOfEmployees ?? []}
                                onAdd={(r) => props.onAddTable?.("numberOfEmployees", r)}
                                onEdit={(i, r) => props.onEditTable?.("numberOfEmployees", i, r)}
                                onRemove={(i) => props.onRemoveTable?.("numberOfEmployees", i)}
                                emptyHint="No employee entries."
                            />
                        </div>
                    </Section>

                    <Section title="Sites" icon={Globe}>
                        <div className="p-4">
                            <KeyFigureTable
                                title="Sites"
                                columns={[
                                    { key: "description", label: "Description", type: "text", required: true },
                                    { key: "divisions", label: "Divisions", type: "text" },
                                    { key: "working_shifts", label: "Working shifts", type: "number" },
                                ]}
                                rows={tables?.sites ?? []}
                                onAdd={(r) => props.onAddTable?.("sites", r)}
                                onEdit={(i, r) => props.onEditTable?.("sites", i, r)}
                                onRemove={(i) => props.onRemoveTable?.("sites", i)}
                                emptyHint="No sites yet."
                            />
                        </div>
                    </Section>

                    {(() => {
                        const filteredUserDefined = filterFields(userDefinedFields);
                        const filteredRoleContact = filterFields(roleContactFields);
                        if (filteredUserDefined.length === 0 && filteredRoleContact.length === 0) return null;
                        return (
                            <Section title="User defined properties" icon={Globe2}>
                                {filteredUserDefined.length > 0 ? (
                                    <RowsRenderer rows={filteredUserDefined} />
                                ) : null}
                                {filteredRoleContact.length > 0 ? (
                                    <div className="border-t border-slate-100 p-4">
                                        <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                            Production site & contacts
                                        </h4>
                                        <RowsRenderer rows={filteredRoleContact} />
                                    </div>
                                ) : null}
                            </Section>
                        );
                    })()}

                    <Section title="Certifications" icon={ShieldCheck}>
                        <div className="space-y-3 p-4">
                            <CertificationsBlock
                                sections={CERT_GROUPS as CertSection[]}
                                values={certValues ?? {}}
                                onCommit={props.onCommitCert}
                            />
                        </div>
                    </Section>

                    {(() => {
                        const filteredEsg = filterFields(esgCoreFields);
                        const filteredLksgClauses = filterFields(lksgClauseFields);
                        const filteredRiskAssess = filterFields(lksgMitigationFields);
                        const filteredLp = filterFields(lpFields);
                        const filteredFinal = filterFields(lksgFinalFields);
                        if (
                            filteredEsg.length === 0 &&
                            filteredLksgClauses.length === 0 &&
                            filteredRiskAssess.length === 0 &&
                            filteredLp.length === 0 &&
                            filteredFinal.length === 0
                        )
                            return null;
                        return (
                            <Section title="ESG / LkSG core" icon={Leaf}>
                                {filteredEsg.length > 0 ? <RowsRenderer rows={filteredEsg} /> : null}
                                {filteredLksgClauses.length > 0 ? (
                                    <div className="border-t border-slate-100 p-4">
                                        <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                            LkSG clauses
                                        </h4>
                                        <RowsRenderer rows={filteredLksgClauses} />
                                    </div>
                                ) : null}
                                {filteredRiskAssess.length > 0 ? (
                                    <div className="border-t border-slate-100 p-4">
                                        <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                            Risk assessments
                                        </h4>
                                        <RowsRenderer rows={filteredRiskAssess} />
                                    </div>
                                ) : null}
                                {filteredLp.length > 0 ? (
                                    <div className="border-t border-slate-100 p-4">
                                        <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                            LP factors
                                        </h4>
                                        <RowsRenderer rows={filteredLp} />
                                    </div>
                                ) : null}
                                {filteredFinal.length > 0 ? (
                                    <div className="border-t border-slate-100 p-4">
                                        <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                            Final scoring
                                        </h4>
                                        <RowsRenderer rows={filteredFinal} />
                                    </div>
                                ) : null}
                            </Section>
                        );
                    })()}

                    {(() => {
                        const filteredStandalone = filterFields(standaloneAssessmentFields);
                        const lpSections = LP_NUMBERS.map((n) => {
                            const groupTopics = LP_GROUPING[n] ?? [];
                            const filteredTopicRows: { topic: string; fields: PropertyField[] }[] = [];
                            for (const topic of groupTopics) {
                                const topicLabel = TOPIC_LABELS[topic as keyof typeof TOPIC_LABELS];
                                const fields: PropertyField[] = filterFields(
                                    lpTopicFields.filter((f) => f.key.includes(`_${n}_`) && f.key.includes(topic)),
                                );
                                if (fields.length === 0 && search.trim()) continue;
                                filteredTopicRows.push({ topic: topicLabel, fields });
                            }
                            return { n, topicRows: filteredTopicRows };
                        });
                        const anyLpContent = lpSections.some((s) => s.topicRows.length > 0);
                        if (filteredStandalone.length === 0 && !anyLpContent) return null;
                        return (
                            <Section title="LkSG questionnaire" icon={ClipboardList}>
                                <div className="space-y-3 p-4">
                                    {anyLpContent
                                        ? lpSections.map(({ n, topicRows }) => {
                                              if (topicRows.length === 0) return null;
                                              const groupTopics = LP_GROUPING[n] ?? [];
                                              return (
                                                  <div
                                                      key={n}
                                                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                                                  >
                                                      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2">
                                                          <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                                                              LP_{n}
                                                          </h4>
                                                          <span className="text-[11px] text-slate-400">
                                                              {groupTopics.length} topics
                                                          </span>
                                                      </div>
                                                      <div className="space-y-2 p-3">
                                                          {topicRows.map(({ topic, fields }) => (
                                                              <div
                                                                  key={topic}
                                                                  className="rounded-lg border border-slate-200"
                                                              >
                                                                  <div className="border-b border-slate-100 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                                                      {topic}
                                                                  </div>
                                                                  <RowsRenderer rows={fields} />
                                                              </div>
                                                          ))}
                                                      </div>
                                                  </div>
                                              );
                                          })
                                        : null}
                                    {filteredStandalone.length > 0 ? (
                                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                                            <div className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-slate-500">
                                                Standalone assessments
                                            </div>
                                            <RowsRenderer rows={filteredStandalone} />
                                        </div>
                                    ) : null}
                                </div>
                            </Section>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
}

function RowsRenderer({ rows }: { rows: PropertyField[] }) {
    if (rows.length === 0) {
        return <div className="px-4 py-3 text-sm text-slate-400">No matching properties.</div>;
    }
    return (
        <div>
            {rows.map((f) => (
                <PropertyRow key={f.key} field={f} />
            ))}
        </div>
    );
}
