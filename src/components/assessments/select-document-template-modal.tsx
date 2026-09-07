"use client";

import * as React from "react";
import { toast } from "sonner";
import { Search } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { linkDocumentTemplates } from "@/app/actions/assessments";

type TemplateRow = { id: string; name: string; prechecked: boolean };

const TEMPLATES: TemplateRow[] = [
    { id: "11942", name: "Allgemeine Einkaufsbedingungen (General Terms and Conditions of Purchase)", prechecked: true },
    { id: "12100", name: "amfori BSCI", prechecked: true },
    { id: "12055", name: "EMAS", prechecked: true },
    { id: "11943", name: "Entsorgungsfachbetrieb Zertifikat (Waste disposal company certificate)", prechecked: false },
    { id: "11910", name: "IATF 16949", prechecked: false },
    { id: "15742", name: "IATF 16949 acquired", prechecked: false },
    { id: "11913", name: "ISO 13485", prechecked: true },
    { id: "11911", name: "ISO 14001", prechecked: true },
    { id: "11951", name: "ISO 17025", prechecked: false },
    { id: "12102", name: "ISO 26000", prechecked: false },
    { id: "11920", name: "ISO 27001", prechecked: false },
    { id: "12056", name: "ISO 37001", prechecked: false },
    { id: "11915", name: "ISO 45001", prechecked: true },
    { id: "11914", name: "ISO 50001", prechecked: true },
    { id: "11912", name: "ISO 9001", prechecked: true },
    { id: "11944", name: "Langzeitlieferantenerklärung (Long term supplier agreement)", prechecked: false },
    { id: "11945", name: "Qualitätssicherungsvereinbarung (Quality Assurance Agreement)", prechecked: false },
    { id: "11946", name: "Rahmenvertrag (Framework Agreement)", prechecked: false },
    { id: "11947", name: "REACH", prechecked: false },
    { id: "11948", name: "RoHS", prechecked: false },
    { id: "12101", name: "SA 8000", prechecked: false },
    { id: "12098", name: "SEDEX/SMETA", prechecked: false },
    { id: "11940", name: "TISAX", prechecked: false },
    { id: "11949", name: "Verhaltenskodex (Code of Conduct)", prechecked: false },
    { id: "11950", name: "Vertraulichkeitsvereinbarung (Non-Disclosure Agreement)", prechecked: false },
];

export function SelectDocumentTemplateModal({
    open,
    onOpenChange,
    groupId,
    alreadyLinkedIds,
    onLinked,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    groupId: string;
    alreadyLinkedIds: string[];
    onLinked?: () => void;
}) {
    const [query, setQuery] = React.useState("");
    const [selected, setSelected] = React.useState<Set<string>>(new Set(alreadyLinkedIds));
    const [isPending, startTransition] = React.useTransition();

    React.useEffect(() => {
        if (open) {
            setQuery("");
            setSelected(new Set(alreadyLinkedIds));
        }
    }, [open, alreadyLinkedIds]);

    const filtered = React.useMemo(() => {
        const q = query.trim().toLowerCase();
        return TEMPLATES.filter((t) => !q || t.name.toLowerCase().includes(q));
    }, [query]);

    const allVisibleSelected = filtered.length > 0 && filtered.every((t) => selected.has(t.id));
    const someVisibleSelected = filtered.some((t) => selected.has(t.id));

    const toggleAll = () => {
        const next = new Set(selected);
        if (allVisibleSelected) filtered.forEach((t) => next.delete(t.id));
        else filtered.forEach((t) => next.add(t.id));
        setSelected(next);
    };

    const toggleOne = (id: string) => {
        const next = new Set(selected);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelected(next);
    };

    const handleSave = () => {
        startTransition(async () => {
            const items = TEMPLATES.filter((t) => selected.has(t.id)).map((t) => ({ id: t.id, name: t.name }));
            const result = await linkDocumentTemplates(groupId, items);
            if (result.success) {
                toast.success("Documents linked");
                onOpenChange(false);
                onLinked?.();
            } else {
                toast.error(result.error || "Failed to link");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] w-[90vw] max-w-3xl flex-col gap-4 overflow-hidden p-0">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
                    <div>
                        <DialogTitle className="text-lg font-bold text-slate-900">Select Document Template</DialogTitle>
                        <DialogDescription className="mt-0.5 text-sm text-slate-500">
                            Select the document types to include in this section.
                        </DialogDescription>
                    </div>
                </div>

                {/* Search */}
                <div className="px-5">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search..."
                            className="pl-9"
                        />
                    </div>
                </div>

                {/* Table (scrollable body, fixed header) */}
                <div className="mx-5 overflow-auto rounded-lg border border-slate-200" style={{ maxHeight: "50vh" }}>
                    <table className="w-full min-w-[480px] text-sm">
                        <thead className="sticky top-0 z-10 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <tr className="border-b border-slate-200">
                                <th className="px-4 py-3 text-left">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            aria-label="Select all"
                                            ref={(el) => {
                                                if (el) el.indeterminate = !allVisibleSelected && someVisibleSelected;
                                            }}
                                            checked={allVisibleSelected}
                                            onChange={toggleAll}
                                            className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-slate-900"
                                        />
                                        <span>ID</span>
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left">Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((t) => {
                                const checked = selected.has(t.id);
                                return (
                                    <tr key={t.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    aria-label={t.name}
                                                    checked={checked}
                                                    onChange={() => toggleOne(t.id)}
                                                    className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-slate-900"
                                                />
                                                <span className="font-mono text-xs text-slate-500">{t.id}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-800">{t.name}</td>
                                    </tr>
                                );
                            })}
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={2} className="px-4 py-10 text-center text-sm text-slate-400">
                                        No templates match your search.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-4">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isPending}
                        className="bg-slate-900 text-white hover:bg-slate-800"
                    >
                        {isPending ? "Saving..." : "Save"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
