import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { matchesFilter, AppliedDocumentFilter } from "@/lib/utils/document-filters";

describe("Document Date Filter Engine", () => {
    const doc1 = {
        id: "1",
        name: "Doc 1",
        valid_from: "2026-09-21T00:00:00.000Z",
        created_at: "2026-09-01T10:00:00.000Z",
    };

    const doc2 = {
        id: "2",
        name: "Doc 2",
        valid_from: "2026-09-25T14:30:00.000Z",
        created_at: "2026-08-15T10:00:00.000Z",
    };

    const docBlank = {
        id: "3",
        name: "Doc Blank",
        valid_from: null,
        created_at: "2026-09-10T10:00:00.000Z",
    };

    it("filters date with 'on' operator (DD/MM/YYYY format)", () => {
        const filter: AppliedDocumentFilter = {
            key: "valid_from",
            operator: "on",
            value: "21/09/2026",
        };
        assert.equal(matchesFilter(doc1.valid_from, filter.operator, filter.value), true);
        assert.equal(matchesFilter(doc2.valid_from, filter.operator, filter.value), false);
        assert.equal(matchesFilter(docBlank.valid_from, filter.operator, filter.value), false);
    });

    it("filters date with 'not on' operator", () => {
        const filter: AppliedDocumentFilter = {
            key: "valid_from",
            operator: "not on",
            value: "21/09/2026",
        };
        assert.equal(matchesFilter(doc1.valid_from, filter.operator, filter.value), false);
        assert.equal(matchesFilter(doc2.valid_from, filter.operator, filter.value), true);
    });

    it("filters date with 'before' operator", () => {
        const filter: AppliedDocumentFilter = {
            key: "valid_from",
            operator: "before",
            value: "22/09/2026",
        };
        assert.equal(matchesFilter(doc1.valid_from, filter.operator, filter.value), true);
        assert.equal(matchesFilter(doc2.valid_from, filter.operator, filter.value), false);
    });

    it("filters date with 'before or on' operator", () => {
        const filter: AppliedDocumentFilter = {
            key: "valid_from",
            operator: "before or on",
            value: "21/09/2026",
        };
        assert.equal(matchesFilter(doc1.valid_from, filter.operator, filter.value), true);
        assert.equal(matchesFilter(doc2.valid_from, filter.operator, filter.value), false);
    });

    it("filters date with 'after' operator", () => {
        const filter: AppliedDocumentFilter = {
            key: "valid_from",
            operator: "after",
            value: "21/09/2026",
        };
        assert.equal(matchesFilter(doc1.valid_from, filter.operator, filter.value), false);
        assert.equal(matchesFilter(doc2.valid_from, filter.operator, filter.value), true);
    });

    it("filters date with 'after or on' operator", () => {
        const filter: AppliedDocumentFilter = {
            key: "valid_from",
            operator: "after or on",
            value: "21/09/2026",
        };
        assert.equal(matchesFilter(doc1.valid_from, filter.operator, filter.value), true);
        assert.equal(matchesFilter(doc2.valid_from, filter.operator, filter.value), true);
    });

    it("filters date with 'blank' and 'not blank' operators", () => {
        const blankFilter: AppliedDocumentFilter = {
            key: "valid_from",
            operator: "blank",
            value: "",
        };
        assert.equal(matchesFilter(doc1.valid_from, blankFilter.operator, blankFilter.value), false);
        assert.equal(matchesFilter(docBlank.valid_from, blankFilter.operator, blankFilter.value), true);

        const notBlankFilter: AppliedDocumentFilter = {
            key: "valid_from",
            operator: "not blank",
            value: "",
        };
        assert.equal(matchesFilter(doc1.valid_from, notBlankFilter.operator, notBlankFilter.value), true);
        assert.equal(matchesFilter(docBlank.valid_from, notBlankFilter.operator, notBlankFilter.value), false);
    });

    it("filters expires_at dates correctly with before and after", () => {
        const docExpiringSoon = { expiresAt: "2026-10-01T00:00:00.000Z" };
        const docExpiringLate = { expiresAt: "2027-01-15T00:00:00.000Z" };
        const docNoExpiry = { expiresAt: "—" };

        assert.equal(matchesFilter(docExpiringSoon.expiresAt, "before", "01/11/2026"), true);
        assert.equal(matchesFilter(docExpiringLate.expiresAt, "before", "01/11/2026"), false);
        assert.equal(matchesFilter(docNoExpiry.expiresAt, "blank", ""), true);
        assert.equal(matchesFilter(docExpiringSoon.expiresAt, "not blank", ""), true);
    });

    it("filters created_at dates correctly with on, before or on, and after", () => {
        const docCreatedSep01 = { createdAt: new Date("2026-09-01T14:22:00.000Z").toISOString() };
        const docCreatedSep21 = { createdAt: new Date("2026-09-21T08:00:00.000Z").toISOString() };

        assert.equal(matchesFilter(docCreatedSep01.createdAt, "on", "01/09/2026"), true);
        assert.equal(matchesFilter(docCreatedSep21.createdAt, "on", "21/09/2026"), true);
        assert.equal(matchesFilter(docCreatedSep01.createdAt, "before or on", "01/09/2026"), true);
        assert.equal(matchesFilter(docCreatedSep21.createdAt, "after", "01/09/2026"), true);
    });

    it("filters status with 'is one of' (multi-select) and 'is none of'", () => {
        const docValid = { status: "Valid" };
        const docPending = { status: "Pending approval" };
        const docRejected = { status: "Rejected" };
        const docBlankStatus = { status: null };

        // is one of Valid, Pending approval
        assert.equal(matchesFilter(docValid.status, "is one of", "Valid, Pending approval"), true);
        assert.equal(matchesFilter(docPending.status, "is one of", "Valid, Pending approval"), true);
        assert.equal(matchesFilter(docRejected.status, "is one of", "Valid, Pending approval"), false);
        assert.equal(matchesFilter(docBlankStatus.status, "is one of", "Valid, Pending approval"), false);

        // is one of with (Blanks)
        assert.equal(matchesFilter(docBlankStatus.status, "is one of", "(Blanks), Rejected"), true);
        assert.equal(matchesFilter(docRejected.status, "is one of", "(Blanks), Rejected"), true);
        assert.equal(matchesFilter(docValid.status, "is one of", "(Blanks), Rejected"), false);

        // is none of
        assert.equal(matchesFilter(docRejected.status, "is none of", "Rejected, Expired"), false);
        assert.equal(matchesFilter(docValid.status, "is none of", "Rejected, Expired"), true);
        assert.equal(matchesFilter(docBlankStatus.status, "is none of", "Rejected, Expired"), true);
        assert.equal(matchesFilter(docBlankStatus.status, "is none of", "(Blanks), Expired"), false);

        // blank / not blank
        assert.equal(matchesFilter(docBlankStatus.status, "blank", ""), true);
        assert.equal(matchesFilter(docValid.status, "blank", ""), false);
        assert.equal(matchesFilter(docValid.status, "not blank", ""), true);
        assert.equal(matchesFilter(docBlankStatus.status, "not blank", ""), false);
    });
});

