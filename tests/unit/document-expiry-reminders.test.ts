import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseDateToMidnight } from "@/lib/utils/document-filters";
import { generateDocumentExpiryReminderEmail } from "@/lib/services/email";

describe("Document Expiry Date Parsing & Alert Calculation", () => {
    it("correctly parses DD.MM.YYYY dates to midnight", () => {
        const parsed = parseDateToMidnight("22.09.2026");
        assert.ok(parsed instanceof Date);
        assert.equal(parsed.getFullYear(), 2026);
        assert.equal(parsed.getMonth(), 8); // 0-indexed September
        assert.equal(parsed.getDate(), 22);
        assert.equal(parsed.getHours(), 0);
        assert.equal(parsed.getMinutes(), 0);
    });

    it("correctly parses DD/MM/YYYY dates to midnight", () => {
        const parsed = parseDateToMidnight("22/09/2026");
        assert.ok(parsed instanceof Date);
        assert.equal(parsed.getFullYear(), 2026);
        assert.equal(parsed.getMonth(), 8);
        assert.equal(parsed.getDate(), 22);
    });

    it("correctly parses ISO YYYY-MM-DD dates", () => {
        const parsed = parseDateToMidnight("2026-09-22");
        assert.ok(parsed instanceof Date);
        assert.equal(parsed.getFullYear(), 2026);
        assert.equal(parsed.getMonth(), 8);
        assert.equal(parsed.getDate(), 22);
    });

    it("calculates zero day difference for document expiring today", () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const expStr = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;
        const parsed = parseDateToMidnight(expStr);
        assert.ok(parsed);

        const diffDays = Math.round((parsed.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        assert.equal(diffDays, 0);
    });

    it("calculates positive day difference for future expiry", () => {
        const today = new Date(2026, 8, 22);
        today.setHours(0, 0, 0, 0);

        const expDate = new Date(2026, 8, 29);
        expDate.setHours(0, 0, 0, 0);

        const diffDays = Math.round((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        assert.equal(diffDays, 7);
    });
});

describe("Document Expiry Email Template Generation", () => {
    it("generates Expiring Today reminder email correctly", () => {
        const email = generateDocumentExpiryReminderEmail({
            userName: "Vinay Temkar",
            documentName: "ISO 9001 Certificate",
            documentType: "ISO 9001",
            supplierName: "851035 Prettl Mechatronics GmbH",
            expiresAt: "22.09.2026",
            diffDays: 0,
            documentId: "doc-123",
        });

        assert.ok(email.subject.includes("Expiry Reminder: ISO 9001 Certificate (22.09.2026)"));
        assert.ok(email.body.includes("Hello Vinay Temkar"));
        assert.ok(email.body.includes("Expiring Today"));
        assert.ok(email.html.includes("Document Expiry Notification"));
        assert.ok(email.html.includes("AXIOM"));
        assert.ok(email.html.includes("Procurement OS"));
        assert.ok(email.html.includes("ISO 9001 Certificate"));
        assert.ok(email.html.includes("851035 Prettl Mechatronics GmbH"));
        assert.ok(email.html.includes("Action Required"));
        assert.ok(email.html.includes("View Document in Axiom"));
        assert.ok(email.html.includes("Axiom Procurement OS &bull; PRETTL Mechatronics GmbH"));
        assert.ok(!email.html.includes("&#x20;"));
    });

    it("generates Overdue / Expired reminder email correctly", () => {
        const email = generateDocumentExpiryReminderEmail({
            userName: "Sandeep P",
            documentName: "IATF 16949 Compliance",
            documentType: "IATF 16949",
            supplierName: "Prettl Group",
            expiresAt: "20.09.2026",
            diffDays: -2,
        });

        assert.ok(email.body.includes("Expired (2 days ago)"));
        assert.ok(email.body.includes("expired on 20.09.2026"));
        assert.ok(email.html.includes("Expired (2 days ago)"));
        assert.ok(email.html.includes("IATF 16949 Compliance"));
        assert.ok(!email.html.includes("&#x20;"));
    });

    it("generates Upcoming Expiry reminder email correctly", () => {
        const email = generateDocumentExpiryReminderEmail({
            userName: "Dhanya Shetty",
            documentName: "Supplier Code of Conduct",
            documentType: "Verhaltenskodex",
            supplierName: "Prettl Mechatronics",
            expiresAt: "29.09.2026",
            diffDays: 7,
            portalUrl: "https://axiom.prettl.com/documents/conduct-doc/details",
        });

        assert.ok(email.body.includes("Expiring in 7 days"));
        assert.ok(email.html.includes("Expiring in 7 days"));
        assert.ok(email.html.includes("https://axiom.prettl.com/documents/conduct-doc/details"));
        assert.ok(!email.html.includes("&#x20;"));
    });
});

describe("Document Creator & Recipient Resolution", () => {
    it("correctly resolves Dhanya Shetty to dhanya.shetty@prettl.com even when joined user is Sandeep", () => {
        const { resolveDocumentCreator } = require("@/lib/utils/document-creator");
        const resolved = resolveDocumentCreator({
            createdByName: "Dhanya Shetty",
            createdByEmail: null,
            createdById: "some-admin-user-id",
            joinedUserName: "Sandeep P",
            joinedUserEmail: "sandeep.p@prettl.com",
        });

        assert.equal(resolved.name, "Dhanya Shetty");
        assert.equal(resolved.email, "dhanya.shetty@prettl.com");
    });

    it("correctly resolves Vinay Temkar to vinay.temkar@prettl.com", () => {
        const { resolveDocumentCreator } = require("@/lib/utils/document-creator");
        const resolved = resolveDocumentCreator({
            createdByName: "Vinay Temkar",
            createdByEmail: null,
        });

        assert.equal(resolved.name, "Vinay Temkar");
        assert.equal(resolved.email, "vinay.temkar@prettl.com");
    });

    it("correctly resolves Sandeep P to sandeep.p@prettl.com", () => {
        const { resolveDocumentCreator } = require("@/lib/utils/document-creator");
        const resolved = resolveDocumentCreator({
            createdByName: "Sandeep P",
            createdByEmail: null,
        });

        assert.equal(resolved.name, "Sandeep P");
        assert.equal(resolved.email, "sandeep.p@prettl.com");
    });

    it("derives corporate email for new users from creator name", () => {
        const { resolveDocumentCreator } = require("@/lib/utils/document-creator");
        const resolved = resolveDocumentCreator({
            createdByName: "Michael Brown",
            createdByEmail: null,
        });

        assert.equal(resolved.name, "Michael Brown");
        assert.equal(resolved.email, "michael.brown@prettl.com");
    });
});

