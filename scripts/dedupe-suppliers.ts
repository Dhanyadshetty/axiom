/**
 * One-time cleanup: merge duplicate supplier rows by `lower(trim(name))`.
 *
 * For every supplier that has at least one other supplier with the same
 * normalized name:
 *   - Keep the OLDEST row (smallest createdAt, ties broken by id) as the
 *     canonical survivor.
 *   - Re-point every foreign key referencing the duplicates at the survivor.
 *   - Delete the duplicate rows.
 *
 * Run with:
 *   npx tsx scripts/dedupe-suppliers.ts
 *
 * The script is idempotent: rerunning it after the database has been
 * deduplicated is a no-op.
 */
import { sql as drizzleSql } from "drizzle-orm";
import { db } from "../src/db";
import { suppliers } from "../src/db/schema";

interface MergeGroup {
    survivorId: string;
    survivorName: string;
    duplicateIds: string[];
}

const SUPPLIER_FK_TABLES: Array<{ table: string; column: string }> = [
    { table: "users", column: "supplier_id" },
    { table: "contacts", column: "supplier_id" },
    { table: "documents", column: "supplier_id" },
    { table: "invoices", column: "supplier_id" },
    { table: "contracts", column: "supplier_id" },
    { table: "procurement_orders", column: "supplier_id" },
    { table: "supplier_performance_logs", column: "supplier_id" },
    { table: "supplier_requests", column: "supplier_id" },
    { table: "supplier_action_plans", column: "supplier_id" },
    { table: "compliance_obligations", column: "supplier_id" },
    { table: "rfq_suppliers", column: "supplier_id" },
    { table: "assessment_request_suppliers", column: "supplier_id" },
    { table: "assessment_responses", column: "supplier_id" },
    { table: "sourcing_events", column: "awarded_supplier_id" },
    { table: "sourcing_messages", column: "supplier_id" },
];

interface DuplicateGroupRow {
    survivor_id: string;
    survivor_name: string;
    duplicate_ids: string[];
    name_key: string;
}

async function detectGroups(): Promise<MergeGroup[]> {
    const result = await db.execute(drizzleSql`
        WITH ranked AS (
            SELECT
                id,
                name,
                lower(trim(name)) AS name_key,
                created_at,
                row_number() OVER (
                    PARTITION BY lower(trim(name))
                    ORDER BY created_at NULLS LAST, id
                ) AS rn
            FROM suppliers
        ),
        groups AS (
            SELECT name_key
            FROM ranked
            GROUP BY name_key
            HAVING count(*) > 1
        )
        SELECT
            (SELECT id FROM ranked r2 WHERE r2.name_key = g.name_key AND r2.rn = 1) AS survivor_id,
            (SELECT name FROM ranked r2 WHERE r2.name_key = g.name_key AND r2.rn = 1) AS survivor_name,
            array_agg(r.id ORDER BY r.rn) FILTER (WHERE r.rn > 1) AS duplicate_ids,
            g.name_key
        FROM groups g
        JOIN ranked r ON r.name_key = g.name_key
        GROUP BY g.name_key
    `);

    const rows: DuplicateGroupRow[] = result.rows;

    return rows
        .filter((row) => row.survivor_id && row.duplicate_ids && row.duplicate_ids.length > 0)
        .map((row) => ({
            survivorId: row.survivor_id,
            survivorName: row.survivor_name,
            duplicateIds: row.duplicate_ids.filter((id: string) => id !== row.survivor_id),
        }));
}

async function mergeGroup(group: MergeGroup): Promise<{ reassigned: number; deleted: number }> {
    const survivorId = group.survivorId;
    const duplicateIds = group.duplicateIds;

    if (duplicateIds.length === 0) {
        return { reassigned: 0, deleted: 0 };
    }

    let reassigned = 0;

    for (const fk of SUPPLIER_FK_TABLES) {
        for (const dupId of duplicateIds) {
            const result = await db.execute(drizzleSql.raw(
                `UPDATE ${fk.table}
                 SET ${fk.column} = '${survivorId}'
                 WHERE ${fk.column} = '${dupId}'
                   AND NOT EXISTS (
                      SELECT 1 FROM ${fk.table} existing
                      WHERE existing.${fk.column} = '${survivorId}'
                        AND existing.ctid <> ${fk.table}.ctid
                    )`,
            ));
            reassigned += Number(result.rowCount ?? 0);
        }
    }

    const deleteResult = await db.delete(suppliers).where(
        drizzleSql`id = ANY(${duplicateIds}::uuid[]) AND id <> ${survivorId}`,
    );

    return { reassigned, deleted: Number(deleteResult.rowCount ?? 0) };
}

async function main() {
    console.log("[dedupe-suppliers] Scanning for duplicate supplier rows...");
    const groups = await detectGroups();
    if (groups.length === 0) {
        console.log("[dedupe-suppliers] No duplicates found. Database is clean.");
        return;
    }

    console.log(`[dedupe-suppliers] Found ${groups.length} duplicate group(s).`);
    for (const group of groups) {
        console.log(
            `  - "${group.survivorName}" (${group.survivorId}) absorbs ${group.duplicateIds.length} duplicate(s): ${group.duplicateIds.join(", ")}`,
        );
    }

    let totalReassigned = 0;
    let totalDeleted = 0;
    for (const group of groups) {
        const { reassigned, deleted } = await mergeGroup(group);
        totalReassigned += reassigned;
        totalDeleted += deleted;
        console.log(
            `  merged "${group.survivorName}": ${reassigned} FK row(s) reassigned, ${deleted} supplier row(s) deleted`,
        );
    }

    const [{ count }] = await db.select({ count: drizzleSql<number>`count(*)::int`.mapWith(Number) }).from(suppliers);
    console.log(
        `[dedupe-suppliers] Done. Reassigned ${totalReassigned} FK row(s), deleted ${totalDeleted} supplier row(s). Suppliers table now has ${count} row(s).`,
    );
}

main()
    .then(async () => {
        await db.execute(drizzleSql`SELECT 1`);
        process.exit(0);
    })
    .catch(async (error) => {
        console.error("[dedupe-suppliers] Failed:", error);
        process.exit(1);
    });