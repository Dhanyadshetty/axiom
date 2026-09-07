"use client";

import * as React from "react";
import type { AppliedFilter } from "./field-filter-engine";

function readFromUrl(param: string): AppliedFilter[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = new URLSearchParams(window.location.search).get(param);
        if (!raw) return [];
        const parsed = JSON.parse(decodeURIComponent(raw));
        if (Array.isArray(parsed)) return parsed as AppliedFilter[];
    } catch {
        // ignore malformed state
    }
    return [];
}

function writeToUrl(param: string, filters: AppliedFilter[]) {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (filters.length === 0) url.searchParams.delete(param);
    else url.searchParams.set(param, encodeURIComponent(JSON.stringify(filters)));
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
