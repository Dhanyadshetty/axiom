"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, Check, Users, Layers, FolderPlus } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    getAssessmentRequests,
    addContactsToAssessmentRequest,
    addArticlesToAssessmentRequest,
} from "@/app/actions/assessments";
import type { AssessmentListRow } from "@/lib/assessment-types";

export interface AddToExistingRequestModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    contactIds?: string[];
    articleIds?: string[];
}

export function AddToExistingRequestModal({
    open,
    onOpenChange,
    contactIds = [],
    articleIds = [],
}: AddToExistingRequestModalProps) {
    const router = useRouter();
    const [requests, setRequests] = React.useState<AssessmentListRow[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [selectedId, setSelectedId] = React.useState<string | null>(null);
    const [isPending, startTransition] = React.useTransition();

    React.useEffect(() => {
        if (open) {
            setLoading(true);
            getAssessmentRequests("all")
                .then((data) => {
                    setRequests(data ?? []);
                })
                .finally(() => setLoading(false));
        } else {
            setSelectedId(null);
            setQuery("");
        }
    }, [open]);

    const filtered = React.useMemo(() => {
        const q = query.trim().toLowerCase();
        return requests.filter(
            (r) =>
                !q ||
                r.title.toLowerCase().includes(q) ||
                (r.templateName && r.templateName.toLowerCase().includes(q))
        );
    }, [requests, query]);

    const handleAdd = () => {
        if (!selectedId) {
            toast.error("Please select a request");
            return;
        }
        startTransition(async () => {
            if (contactIds.length > 0) {
                const result = await addContactsToAssessmentRequest(selectedId, contactIds);
                if (result.success) {
                    toast.success(
                        `Added ${contactIds.length} contact${contactIds.length > 1 ? "s" : ""} to request`
                    );
                    onOpenChange(false);
                    router.push(`/requests/assessments/${selectedId}?step=suppliers`);
                    router.refresh();
                } else {
                    toast.error(result.error || "Failed to add contacts to request");
                }
            } else if (articleIds.length > 0) {
                const result = await addArticlesToAssessmentRequest(selectedId, articleIds);
                if (result.success) {
                    toast.success(
                        `Added suppliers from ${articleIds.length} article${articleIds.length > 1 ? "s" : ""} to request`
                    );
                    onOpenChange(false);
                    router.push(`/requests/assessments/${selectedId}?step=suppliers`);
                    router.refresh();
                } else {
                    toast.error(result.error || "Failed to add articles to request");
                }
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <FolderPlus className="h-5 w-5 text-emerald-600" />
                        Add to existing Request
                    </DialogTitle>
                    <DialogDescription>
                        Select an existing Request to connect your selection to.
                    </DialogDescription>
                </DialogHeader>

                {contactIds.length > 0 && (
                    <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200/60 px-3 py-2 text-xs font-medium text-emerald-900">
                        <Users className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>
                            Adding <strong>{contactIds.length}</strong> selected contact{contactIds.length > 1 ? "s" : ""} to the chosen request.
                        </span>
                    </div>
                )}

                {articleIds.length > 0 && (
                    <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200/60 px-3 py-2 text-xs font-medium text-emerald-900">
                        <Layers className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>
                            Adding suppliers from <strong>{articleIds.length}</strong> selected article{articleIds.length > 1 ? "s" : ""} to the chosen request.
                        </span>
                    </div>
                )}

                <div className="space-y-2 py-2">
                    <Label htmlFor="request-search" className="text-sm font-semibold">
                        Select Request <span className="text-rose-500">*</span>
                    </Label>
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            id="request-search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search requests..."
                            className="pl-9"
                        />
                    </div>

                    <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200">
                        {loading ? (
                            <p className="p-4 text-sm text-slate-400">Loading requests...</p>
                        ) : filtered.length === 0 ? (
                            <p className="p-4 text-sm text-slate-400">No requests match your search.</p>
                        ) : (
                            filtered.map((r) => {
                                const active = selectedId === r.id;
                                return (
                                    <button
                                        key={r.id}
                                        type="button"
                                        onClick={() => setSelectedId(r.id)}
                                        className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${
                                            active ? "bg-emerald-50" : "hover:bg-slate-50"
                                        } border-b border-slate-100 last:border-0`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span
                                                className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                                    active
                                                        ? "border-emerald-500 bg-emerald-500 text-white"
                                                        : "border-slate-300"
                                                }`}
                                            >
                                                {active ? <Check className="h-3.5 w-3.5" /> : null}
                                            </span>
                                            <div>
                                                <p className="text-sm font-medium text-slate-800">
                                                    {r.title}
                                                </p>
                                                {r.templateName && (
                                                    <p className="text-xs text-slate-400">
                                                        Template: {r.templateName}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAdd}
                        disabled={isPending || !selectedId}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        {isPending ? "Adding..." : "Add to Request"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
