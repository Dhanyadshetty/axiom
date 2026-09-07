"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, Plus, FileText, Check } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAssessmentRequest } from "@/app/actions/assessments";
import type { AssessmentTemplate } from "@/lib/assessment-types";

export function CreateRequestModal({
    templates,
    defaultOpen = false,
    onOpenChange,
}: {
    templates: AssessmentTemplate[];
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}) {
    const router = useRouter();
    const [open, setOpen] = React.useState(defaultOpen);
    const [query, setQuery] = React.useState("");
    const [selectedId, setSelectedId] = React.useState<string | null>(null);
    const [title, setTitle] = React.useState("");
    const [isPending, startTransition] = React.useTransition();

    const setOpenSafe = (v: boolean) => {
        setOpen(v);
        onOpenChange?.(v);
    };

    const filtered = React.useMemo(() => {
        const q = query.trim().toLowerCase();
        return templates.filter((t) => !q || t.name.toLowerCase().includes(q));
    }, [templates, query]);

    const handleCreate = () => {
        if (!selectedId) {
            toast.error("Please select a form template");
            return;
        }
        startTransition(async () => {
            const result = await createAssessmentRequest(selectedId, title.trim() || undefined);
            if (result.success && result.id) {
                toast.success("Draft request created");
                setOpenSafe(false);
                router.push(`/requests/assessments/${result.id}?step=general`);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to create request");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpenSafe}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Plus className="h-4 w-4" />
                    Create new
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <FileText className="h-5 w-5 text-emerald-600" />
                        Create new Request
                    </DialogTitle>
                    <DialogDescription>
                        You can create a new Request by selecting a template from the list below.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-2 py-2">
                    <Label htmlFor="template-search" className="text-sm font-semibold">
                        Select form <span className="text-rose-500">*</span>
                    </Label>
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            id="template-search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search templates..."
                            className="pl-9"
                        />
                    </div>

                    <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200">
                        {filtered.length === 0 ? (
                            <p className="p-4 text-sm text-slate-400">No templates match your search.</p>
                        ) : (
                            filtered.map((t) => {
                                const active = selectedId === t.id;
                                return (
                                    <button
                                        key={t.id}
                                        onClick={() => { setSelectedId(t.id); setTitle(t.name); }}
                                        className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${
                                            active ? "bg-emerald-50" : "hover:bg-slate-50"
                                        } border-b border-slate-100 last:border-0`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                                active ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300"
                                            }`}>
                                                {active ? <Check className="h-3.5 w-3.5" /> : null}
                                            </span>
                                            <span className="text-sm font-medium text-slate-800">{t.name}</span>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="request-title" className="text-sm font-semibold">
                        Title <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                        id="request-title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Request title"
                    />
                    <p className="text-xs text-slate-400">
                        Auto-filled from the selected form. You can edit it.
                    </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" onClick={() => setOpenSafe(false)}>Cancel</Button>
                    <Button
                        onClick={handleCreate}
                        disabled={isPending || !selectedId}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        {isPending ? "Creating..." : "Create draft"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
