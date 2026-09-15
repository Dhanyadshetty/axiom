export type FilterValueType = "text" | "number" | "categorical";

export interface FilterFieldDef {
    key: string;
    label: string;
    type: FilterValueType;
}

export type FilterOperator =
    | "contains"
    | "does not contain"
    | "equals"
    | "does not equal"
    | "begins with"
    | "does not begin with"
    | "ends with"
    | "blank"
    | "not blank"
    | "greater than"
    | "greater than or equal to"
    | "less than"
    | "less than or equal to";

export interface AppliedFilter {
    id: string;
    fieldKey: string;
    fieldLabel: string;
    operator: FilterOperator;
    value: string;
    /** Used by categorical/checklist fields instead of operator+value. */
    selectedValues?: string[];
}

export const TEXT_OPERATORS: FilterOperator[] = [
    "contains",
    "does not contain",
    "equals",
    "does not equal",
    "begins with",
    "does not begin with",
    "ends with",
    "blank",
    "not blank",
];

export const NUMBER_OPERATORS: FilterOperator[] = [
    "equals",
    "does not equal",
    "greater than",
    "greater than or equal to",
    "less than",
    "less than or equal to",
    "blank",
    "not blank",
];

export const BLANK_TOKEN = "__blank__";
export const NOT_BLANK_TOKEN = "__notblank__";

export type RawValue = string | number | string[] | null | undefined;

export function operatorsForType(type: FilterValueType): FilterOperator[] {
    if (type === "number") return NUMBER_OPERATORS;
    return TEXT_OPERATORS;
}

export function isBlankValue(value: RawValue): boolean {
    if (value == null) return true;
    if (Array.isArray(value)) return value.length === 0;
    return String(value).trim() === "";
}

function asStringArray(value: RawValue): string[] {
    if (value == null) return [];
    if (Array.isArray(value)) return value.map((v) => String(v));
    return [String(value)];
}

export function evaluateCondition(condition: AppliedFilter, raw: RawValue): boolean {
    // Categorical / checklist logic
    if (condition.selectedValues && condition.selectedValues.length > 0) {
        const selected = condition.selectedValues;
        const normal = selected
            .filter((v) => v !== BLANK_TOKEN && v !== NOT_BLANK_TOKEN)
            .map((v) => String(v).toLowerCase());
        const blankSelected = selected.includes(BLANK_TOKEN);
        const notBlankSelected = selected.includes(NOT_BLANK_TOKEN);
        const values = asStringArray(raw).map((v) => v.toLowerCase());

        let matched = false;
        if (normal.length > 0 && values.some((v) => normal.includes(v))) matched = true;
        if (blankSelected && isBlankValue(raw)) matched = true;
        if (notBlankSelected && !isBlankValue(raw)) matched = true;
        return matched;
    }

    const op = condition.operator;

    if (op === "blank") return isBlankValue(raw);
    if (op === "not blank") return !isBlankValue(raw);

    const target = String(condition.value ?? "").toLowerCase();
    const cells = asStringArray(raw).map((v) => v.toLowerCase());
    const any = (pred: (cell: string) => boolean) => cells.some(pred);

    switch (op) {
        case "contains":
            return any((c) => c.includes(target));
        case "does not contain":
            return !any((c) => c.includes(target));
        case "equals":
            return any((c) => c === target);
        case "does not equal":
            return !any((c) => c === target);
        case "begins with":
            return any((c) => c.startsWith(target));
        case "does not begin with":
            return !any((c) => c.startsWith(target));
        case "ends with":
            return any((c) => c.endsWith(target));
        case "greater than":
            return Number(raw) > Number(condition.value);
        case "greater than or equal to":
            return Number(raw) >= Number(condition.value);
        case "less than":
            return Number(raw) < Number(condition.value);
        case "less than or equal to":
            return Number(raw) <= Number(condition.value);
        default:
            return true;
    }
}

export function applyFieldFilters<T>(
    rows: T[],
    filters: AppliedFilter[],
    getRaw: (row: T, key: string) => RawValue,
    validKeys?: Iterable<string>,
): T[] {
    if (!filters || filters.length === 0) return rows;

    const allowed = validKeys ? new Set(Array.from(validKeys, (value) => String(value).trim()).filter(Boolean)) : null;
    const validFilters = filters.filter((filter): filter is AppliedFilter => {
        if (!filter || typeof filter !== "object") return false;
        if (typeof filter.fieldKey !== "string" || filter.fieldKey.trim().length === 0) return false;
        if (!allowed) return true;
        return allowed.has(filter.fieldKey);
    });

    if (validFilters.length === 0) return rows;

    return rows.filter((row) =>
        validFilters.every((filter) => evaluateCondition(filter, getRaw(row, filter.fieldKey))),
    );
}

export function chipLabel(filter: AppliedFilter): string {
    if (filter.selectedValues && filter.selectedValues.length > 0) {
        const normal = filter.selectedValues.filter(
            (v) => v !== BLANK_TOKEN && v !== NOT_BLANK_TOKEN,
        );
        const extras: string[] = [];
        if (filter.selectedValues.includes(BLANK_TOKEN)) extras.push("blank");
        if (filter.selectedValues.includes(NOT_BLANK_TOKEN)) extras.push("not blank");
        const parts = [...normal, ...extras];
        const joined = parts.join(" or ");
        return parts.length === 1 ? `${filter.fieldLabel} is ${joined}` : `${filter.fieldLabel} is ${joined}`;
    }
    if (filter.operator === "blank") return `${filter.fieldLabel} is blank`;
    if (filter.operator === "not blank") return `${filter.fieldLabel} is not blank`;
    return `${filter.fieldLabel} ${filter.operator} ${filter.value}`;
}
