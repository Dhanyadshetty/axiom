"use client";

import { useEffect, useState } from "react";

export interface SupplierTablePrefs {
    defaultView: string;
    freezeFirstColumn: boolean;
    density: "comfortable" | "compact";
}

const KEY = "axiom.suppliers.tablePrefs";

const DEFAULTS: SupplierTablePrefs = {
    defaultView: "classification",
    freezeFirstColumn: true,
    density: "comfortable",
};

export function useSupplierTablePrefs() {
    const [prefs, setPrefs] = useState<SupplierTablePrefs>(DEFAULTS);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(KEY);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            if (raw) setPrefs({ ...DEFAULTS, ...JSON.parse(raw) });
        } catch {
            // ignore
        }
        setLoaded(true);
    }, []);

    const update = (patch: Partial<SupplierTablePrefs>) => {
        setPrefs((prev) => {
            const next = { ...prev, ...patch };
            try {
                localStorage.setItem(KEY, JSON.stringify(next));
            } catch {
                // ignore
            }
            return next;
        });
    };

    const reset = () => {
        setPrefs(DEFAULTS);
        try {
            localStorage.removeItem(KEY);
        } catch {
            // ignore
        }
    };

    return { prefs, update, reset, loaded };
}
