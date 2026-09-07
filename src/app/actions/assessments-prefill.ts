"use server";

import { db } from "@/db";
import {
    assessmentRequestSuppliers,
    assessmentRequestSupplierContacts,
    contacts,
    suppliers,
} from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import type { FormAnswer } from "@/lib/assessment-templates/types";
import { PMA_SEED, PMA_SUPPLIER_ID, PMA_SUPPLIER_NAME } from "@/components/suppliers/detail/pma-seed";

const PROPERTY_ALIASES: Record<string, string[]> = {
    supplier_number: ["supplier_number", "supplierNumber"],
    company_name: ["company_name", "name"],
    address: ["address"],
    website: ["public_website", "website"],
    legal_form: ["legal_form"],
    parent_company: ["parent_company"],
    tax_id: ["tax_id", "tax_number"],
    vat_id: ["vat_id"],
    foundation_year: ["foundation_year", "year_founded", "year_established"],
    headquarters_location: ["headquarters_location", "location_headquarter"],
    eori_number: ["eori_number", "eori_no"],
    duns_number: ["duns_number", "duns_no"],
    trade_register_entry: ["trade_register_entry", "local_trade_register"],
    bank_name: ["bank_name"],
    iban: ["iban"],
    bic_swift: ["bic_swift"],
    currency: ["account_currency", "currency"],
    insurer_name: ["insurer_name", "insurer"],
    insurance_number: ["insurance_number", "insurance_no"],
    insured_amount: ["insured_amount", "amount_insured"],
    country: ["country", "country_name", "countryCode"],
};

function asString(v: unknown): string | null {
    if (v === null || v === undefined) return null;
    if (typeof v === "string") return v.trim() || null;
    if (typeof v === "number" || typeof v === "boolean") return String(v);
    return null;
}

/**
 * Map between the nested seed profile shape (used by
 * `scripts/seed-test-supplier.ts`) and the flat keys the form schema
 * expects. Without this, the buyer-side form sees an empty profile
 * because the supplier's `profile` jsonb uses
 * `profile.general_information.company_name` etc.
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
 * Flatten a nested object into a single-level object using dot notation,
 * ignoring arrays. Used to surface seeded nested profile data (e.g. PMA
 * `profile.general_information.company_name`) under the flat keys the
 * form schema expects (`company_name`, `supplier_number`, …).
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

function pickProperty(
    properties: Record<string, unknown> | null | undefined,
    fieldKey: string
): string | null {
    if (!properties) return null;
    const aliases = PROPERTY_ALIASES[fieldKey] ?? [fieldKey];
    for (const key of aliases) {
        const v = asString(properties[key]);
        if (v !== null) return v;
    }
    return null;
}

export interface SupplierPrefillSource {
    supplier: {
        id: string;
        name: string;
        supplierNumber: string | null;
        countryCode: string | null;
        city: string | null;
        website: string | null;
        properties: Record<string, unknown>;
    };
    contact: {
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
    } | null;
}

/**
 * If the supplier is the seeded "test Lieferant PMA" (matched by id, number
 * or normalized name) and its DB profile is empty or missing, return the
 * PMA seed profile so prefill works even when no `profile` jsonb was
 * persisted for the row.
 */
function getPmaFallbackProfile(
    supplier: { id: string; supplierNumber: string | null; name: string | null }
): Record<string, unknown> | null {
    const norm = (v: string | null | undefined) =>
        (v ?? "").trim().toLowerCase();
    const isPma =
        supplier.id === PMA_SUPPLIER_ID ||
        norm(supplier.supplierNumber) === "pma-9001" ||
        norm(supplier.name) === norm(PMA_SUPPLIER_NAME) ||
        norm(supplier.name).includes("pma");
    return isPma ? { ...PMA_SEED.properties } : null;
}

/**
 * Backfill the DB `suppliers.profile` jsonb for the PMA supplier when it's
 * missing or empty. Safe to call from any prefill path. Returns the profile
 * that should be used (either the freshly persisted one or `null`).
 */
async function ensurePmaProfilePersisted(
    supplier: { id: string; supplierNumber: string | null; name: string | null; profile: unknown }
): Promise<Record<string, unknown> | null> {
    const hasProfile =
        supplier.profile &&
        typeof supplier.profile === "object" &&
        Object.keys(supplier.profile as Record<string, unknown>).length > 0;
    if (hasProfile) return null;
    const fallback = getPmaFallbackProfile(supplier);
    if (!fallback) return null;
    try {
        await db
            .update(suppliers)
            .set({ profile: fallback, updatedAt: new Date() })
            .where(eq(suppliers.id, supplier.id));
    } catch (err) {
        console.error("ensurePmaProfilePersisted: update failed", err);
    }
    return fallback;
}

async function loadSupplierPrefillSource(
    supplierId: string
): Promise<SupplierPrefillSource | null> {
    const [supplier] = await db
        .select()
        .from(suppliers)
        .where(eq(suppliers.id, supplierId))
        .limit(1);

    if (!supplier) return null;

    const [primary] = await db
        .select()
        .from(contacts)
        .where(eq(contacts.supplierId, supplierId))
        .orderBy(asc(contacts.createdAt), asc(contacts.id))
        .limit(1);

    const pmaFallback = await ensurePmaProfilePersisted({
        id: supplier.id,
        supplierNumber: supplier.supplierNumber,
        name: supplier.name,
        profile: supplier.profile,
    });

    const profile = (supplier.profile as Record<string, unknown> | null) ?? null;
    const properties: Record<string, unknown> = {};

    // 1) Live DB profile — both flat (`profile.company_name`) and the
    //    dot-flattened nested form (`profile.general_information.company_name`)
    //    so seeded nested profiles match the flat schema field keys.
    if (profile && Object.keys(profile).length > 0) {
        Object.assign(properties, profile);
        const flat = flattenProfile(profile);
        Object.assign(properties, flat);
        // Map known nested seed shape (`general_information.company_name`)
        // to its flat schema key (`company_name`).
        for (const [nestedKey, flatKey] of Object.entries(NESTED_SEED_TO_FLAT)) {
            const v = (flat as Record<string, unknown>)[nestedKey];
            if (v !== undefined && v !== null && properties[flatKey] === undefined) {
                properties[flatKey] = v;
            }
        }
    }

    // 2) In-memory PMA seed fallback for the test Lieferant PMA supplier.
    //    Used when the DB profile is empty (e.g. supplier was just inserted
    //    with no attributes) so the form still pre-fills with the canonical
    //    PMA dataset.
    if (pmaFallback) {
        for (const [k, v] of Object.entries(pmaFallback)) {
            if (properties[k] === undefined || properties[k] === null) {
                properties[k] = v;
            }
        }
    }

    if (supplier.name) properties.company_name = properties.company_name ?? supplier.name;
    if (supplier.supplierNumber)
        properties.supplier_number = properties.supplier_number ?? supplier.supplierNumber;
    if (supplier.countryCode && !properties.country_name)
        properties.country_name = supplier.countryCode;
    if (supplier.city && !properties.headquarters_location)
        properties.headquarters_location = supplier.city;
    if (supplier.website) properties.website = properties.website ?? supplier.website;

    return {
        supplier: {
            id: supplier.id,
            name: supplier.name,
            supplierNumber: supplier.supplierNumber,
            countryCode: supplier.countryCode,
            city: supplier.city,
            website: supplier.website,
            properties,
        },
        contact: primary
            ? {
                  id: primary.id,
                  name: primary.name,
                  email: primary.email ?? null,
                  phone: primary.phone ?? null,
              }
            : null,
    };
}

function buildAnswersFromSource(
    source: SupplierPrefillSource
): FormAnswer {
    const { supplier, contact } = source;
    const answers: Record<string, any> = {};
    const props = supplier.properties;

    for (const [fieldKey] of Object.entries(PROPERTY_ALIASES)) {
        const v = pickProperty(props, fieldKey);
        if (v !== null) answers[fieldKey] = v;
    }

    if (supplier.name && !answers.company_name) answers.company_name = supplier.name;
    if (supplier.supplierNumber && !answers.supplier_number)
        answers.supplier_number = supplier.supplierNumber;
    if (supplier.city && !answers.headquarters_location)
        answers.headquarters_location = supplier.city;
    if (supplier.website && !answers.website) answers.website = supplier.website;
    if (supplier.countryCode && !answers.headquarters_location)
        answers.headquarters_location = supplier.countryCode;

    if (contact) {
        const productionSite = {
            company_name: supplier.name,
            country: supplier.countryCode ?? "",
            postal_code_city: supplier.city ?? "",
            contact_person_name: contact.name,
            contact_email: contact.email ?? "",
            contact_phone: contact.phone ?? "",
        };
        answers.production_site_details = {
            ...(answers.production_site_details ?? {}),
            ...productionSite,
        };

        if (contact.email) {
            answers.contacts_table = [
                {
                    name: contact.name,
                    email: contact.email,
                    language: "",
                    department: [],
                },
            ];
        }
    }

    return answers as FormAnswer;
}

export async function getSupplierFormPrefill(
    assessmentRequestId: string
): Promise<FormAnswer> {
    try {
        const [participant] = await db
            .select()
            .from(assessmentRequestSuppliers)
            .where(
                eq(
                    assessmentRequestSuppliers.assessmentRequestId,
                    assessmentRequestId
                )
            )
            .orderBy(asc(assessmentRequestSuppliers.createdAt))
            .limit(1);

        if (!participant) return {};

        let contactId = participant.contactId ?? null;
        if (!contactId) {
            const [link] = await db
                .select({ contactId: assessmentRequestSupplierContacts.contactId })
                .from(assessmentRequestSupplierContacts)
                .where(
                    eq(
                        assessmentRequestSupplierContacts.assessmentRequestSupplierId,
                        participant.id
                    )
                )
                .orderBy(asc(assessmentRequestSupplierContacts.createdAt))
                .limit(1);
            contactId = link?.contactId ?? null;
        }

        const source = await loadSupplierPrefillSource(participant.supplierId);
        if (!source) return {};

        if (contactId && (!source.contact || source.contact.id !== contactId)) {
            const override = await db
                .select()
                .from(contacts)
                .where(eq(contacts.id, contactId))
                .limit(1);
            const c = override[0];
            if (c) {
                source.contact = {
                    id: c.id,
                    name: c.name,
                    email: c.email ?? null,
                    phone: c.phone ?? null,
                };
            }
        }

        return buildAnswersFromSource(source);
    } catch (err) {
        console.error("getSupplierFormPrefill failed:", err);
        return {};
    }
}
