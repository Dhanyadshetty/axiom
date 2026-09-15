import test from "node:test";
import assert from "node:assert/strict";

import { applyFieldFilters } from "@/components/filters/field-filter-engine";
import { filterAssessmentRowsForTab } from "@/components/assessments/assessments-workspace";

test("applyFieldFilters ignores malformed or unknown field filters instead of hiding all rows", () => {
    const rows = [
        { id: "a", title: "Supplier onboarding" },
        { id: "b", title: "Risk review" },
    ];

    const filters = [
        {
            id: "bad-filter",
            fieldKey: "missing-field",
            fieldLabel: "Missing field",
            operator: "contains",
            value: "supplier",
        },
    ];

    const filtered = applyFieldFilters(rows, filters, (row, key) => {
        if (key === "title") return row.title;
        return "";
    }, ["title"]);

    assert.deepEqual(filtered, rows);
});

test("filterAssessmentRowsForTab keeps only rows created by or assigned to the current user on My Requests", () => {
    const rows = [
        { id: "a", title: "Mine", createdById: "u-1", responsibleId: "u-2", status: "draft" },
        { id: "b", title: "Assigned to me", createdById: "u-9", responsibleId: "u-1", status: "published" },
        { id: "c", title: "Other user", createdById: "u-2", responsibleId: "u-3", status: "draft" },
    ] as any[];

    const filtered = filterAssessmentRowsForTab(rows, "my", "u-1");

    assert.deepEqual(filtered.map((row) => row.id), ["a", "b"]);
    assert.deepEqual(filterAssessmentRowsForTab(rows, "all", "u-1").map((row) => row.id), ["a", "b", "c"]);
});
