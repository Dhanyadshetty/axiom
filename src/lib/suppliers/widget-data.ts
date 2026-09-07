import { MOCK_SUPPLIERS } from "@/components/suppliers/tacto/suppliers-mock-data";
import { countryName } from "@/lib/utils/countryFlags";

export interface SuppliersWidgetData {
    totalSuppliers: number;
    byStatus: Array<{ label: string; value: number; color: string }>;
    byAbc: Array<{ label: string; value: number; color: string }>;
    byCountry: Array<{ label: string; value: number }>;
}

export function getSuppliersWidgetData(): SuppliersWidgetData {
    const byStatusMap = new Map<string, number>();
    const byAbcMap = new Map<string, number>();
    const byCountryMap = new Map<string, number>();

    for (const s of MOCK_SUPPLIERS) {
        byStatusMap.set(s.supplierStatus, (byStatusMap.get(s.supplierStatus) ?? 0) + 1);
        byAbcMap.set(s.abcClassification, (byAbcMap.get(s.abcClassification) ?? 0) + 1);
        const cname = countryName(s.country);
        byCountryMap.set(cname, (byCountryMap.get(cname) ?? 0) + 1);
    }

    const colorForStatus = (label: string) => {
        switch (label) {
            case "Active":
                return "bg-emerald-100 text-emerald-700";
            case "Potential Supplier":
                return "bg-orange-100 text-orange-700";
            case "Evaluation Process":
                return "bg-blue-100 text-blue-700";
            case "Rejected Supplier":
                return "bg-rose-100 text-rose-700";
            default:
                return "bg-slate-100 text-slate-700";
        }
    };

    const colorForAbc = (label: string) => {
        switch (label) {
            case "A":
                return "bg-emerald-100 text-emerald-700";
            case "B":
                return "bg-amber-100 text-amber-700";
            case "C":
                return "bg-blue-100 text-blue-700";
            default:
                return "bg-slate-100 text-slate-600";
        }
    };

    const byStatus = Array.from(byStatusMap.entries())
        .map(([label, value]) => ({ label, value, color: colorForStatus(label) }))
        .sort((a, b) => b.value - a.value);

    const byAbc = Array.from(byAbcMap.entries())
        .map(([label, value]) => ({ label, value, color: colorForAbc(label) }))
        .sort((a, b) => a.label.localeCompare(b.label));

    const byCountry = Array.from(byCountryMap.entries())
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value);

    return {
        totalSuppliers: MOCK_SUPPLIERS.length,
        byStatus,
        byAbc,
        byCountry,
    };
}