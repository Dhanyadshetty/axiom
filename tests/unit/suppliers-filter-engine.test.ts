import test from "node:test";
import assert from "node:assert/strict";

import { MOCK_SUPPLIERS } from "@/components/suppliers/tacto/suppliers-mock-data";
import {
    SUPPLIER_VIEWS,
    type FilterOperator,
    type FilterRule,
    getFieldValue,
} from "@/components/suppliers/tacto/suppliers-model";

// ---------------------------------------------------------------------------
// Filter rule evaluator (mirrors evalRule in SuppliersModule.tsx)
// ---------------------------------------------------------------------------

function isBlank(value: unknown): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === "string") return value.trim() === "";
    if (typeof value === "boolean") return value === false;
    if (Array.isArray(value)) return value.length === 0;
    return false;
}

function evalRule(
    rule: FilterRule,
    field: ReturnType<typeof getFieldValue>,
): boolean {
    switch (rule.operator) {
        case "is_one_of": {
            const allowed = Array.isArray(rule.value) ? rule.value : [String(rule.value)];
            if (Array.isArray(field))
                return field.some((v) => allowed.includes(String(v)));
            if (isBlank(field)) return false;
            return allowed.includes(String(field));
        }
        case "is_none_of": {
            const denied = Array.isArray(rule.value) ? rule.value : [String(rule.value)];
            if (isBlank(field)) return true;
            if (Array.isArray(field))
                return !field.some((v) => denied.includes(String(v)));
            return !denied.includes(String(field));
        }
        case "equals":
            if (typeof rule.value === "boolean") return field === rule.value;
            if (isBlank(field)) return false;
            return String(field) === String(rule.value);
        case "not_equals":
            if (typeof rule.value === "boolean") return field !== rule.value;
            if (isBlank(field)) return true;
            return String(field) !== String(rule.value);
        case "contains": {
            const needle = String(rule.value ?? "").toLowerCase();
            if (!needle) return true;
            if (isBlank(field)) return false;
            if (Array.isArray(field))
                return field.some((v) => String(v).toLowerCase().includes(needle));
            return String(field).toLowerCase().includes(needle);
        }
        case "gte":
            return Number(field) >= Number(rule.value);
        case "lte":
            return Number(field) <= Number(rule.value);
        case "is_blank":
            return isBlank(field);
        case "is_not_blank":
            return !isBlank(field);
        default:
            return true;
    }
}

function applyFilters(rules: FilterRule[]) {
    return MOCK_SUPPLIERS.filter((supplier) => {
        let result = evalRule(rules[0], getFieldValue(supplier, rules[0].field));
        for (let i = 1; i < rules.length; i++) {
            const next = evalRule(rules[i], getFieldValue(supplier, rules[i].field));
            result = rules[i].connector === "or" ? result || next : result && next;
        }
        return result;
    });
}

// ---------------------------------------------------------------------------
// 1.1 Classification view — column parity
// ---------------------------------------------------------------------------

test("1.1 Classification view exposes exactly the spec'd 11 columns in order", () => {
    const view = SUPPLIER_VIEWS.find((v) => v.id === "classification");
    assert.ok(view, "classification view must exist");
    assert.deepEqual(view.columns, [
        "supplierId",
        "supplierName",
        "country",
        "orderVolume2025",
        "orderVolume2024",
        "abc",
        "status",
        "supplierType",
        "areaOfNeed",
        "commodityGroup",
        "responsibleBuyer",
    ]);
    assert.equal(view.columns.length, 11);
});

test("Classification default sort is orderVolume2024 desc", () => {
    const view = SUPPLIER_VIEWS.find((v) => v.id === "classification")!;
    assert.deepEqual(view.defaultSort, { id: "orderVolume2024", dir: "desc" });
});

// ---------------------------------------------------------------------------
// New filter operators
// ---------------------------------------------------------------------------

test("contains on Supplier Name narrows rows", () => {
    const rule: FilterRule = {
        field: "supplierName",
        operator: "contains" as FilterOperator,
        value: "Helios",
        connector: "and",
    };
    const matches = applyFilters([rule]);
    assert.equal(matches.length, 1);
    assert.match(matches[0].name, /Helios/);
});

test("contains on Supplier ID matches by substring", () => {
    const rule: FilterRule = {
        field: "supplierId",
        operator: "contains" as FilterOperator,
        value: "700",
        connector: "and",
    };
    const matches = applyFilters([rule]);
    assert.ok(matches.length >= 2);
    assert.ok(matches.every((s) => s.id.includes("700")));
});

test("gte on Order Volume 2025 returns high-value suppliers", () => {
    const rule: FilterRule = {
        field: "orderVolume2025",
        operator: "gte" as FilterOperator,
        value: 1_000_000,
        connector: "and",
    };
    const matches = applyFilters([rule]);
    assert.ok(matches.length >= 2);
    assert.ok(matches.every((s) => s.orderVolume2025 >= 1_000_000));
});

test("lte on Order Volume 2025 returns low-value suppliers", () => {
    const rule: FilterRule = {
        field: "orderVolume2025",
        operator: "lte" as FilterOperator,
        value: 100_000,
        connector: "and",
    };
    const matches = applyFilters([rule]);
    assert.ok(matches.every((s) => s.orderVolume2025 <= 100_000));
});

test("is_one_of on abcClassification picks A/B/C subsets", () => {
    const rule: FilterRule = {
        field: "abcClassification",
        operator: "is_one_of" as FilterOperator,
        value: ["A"],
        connector: "and",
    };
    const matches = applyFilters([rule]);
    assert.ok(matches.length >= 1);
    assert.ok(matches.every((s) => s.abcClassification === "A"));
});

test("is_blank on supplierType matches suppliers without a type", () => {
    const rule: FilterRule = {
        field: "supplierType",
        operator: "is_blank" as FilterOperator,
        value: null,
        connector: "and",
    };
    const matches = applyFilters([rule]);
    assert.ok(matches.length >= 1);
    assert.ok(matches.every((s) => !s.supplierType));
});

test("multiple filters chain with explicit and/or connector", () => {
    const rules: FilterRule[] = [
        {
            field: "country",
            operator: "is_one_of" as FilterOperator,
            value: ["DE"],
            connector: "and",
        },
        {
            field: "orderVolume2025",
            operator: "gte" as FilterOperator,
            value: 1_000_000,
            connector: "or",
        },
    ];
    // OR semantics: matches that are DE OR have volume >= 1M
    const matches = applyFilters(rules);
    assert.ok(
        matches.some((s) => s.country === "DE"),
        "DE suppliers included",
    );
    assert.ok(
        matches.some((s) => s.orderVolume2025 >= 1_000_000),
        "high-volume suppliers included",
    );
});