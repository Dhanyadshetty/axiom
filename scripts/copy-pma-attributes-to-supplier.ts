/**
 * Copy the canonical "test Lieferant PMA" attributes (properties + tables)
 * from `src/components/suppliers/detail/pma-seed.ts` into the real DB
 * supplier row identified by SUPPLIER_ID.
 *
 * Idempotent — safe to re-run.
 *
 * Run with:
 *   npx tsx scripts/copy-pma-attributes-to-supplier.ts
 */

import { db } from "@/db";
import { sql } from "drizzle-orm";
import { PMA_SEED } from "@/components/suppliers/detail/pma-seed";

const SUPPLIER_ID = "e9327de3-b355-489b-aaa7-3b0149c77def";

async function main() {
    const rows = await db.execute<{
        id: string;
        name: string;
        supplier_number: string | null;
        profile: unknown;
        city: string | null;
        country_code: string | null;
    }>(
        sql`SELECT id::text AS id, name, supplier_number, profile, city, country_code
            FROM suppliers
            WHERE id = ${SUPPLIER_ID}::uuid
            LIMIT 1`
    );

    const list = (rows as unknown as { rows?: unknown[] }).rows
        ?? (Array.isArray(rows) ? (rows as unknown[]) : []);

    if (list.length === 0) {
        console.error(`Supplier ${SUPPLIER_ID} not found`);
        process.exit(1);
    }

    const target = list[0] as {
        id: string;
        name: string;
        supplier_number: string | null;
        profile: unknown;
        city: string | null;
        country_code: string | null;
    };

    const prev =
        target.profile && typeof target.profile === "object"
            ? (target.profile as Record<string, unknown>)
            : {};

    // Merge properties and tables into the profile jsonb so the autofill
    // can reach `annualRevenue`, `sites`, etc. from a single profile read.
    const merged: Record<string, unknown> = {
        ...PMA_SEED.properties,
        ...PMA_SEED.tables,
        ...prev,
    };

    await db.execute(
        sql`UPDATE suppliers
            SET profile = ${JSON.stringify(merged)}::jsonb,
                city = COALESCE(${target.city ?? null}, 'Lossburg-Betzweiler'),
                country_code = COALESCE(${target.country_code ?? null}, 'DE')
            WHERE id = ${SUPPLIER_ID}::uuid`
    );

    console.log(`Copied ${Object.keys(PMA_SEED.properties).length} PMA properties + ${Object.keys(PMA_SEED.tables).length} tables onto supplier ${SUPPLIER_ID}`);
    console.log(`Supplier name: ${target.name}`);
    console.log(`Supplier number: ${target.supplier_number ?? "(none)"}`);
    console.log(`Merged profile keys: ${Object.keys(merged).length}`);
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });