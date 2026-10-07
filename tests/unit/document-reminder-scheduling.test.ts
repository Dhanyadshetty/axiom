import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseDateToMidnight } from "@/lib/utils/document-filters";
import { generateDocumentExpiryReminderEmail } from "@/lib/services/email";

describe("Document Expiry Reminder Scheduling Rules", () => {
    it("computes default schedule date as 1 day before expiry date", () => {
        const expiresAt = "22/09/2026";
        const expDate = parseDateToMidnight(expiresAt);
        assert.ok(expDate);

        // Calculate 1 day prior
        const defaultScheduleDate = new Date(expDate);
        defaultScheduleDate.setDate(defaultScheduleDate.getDate() - 1);
        defaultScheduleDate.setHours(9, 0, 0, 0); // 09:00 AM

        assert.equal(defaultScheduleDate.getFullYear(), 2026);
        assert.equal(defaultScheduleDate.getMonth(), 8); // September (0-indexed)
        assert.equal(defaultScheduleDate.getDate(), 21);
        assert.equal(defaultScheduleDate.getHours(), 9);
        assert.equal(defaultScheduleDate.getMinutes(), 0);
    });

    it("handles month-boundary for 1 day prior schedule calculation", () => {
        const expiresAt = "01.10.2026";
        const expDate = parseDateToMidnight(expiresAt);
        assert.ok(expDate);

        const defaultScheduleDate = new Date(expDate);
        defaultScheduleDate.setDate(defaultScheduleDate.getDate() - 1);

        assert.equal(defaultScheduleDate.getFullYear(), 2026);
        assert.equal(defaultScheduleDate.getMonth(), 8); // September 30
        assert.equal(defaultScheduleDate.getDate(), 30);
    });

    it("generates reminder email for scheduled notification with proper metadata", () => {
        const email = generateDocumentExpiryReminderEmail({
            userName: "Dhanya Shetty",
            documentName: "ISO 14001 Environmental Certificate",
            documentType: "ISO 14001",
            supplierName: "851035 PRETTL Electronics GmbH",
            expiresAt: "22/09/2026",
            diffDays: 1,
            portalUrl: "http://localhost:3001/documents",
        });

        assert.ok(email.subject.includes("Expiry Reminder: ISO 14001 Environmental Certificate"));
        assert.ok(email.body.includes("Hello Dhanya Shetty"));
        assert.ok(email.body.includes("Expiring in 1 day"));
        assert.ok(email.html.includes("851035 PRETTL Electronics GmbH"));
    });
});
