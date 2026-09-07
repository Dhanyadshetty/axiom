import Link from "next/link";
import { eq, or } from "drizzle-orm";
import { resolveSupplierDetail } from "@/components/suppliers/detail/resolve-supplier";
import { PropertiesTemplate, type PropertiesSupplier } from "@/components/suppliers/detail/properties-template";
import type { CertValue } from "@/components/suppliers/detail/certifications-block";
import { db } from "@/db";
import { suppliers } from "@/db/schema";

export const dynamic = "force-dynamic";

/**
 * Pull the supplier's stored profile from the database. The properties page
 * uses this so attribute edits (and the PMA seed copy into a real supplier
 * row) actually show up — `resolveSupplierDetail` only returns mock data.
 */
async function loadSupplierFromDb(id: string): Promise<{
    name: string;
    supplierNumber: string | null;
    city: string | null;
    countryCode: string | null;
    profile: Record<string, unknown>;
} | null> {
    try {
        const rows = await db
            .select({
                id: suppliers.id,
                name: suppliers.name,
                supplierNumber: suppliers.supplierNumber,
                city: suppliers.city,
                countryCode: suppliers.countryCode,
                profile: suppliers.profile,
            })
            .from(suppliers)
            .where(
                id.length === 36
                    ? eq(suppliers.id, id)
                    : or(eq(suppliers.supplierNumber, id))
            )
            .limit(1);
        const row = rows[0];
        if (!row) return null;
        const profile =
            row.profile && typeof row.profile === "object"
                ? (row.profile as Record<string, unknown>)
                : {};
        return {
            name: row.name,
            supplierNumber: row.supplierNumber,
            city: row.city,
            countryCode: row.countryCode,
            profile,
        };
    } catch {
        return null;
    }
}

export default async function SupplierPropertiesPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supplier = resolveSupplierDetail(id);

    if (!supplier) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 p-8 text-center">
                <p className="text-lg font-semibold text-slate-700">Supplier not found</p>
                <Link href="/suppliers" className="text-emerald-600 hover:underline">Back to suppliers</Link>
            </div>
        );
    }

    // Prefer the live DB profile (and DB name/city/country) when available so
    // attributes copied from PMA_SEED into a real supplier row actually render.
    // Fall back to the mock resolver's values when no DB row exists.
    const dbSupplier = await loadSupplierFromDb(id);
    const propertiesSupplier: PropertiesSupplier = {
        ...supplier,
        name: dbSupplier?.name ?? supplier.name,
        city: dbSupplier?.city ?? supplier.city,
        countryCode: dbSupplier?.countryCode ?? supplier.countryCode,
        properties:
            dbSupplier && Object.keys(dbSupplier.profile).length > 0
                ? dbSupplier.profile
                : supplier.properties,
        tables: supplier.tables,
        certificates:
            Object.keys(supplier.certificates).length > 0
                ? supplier.certificates
                : ({} as Record<string, CertValue | undefined>),
    };

    return (
        <PropertiesTemplate
            supplier={propertiesSupplier}
            values={propertiesSupplier.properties as Record<string, unknown>}
            tables={
                propertiesSupplier.tables as
                    | {
                          investmentVolume?: Array<Record<string, unknown>>;
                          annualRevenue?: Array<Record<string, unknown>>;
                          numberOfEmployees?: Array<Record<string, unknown>>;
                          sites?: Array<Record<string, unknown>>;
                      }
                    | undefined
            }
            certValues={propertiesSupplier.certificates as Record<string, CertValue | undefined>}
            breadcrumbLabel="Supplier attributes"
        />
    );
}