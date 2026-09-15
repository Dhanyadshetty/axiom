"use client";

import * as React from "react";
import type { AppliedFilter } from "./field-filter-engine";

function readFromUrl(param: string): AppliedFilter[] {
    if (typeof window === "undefined") return [];
    const params = [param, "filters"]; // keep legacy URL state compatible with older requests views
    for (const key of params) {
        const raw = new URLSearchParams(window.location.search).get(key);
        if (!raw) continue;
        try {
            const parsed = JSON.parse(decodeURIComponent(raw));
            if (!Array.isArray(parsed)) return [];
            return (parsed as AppliedFilter[]).filter(
                (filter): filter is AppliedFilter =>
                    !!filter &&
                    typeof filter === "object" &&
                    typeof filter.fieldKey === "string" &&
                    filter.fieldKey.trim().length > 0,
            );
        } catch {
            // ignore malformed state
        }
    }
    return [];
}

function writeToUrl(param: string, filters: AppliedFilter[]) {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);

    if (filters.length === 0) {
        url.searchParams.delete(param);
        url.searchParams.delete("filters");
    } else {
        url.searchParams.set(param, encodeURIComponent(JSON.stringify(filters)));
        url.searchParams.delete("filters");
    }

    window.history.replaceState(null, "", url.toString());
}

/**
 * Persists applied filters into the URL query params (the `filters` key by default)
 * so the filtered view survives reloads and can be shared. Initialised from the URL
 * on mount to avoid SSR hydration mismatches.
 */
export function usePersistedFilters(param = "filters"): [
    AppliedFilter[],
    React.Dispatch<React.SetStateAction<AppliedFilter[]>>,
] {
    const [filters, setFilters] = React.useState<AppliedFilter[]>([]);
    const loaded = React.useRef(false);

    React.useEffect(() => {
        setFilters(readFromUrl(param));
        loaded.current = true;
    }, [param]);

    React.useEffect(() => {
        if (!loaded.current) return;
        writeToUrl(param, filters);
    }, [filters, param]);

    return [filters, setFilters];
}
