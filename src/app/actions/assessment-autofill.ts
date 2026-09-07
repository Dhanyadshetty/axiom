"use server";

import { db } from "@/db";
import {
    assessmentRequests,
    assessmentRequestSuppliers,
    assessmentResponses,
    contacts,
    suppliers,
    assessmentTemplates,
} from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { auth } from "@/auth";
import type { AssessmentTemplateSchema } from "@/lib/assessment-templates/types";
import { PMA_SEED } from "@/components/suppliers/detail/pma-seed";
import pmaSchema from "@/lib/assessment-templates/supplier-self-assessment-pma-code-of-conduct.json";
import { getBundledTemplateSchema } from "@/lib/assessment-templates";

/**
 * Bundled schema fallback. Mirrors `schemaForCategory` in
 * `external-assessments.ts` / `assessments.ts` — when `assessment_templates.config`
 * is empty we still know the field structure from the bundled JSON file.
 */
function schemaForCategory(category: string | null): AssessmentTemplateSchema | null {
    return (
        getBundledTemplateSchema(category) ??
        (pmaSchema as unknown as AssessmentTemplateSchema)
    );
}

/**
 * If the supplier matches the seeded "test Lieferant PMA" (by name/number)
 * and its DB profile is empty, hydrate the in-memory profile with the
 * canonical PMA seed so the autofill still produces values.
 */
function pmaFallbackProfile(
    supplier: { name: string | null; supplierNumber: string | null }
): Record<string, unknown> | null {
    const norm = (v: string | null | undefined) =>
        (v ?? "").trim().toLowerCase();
    const isPma =
        norm(supplier.supplierNumber) === "pma-9001" ||
        norm(supplier.name).includes("pma");
    return isPma ? { ...PMA_SEED.properties } : null;
}

/**
 * Map between the nested seed profile shape (used by
 * `scripts/seed-test-supplier.ts`) and the flat keys the form schema
 * expects. Without this, the auto-fill sees an empty profile because the
 * supplier's `profile` jsonb stores
 * `profile.general_information.company_name` instead of `company_name`.
 */
const NESTED_SEED_TO_FLAT: Record<string, string> = {
    "general_information.company_name": "company_name",
    "general_information.address": "address",
    "general_information.public_website": "website",
    "general_information.location_headquarter": "headquarters_location",
    "general_information.local_trade_register": "trade_register_entry",
    "general_information.duns_number": "duns_number",
    "general_information.eori_number": "eori_number",
    "general_information.vat_id": "vat_id",
    "bank_account.bank_name": "bank_name",
    "bank_account.iban": "iban",
    "bank_account.bic_swift": "bic_swift",
    "bank_account.account_currency": "currency",
    "insurance.insurer": "insurer_name",
    "insurance.insurance_no": "insurance_number",
    "insurance.amount_insured": "insured_amount",
};

/**
 * Map between alternative keys used in `src/components/suppliers/detail/pma-seed.ts`
 * (flat profile jsonb) and the canonical keys the PMA template schema expects.
 * The seed calls them `tax_number`, `year_founded`, `public_website`, …;
 * the schema uses `tax_id`, `foundation_year`, `website`, …. Without this
 * aliasing the auto-fill silently drops most fields.
 */
const FLAT_SEED_ALIASES: Record<string, string> = {
    tax_number: "tax_id",
    year_founded: "foundation_year",
    year_established: "foundation_year",
    public_website: "website",
    location_headquarter: "headquarters_location",
    eori_no: "eori_number",
    duns_no: "duns_number",
    local_trade_register: "trade_register_entry",
    account_currency: "currency",
    insurer: "insurer_name",
    insurance_no: "insurance_number",
    amount_insured: "insured_amount",
    production_site_contact_name: "production_site_details.contact_person_name",
    production_site_contact_email: "production_site_details.contact_email",
    production_site_contact_phone: "production_site_details.contact_phone",
    production_site_country: "production_site_details.country",
    production_site_postal_city: "production_site_details.postal_code_city",
    production_site_area_m2: "production_site_details.production_area",
    production_site_company_name: "production_site_details.company_name",
    employees_total_prev: "previous_year_total",
    employees_total_current: "current_year_total",
    employees_direct: "direct_employees",
    employees_indirect: "indirect_employees",
    employees_management: "management_employees",
    employees_engineers: "engineering_employees",
    number_of_customers: "total_customers",
    main_customers_share: "top_customers_list",
    customer_audits: "recent_audits",
    annual_purchase_volume_main_suppliers: "main_suppliers_list",
    main_equipment: "equipment_list",
    core_competences: "core_products_description",
    commodity_group: "commodity_groups",
};

/**
 * Transform a flat `sites` array (from `PMA_SEED.tables.sites`) into the
 * `sites_table` shape the PMA schema expects (columns: `site`,
 * `divisions`, `shifts`).
 */
function buildSitesTable(sites: unknown): Array<Record<string, unknown>> | null {
    if (!Array.isArray(sites) || sites.length === 0) return null;
    return sites
        .filter((s) => s && typeof s === "object")
        .map((s) => {
            const row = s as Record<string, unknown>;
            return {
                site: asString(row.site) ?? asString(row.description) ?? "",
                divisions: Array.isArray(row.divisions)
                    ? (row.divisions as string[])
                    : row.divisions
                    ? [String(row.divisions)]
                    : [],
                shifts:
                    typeof row.working_shifts === "number"
                        ? [String(row.working_shifts)]
                        : Array.isArray(row.shifts)
                        ? (row.shifts as string[])
                        : [],
            };
        })
        .filter((r) => r.site);
}

/**
 * Transform `annualRevenue` rows (from `PMA_SEED.tables.annualRevenue`) into
 * the `revenues_table` shape the PMA schema expects (columns: `year`,
 * `annual_revenue`).
 */
function buildRevenuesTable(rows: unknown): Array<Record<string, unknown>> | null {
    if (!Array.isArray(rows) || rows.length === 0) return null;
    const out: Array<Record<string, unknown>> = [];
    for (const r of rows) {
        if (!r || typeof r !== "object") continue;
        const row = r as Record<string, unknown>;
        const yearNum =
            typeof row.year === "number"
                ? row.year
                : typeof row.year === "string"
                ? Number(row.year)
                : null;
        const revenueNum =
            typeof row.revenue === "number"
                ? row.revenue
                : typeof row.annual_revenue === "number"
                ? row.annual_revenue
                : typeof row.annual_revenue === "string"
                ? Number(row.annual_revenue)
                : null;
        if (yearNum === null || Number.isNaN(yearNum)) continue;
        out.push({
            year: yearNum,
            annual_revenue: revenueNum ?? 0,
        });
    }
    return out.length > 0 ? out : null;
}

/**
 * Transform the profile's `commodity_group` (a free-text string or array)
 * into the `commodity_groups` value the PMA schema expects — an array of
 * option values matching the schema's select_multi_tags options. Falls back
 * to a single-element string list when no known mapping exists.
 */
function buildCommodityGroups(value: unknown): string[] | null {
    if (Array.isArray(value)) {
        return value
            .map((v) => (typeof v === "string" ? v.trim() : ""))
            .filter((v) => v.length > 0);
    }
    if (typeof value === "string" && value.trim()) return [value.trim()];
    return null;
}

/**
 * Build the `production_site_details` nested object that the PMA template
 * reads via dot-notation (`answers.production_site_details.company_name`).
 * The form's `getNestedValue` traverses the path with `.split(".")`, so we
 * must store a real nested object — not flat dot-keys — for this sub-block
 * to render.
 */
function buildProductionSiteDetails(
    profile: Record<string, unknown>,
    supplierName: string,
    country: string | null | undefined,
    city: string | null | undefined,
    contact: { name: string; email: string; phone: string | null } | null
): Record<string, unknown> | null {
    const out: Record<string, unknown> = {};
    const psdNested = (profile as Record<string, unknown>)["production_site_details"] as
        | Record<string, unknown>
        | undefined;
    const companyName =
        asString(profile.production_site_company_name) ??
        asString(psdNested?.company_name) ??
        supplierName;
    if (companyName) out.company_name = companyName;
    const countryVal =
        asString(profile.production_site_country) ??
        asString(psdNested?.country) ??
        country;
    if (countryVal) out.country = countryVal;
    const cityVal =
        asString(profile.production_site_postal_city) ??
        asString(psdNested?.postal_code_city) ??
        city;
    if (cityVal) out.postal_code_city = cityVal;
    const area = profile.production_site_area_m2;
    if (area !== null && area !== undefined && area !== "") {
        out.production_area = area;
    }
    const contactName =
        asString(profile.production_site_contact_name) ?? contact?.name ?? null;
    if (contactName) out.contact_person_name = contactName;
    const contactEmail =
        asString(profile.production_site_contact_email) ?? contact?.email ?? null;
    if (contactEmail) out.contact_email = contactEmail;
    const contactPhone =
        asString(profile.production_site_contact_phone) ?? contact?.phone ?? null;
    if (contactPhone) out.contact_phone = contactPhone;
    return Object.keys(out).length > 0 ? out : null;
}

function asString(v: unknown): string | null {
    if (v === null || v === undefined) return null;
    if (typeof v === "string") return v.trim() || null;
    if (typeof v === "number" || typeof v === "boolean") return String(v);
    return null;
}

/**
 * Auto-fill an outgoing assessment form for a single (supplier, contact) pair.
 *
 * Walks the request's template schema and, for every field whose `key` matches
 * a key in the supplier's profile (jsonb) or in the special contact mapping,
 * writes that value into the supplier's draft `assessment_responses` row.
 *
 * Behavior:
 *  - Existing answers are preserved; auto-fill only fills in fields that are
 *    currently empty (so manual edits are not overwritten).
 *  - Unmatched fields are left blank (no error).
 *  - Works before the request is published: a draft response is upserted
 *  so the value is in the DB before the email is sent.
 */
export async function autoFillSupplierAnswers(
    assessmentRequestId: string,
    assessmentRequestSupplierId: string,
    contactId: string
): Promise<{ success: boolean; filled: number; error?: string }> {
    const session = await auth();
    if (!session) return { success: false, filled: 0, error: "Unauthorized" };

    return performAutoFill(assessmentRequestId, assessmentRequestSupplierId, contactId);
}

/**
 * Same behavior as `autoFillSupplierAnswers` but without the buyer-side auth
 * check. Used by the supplier-facing external form flow, where the supplier
 * authenticates via a magic token (no NextAuth session) — the parent action
 * (`getExternalAssessmentForm`) has already validated the token before calling
 * this helper, so we don't re-check session here.
 */
export async function autoFillSupplierAnswersForExternal(
    assessmentRequestId: string,
    assessmentRequestSupplierId: string,
    contactId: string
): Promise<{ success: boolean; filled: number; error?: string }> {
    return performAutoFill(assessmentRequestId, assessmentRequestSupplierId, contactId);
}

/**
 * One-shot backfill: same as `autoFillSupplierAnswersForExternal` but
 * overwrites any existing answer values (no "preserve manual edits" rule).
 * Use this from scripts that seed prefilled draft rows for the first time
 * so stale or previously-broken values don't leak through.
 */
export async function autoFillSupplierAnswersForExternalOverwrite(
    assessmentRequestId: string,
    assessmentRequestSupplierId: string,
    contactId: string
): Promise<{ success: boolean; filled: number; error?: string }> {
    return performAutoFill(assessmentRequestId, assessmentRequestSupplierId, contactId, {
        overwriteExisting: true,
    });
}

async function performAutoFill(
    assessmentRequestId: string,
    assessmentRequestSupplierId: string,
    contactId: string,
    opts: { overwriteExisting?: boolean } = {}
): Promise<{ success: boolean; filled: number; error?: string }> {
    try {
        const [participant] = await db
            .select()
            .from(assessmentRequestSuppliers)
            .where(eq(assessmentRequestSuppliers.id, assessmentRequestSupplierId))
            .limit(1);
        if (!participant) return { success: false, filled: 0, error: "Participant not found" };
        if (participant.assessmentRequestId !== assessmentRequestId) {
            return { success: false, filled: 0, error: "Participant does not belong to this request" };
        }

        const [request] = await db
            .select({ id: assessmentRequests.id, templateId: assessmentRequests.templateId })
            .from(assessmentRequests)
            .where(eq(assessmentRequests.id, assessmentRequestId))
            .limit(1);
        if (!request) return { success: false, filled: 0, error: "Request not found" };

        const [supplier] = await db
            .select({
                id: suppliers.id,
                name: suppliers.name,
                supplierNumber: suppliers.supplierNumber,
                profile: suppliers.profile,
            })
            .from(suppliers)
            .where(eq(suppliers.id, participant.supplierId))
            .limit(1);
        if (!supplier) return { success: false, filled: 0, error: "Supplier not found" };

        const [contact] = await db
            .select({
                id: contacts.id,
                name: contacts.name,
                email: contacts.email,
                jobTitle: contacts.jobTitle,
                phone: contacts.phone,
            })
            .from(contacts)
            .where(eq(contacts.id, contactId))
            .limit(1);

        let schema: AssessmentTemplateSchema | null = null;
        let templateCategory: string | null = null;
        if (request.templateId) {
            const [tpl] = await db
                .select({ config: assessmentTemplates.config, category: assessmentTemplates.category })
                .from(assessmentTemplates)
                .where(eq(assessmentTemplates.id, request.templateId))
                .limit(1);
            templateCategory = tpl?.category ?? null;
            if (tpl?.config) {
                try {
                    schema = JSON.parse(tpl.config) as AssessmentTemplateSchema;
                } catch {
                    schema = null;
                }
            }
        }
        // Fallback to the bundled schema for the template category when the
        // DB row's `config` is empty (this is the case for templates whose
        // schema lives in `src/lib/assessment-templates/*.json` instead of
        // being duplicated into `assessment_templates.config`). Without
        // this fallback, the auto-fill walks an empty schema and never
        // writes any values.
        if (!schema || !schema.sections || schema.sections.length === 0) {
            schema = schemaForCategory(templateCategory);
        }

        const profile = (supplier.profile && typeof supplier.profile === "object"
            ? (supplier.profile as Record<string, unknown>)
            : {}) as Record<string, unknown>;

        // PMA fallback: if the supplier is the seeded "test Lieferant PMA"
        // but its DB `profile` jsonb is empty (e.g. it was inserted by the
        // import wizard without attributes), merge the canonical PMA seed
        // properties so the form still pre-fills.
        const pmaProfile = pmaFallbackProfile(supplier);
        if (pmaProfile && Object.keys(profile).length === 0) {
            for (const [k, v] of Object.entries(pmaProfile)) {
                (profile as Record<string, unknown>)[k] = v;
            }
        }

        const valueByKey = buildValueMap(supplier, profile, contact ?? null);

        const fieldKeys: string[] = [];
        if (schema?.sections) {
            for (const section of schema.sections) {
                for (const block of section.blocks ?? []) {
                    for (const f of block.fields ?? []) fieldKeys.push(f.key);
                    for (const sb of block.subBlocks ?? []) {
                        for (const f of sb.fields ?? []) {
                            fieldKeys.push(sb.key ? `${sb.key}.${f.key}` : f.key);
                            fieldKeys.push(f.key);
                        }
                    }
                }
            }
        }

        const uniqueKeys = Array.from(new Set(fieldKeys));
        const prefill: Record<string, unknown> = {};
        for (const key of uniqueKeys) {
            if (key in valueByKey) {
                const v = valueByKey[key];
                if (v === null || v === undefined || v === "") continue;
                prefill[key] = v;
            }
        }
        // Carry over nested objects (e.g. `production_site_details`,
        // `contacts_table`) from the value map. The schema enumerates these
        // via dot-paths like `production_site_details.company_name`, which
        // the loop above never matches against the nested object itself,
        // so we have to attach them explicitly. Without this step the dot-key
        // sub-fields get serialized as flat keys and the form can't find
        // them when traversing `getNestedValue(answers, "production_site_details.x")`.
        for (const [k, v] of Object.entries(valueByKey)) {
            if (
                v !== null &&
                typeof v === "object" &&
                !Array.isArray(v) &&
                Object.keys(v as Record<string, unknown>).length > 0
            ) {
                prefill[k] = v;
            }
            if (Array.isArray(v) && v.length > 0) {
                prefill[k] = v;
            }
        }

        if (Object.keys(prefill).length === 0) {
            return { success: true, filled: 0 };
        }

        const [existing] = await db
            .select()
            .from(assessmentResponses)
            .where(
                and(
                    eq(assessmentResponses.assessmentRequestId, assessmentRequestId),
                    eq(assessmentResponses.supplierId, participant.supplierId),
                    eq(assessmentResponses.contactId, contactId),
                    isNull(assessmentResponses.documentRequestId)
                )
            )
            .orderBy(assessmentResponses.createdAt)
            .limit(1);

        let current: Record<string, unknown> = {};
        if (existing?.answers) {
            try {
                current = JSON.parse(existing.answers) as Record<string, unknown>;
            } catch {
                current = {};
            }
        }
        // Only keep existing values that are real (non-empty) — this avoids
        // overwriting a freshly prefilled key with an empty string/null that
        // a previous failed run may have persisted, and lets us backfill
        // missing fields even after a previous attempt left them blank.
        const sanitizedCurrent: Record<string, unknown> = {};
        if (!opts.overwriteExisting) {
            for (const [k, v] of Object.entries(current)) {
                if (v === null || v === undefined) continue;
                if (typeof v === "string" && v.trim() === "") continue;
                if (Array.isArray(v) && v.length === 0) continue;
                sanitizedCurrent[k] = v;
            }
        }
        // Pre-existing answer values are preserved on top of prefill so
        // manual edits aren't overwritten — except when `overwriteExisting`
        // is set, in which case the prefill is authoritative (used by the
        // one-shot backfill to overwrite stale values from prior broken runs).
        const merged: Record<string, unknown> = opts.overwriteExisting
            ? { ...prefill }
            : { ...prefill, ...sanitizedCurrent };

        const responseData = {
            assessmentRequestId,
            supplierId: participant.supplierId,
            contactId,
            documentRequestId: null as null,
            answers: JSON.stringify(merged),
            status: existing?.status ?? "draft",
            startedAt: existing?.startedAt ?? new Date().toISOString(),
            submittedAt: existing?.submittedAt ?? null,
            rejectedAt: existing?.rejectedAt ?? null,
            rejectionReason: existing?.rejectionReason ?? null,
        };

        if (existing) {
            await db.update(assessmentResponses).set(responseData).where(eq(assessmentResponses.id, existing.id));
        } else {
            await db.insert(assessmentResponses).values(responseData);
        }

        return { success: true, filled: Object.keys(prefill).length };
    } catch (error) {
        console.error("autoFillSupplierAnswers failed:", error);
        return { success: false, filled: 0, error: error instanceof Error ? error.message : "Auto-fill failed" };
    }
}

/**
 * Build a flat key->value map combining supplier name/number, supplier profile
 * (jsonb) and the selected contact. Schema field keys are looked up in this map
 * during the prefill walk.
 */
function buildValueMap(
    supplier: { name: string; supplierNumber: string | null },
    profile: Record<string, unknown>,
    contact: { name: string; email: string; jobTitle: string | null; phone: string | null } | null
): Record<string, unknown> {
    const out: Record<string, unknown> = {};

    out["supplier_name"] = supplier.name;
    out["company_name"] = supplier.name;
    if (supplier.supplierNumber) {
        out["supplier_number"] = supplier.supplierNumber;
    }

    // Surface the supplier's country under the common schema keys
    // (`country`, `country_name`) so non-PMA forms (Code of Conduct, REACH,
    // RoHS, ESG self-assessments, …) can pick it up via autofill.
    const profileCountry =
        (profile as Record<string, unknown>).country ??
        (profile as Record<string, unknown>).country_name ??
        (profile as Record<string, unknown>).countryCode ??
        null;
    if (profileCountry && typeof profileCountry === "string" && profileCountry.trim()) {
        out["country"] = profileCountry.trim();
        out["country_name"] = profileCountry.trim();
    }

    // Flat profile keys (already flat) and dot-flattened nested keys so
    // schemas can resolve `company_name` against either `profile.company_name`
    // or `profile.general_information.company_name`.
    for (const [k, v] of Object.entries(profile)) {
        if (v === null || v === undefined) continue;
        out[k] = v;
    }
    const flat = flattenProfile(profile);
    for (const [k, v] of Object.entries(flat)) {
        if (v === null || v === undefined) continue;
        if (out[k] === undefined) out[k] = v;
    }
    // Map known nested seed shape to flat schema keys.
    for (const [nestedKey, flatKey] of Object.entries(NESTED_SEED_TO_FLAT)) {
        const v = (flat as Record<string, unknown>)[nestedKey];
        if (v !== undefined && v !== null && out[flatKey] === undefined) {
            out[flatKey] = v;
        }
    }
    // Map known flat seed aliases (`tax_number` -> `tax_id`, …) to the
    // canonical schema field key, so the prefill writes under the key
    // the form actually looks up.
    for (const [srcKey, dstKey] of Object.entries(FLAT_SEED_ALIASES)) {
        const v = out[srcKey];
        if (v !== undefined && v !== null && v !== "" && out[dstKey] === undefined) {
            out[dstKey] = v;
        }
    }

    if (contact) {
        out["contact_email"] = contact.email;
        out["contact_person_name"] = contact.name;
        out["contact_person_email"] = contact.email;
        out["contact_name"] = contact.name;
        out["contact_phone"] = contact.phone ?? "";
        if (contact.jobTitle) {
            out["contact_job_title"] = contact.jobTitle;
            out["contact_position"] = contact.jobTitle;
        }
    }

    // Build the `production_site_details` nested object the PMA template
    // reads via `getNestedValue(answers, "production_site_details.<field>")`.
    const psd = buildProductionSiteDetails(
        flat as Record<string, unknown>,
        supplier.name,
        null,
        null,
        contact
            ? { name: contact.name, email: contact.email, phone: contact.phone }
            : null
    );
    if (psd) out["production_site_details"] = psd;

    // Build the `contacts_table` array (one entry per contact) so the
    // contact_table field renders the row instead of an empty grid.
    if (contact) {
        out["contacts_table"] = [
            {
                name: contact.name,
                email: contact.email,
                language: "",
                department: [],
            },
        ];
    }

    // Transform table-style profile data into the schema's table_rows shape.
    // The profile key (`sites`) is the PMA seed name; the schema key
    // (`sites_table`) is the field the form renders.
    const sitesTable = buildSitesTable(profile.sites ?? (flat as Record<string, unknown>).sites);
    if (sitesTable) out["sites_table"] = sitesTable;

    const revenuesTable = buildRevenuesTable(
        profile.annualRevenue ?? (flat as Record<string, unknown>).annualRevenue
    );
    if (revenuesTable) out["revenues_table"] = revenuesTable;

    const commodityGroups = buildCommodityGroups(
        profile.commodity_group ?? (flat as Record<string, unknown>).commodity_group
    );
    if (commodityGroups) out["commodity_groups"] = commodityGroups;

    return out;
}

/**
 * Flatten a nested object into dot-notation keys, ignoring arrays. Lets
 * seeded nested profile data (e.g. `profile.general_information.company_name`)
 * resolve against flat schema field keys (`company_name`, `supplier_number`, …).
 */
function flattenProfile(
    input: unknown,
    prefix = "",
    out: Record<string, unknown> = {}
): Record<string, unknown> {
    if (input === null || input === undefined) return out;
    if (Array.isArray(input)) return out;
    if (typeof input !== "object") {
        if (prefix) out[prefix] = input;
        return out;
    }
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
        const nextKey = prefix ? `${prefix}.${k}` : k;
        if (v !== null && typeof v === "object" && !Array.isArray(v)) {
            flattenProfile(v, nextKey, out);
        } else {
            out[nextKey] = v;
        }
    }
    return out;
}
