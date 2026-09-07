/**
 * One-time backfill: for every published (or draft) assessment request,
 * prefill the supplier's draft `assessment_responses` row from the supplier's
 * profile + the participant's primary contact.
 *
 * Mirrors the runtime behavior of `autoFillSupplierAnswersForExternal`
 * (no NextAuth session check). Use this to seed prefilled rows for any
 * outstanding magic-token links so suppliers open the form with values
 * already in place.
 *
 * Run with:
 *   npx tsx scripts/backfill-assessment-prefill.ts
 */

import { db } from "@/db";
import {
    assessmentRequests,
    assessmentRequestSuppliers,
    assessmentRequestSupplierContacts,
    assessmentResponses,
} from "@/db/schema";
import { eq, asc, inArray, and, ne } from "drizzle-orm";
import { autoFillSupplierAnswersForExternal, autoFillSupplierAnswersForExternalOverwrite } from "@/app/actions/assessment-autofill";

type Counters = { requests: number; participants: number; contacts: number; filled: number; skipped: number; overwritten: number; failed: number };

async function main() {
    const c: Counters = { requests: 0, participants: 0, contacts: 0, filled: 0, skipped: 0, overwritten: 0, failed: 0 };

    const requests = await db
        .select({ id: assessmentRequests.id, status: assessmentRequests.status })
        .from(assessmentRequests)
        .where(inArray(assessmentRequests.status, ["draft", "published"]));

    console.log(`Found ${requests.length} draft/published assessment requests to process.`);
    c.requests = requests.length;

    for (const req of requests) {
        const participants = await db
            .select()
            .from(assessmentRequestSuppliers)
            .where(eq(assessmentRequestSuppliers.assessmentRequestId, req.id));

        for (const p of participants) {
            c.participants++;
            const linked = await db
                .select({ contactId: assessmentRequestSupplierContacts.contactId })
                .from(assessmentRequestSupplierContacts)
                .where(eq(assessmentRequestSupplierContacts.assessmentRequestSupplierId, p.id));
            const contactIds = Array.from(
                new Set(
                    [
                        ...linked.map((l) => l.contactId),
                        ...(p.contactId ? [p.contactId] : []),
                    ].filter(Boolean) as string[]
                )
            );

            if (contactIds.length === 0) {
                c.skipped++;
                continue;
            }

            for (const cid of contactIds) {
                c.contacts++;
                // Pick the right variant: overwrite when the existing draft
                // is "submitted"/"completed" already, preserve otherwise.
                const existing = await db
                    .select({ id: assessmentResponses.id, status: assessmentResponses.status })
                    .from(assessmentResponses)
                    .where(
                        and(
                            eq(assessmentResponses.assessmentRequestId, req.id),
                            eq(assessmentResponses.supplierId, p.supplierId),
                            eq(assessmentResponses.contactId, cid)
                        )
                    )
                    .orderBy(asc(assessmentResponses.createdAt))
                    .limit(1);
                const status = existing[0]?.status ?? null;
                const isFinal = status === "submitted" || status === "completed" || status === "approved";
                try {
                    const res = isFinal
                        ? await autoFillSupplierAnswersForExternal(req.id, p.id, cid)
                        : await autoFillSupplierAnswersForExternalOverwrite(req.id, p.id, cid);
                    if (res.success && res.filled > 0) {
                        if (isFinal) c.filled += res.filled;
                        else c.overwritten += res.filled;
                    } else {
                        c.skipped++;
                    }
                } catch (err) {
                    c.failed++;
                    console.error(`  autofill failed for participant ${p.id} contact ${cid}:`, err instanceof Error ? err.message : err);
                }
            }
        }
    }

    console.log("\nBackfill summary:");
    console.log(JSON.stringify(c, null, 2));
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });