"use client";

import * as React from "react";
import { toast } from "sonner";
import {
    Pencil,
    Link2,
    ArrowUp,
    ArrowDown,
    FileText,
    Plus,
    Trash2,
    GripVertical,
    MoreHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LongTextRichField } from "./form-fields/LongTextRichField";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
    addDocumentRequestGroup,
    updateDocumentRequestGroup,
    updateDocumentRequest,
    reorderDocumentRequest,
    saveAssessmentMessage,
    deleteDocumentRequestGroup,
} from "@/app/actions/assessments";
import type { AssessmentDetail } from "@/lib/assessment-types";
import { SelectDocumentTemplateModal } from "./select-document-template-modal";

export function FormStep({
    detail,
    canManage,
    onMutated,
    registerSave,
}: {
    detail: AssessmentDetail;
    canManage: boolean;
    onMutated: () => void;
    registerSave: (fn: (() => Promise<void>) | null) => void;
}) {
    const [editingMessage, setEditingMessage] = React.useState(false);
    const [messageDraft, setMessageDraft] = React.useState(detail.messageBody ?? "");
    const [linkingGroupId, setLinkingGroupId] = React.useState<string | null>(null);
    const [isPending, startTransition] = React.useTransition();
    const [activeGroupId, setActiveGroupId] = React.useState<string | null>(null);

    const handleSaveMessage = () => {
        startTransition(async () => {
            const result = await saveAssessmentMessage(detail.id, messageDraft);
            if (result.success) {
                toast.success("Message saved");
                setEditingMessage(false);
                onMutated();
            } else {
                toast.error(result.error || "Failed to save");
            }
        });
    };

    const handleSaveDraft = () => {
        return new Promise<void>((resolve) => {
            startTransition(async () => {
                const result = await saveAssessmentMessage(detail.id, messageDraft);
                if (result.success) toast.success("Saved as draft");
                else toast.error(result.error || "Failed to save");
                resolve();
            });
        });
    };

    React.useEffect(() => {
        if (!canManage) {
            registerSave(null);
            return;
        }
        registerSave(() => handleSaveDraft());
        return () => registerSave(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canManage, registerSave, messageDraft]);

    // Initialize active group to first group
    React.useEffect(() => {
        if (detail.documentRequestGroups.length > 0 && !activeGroupId) {
            setActiveGroupId(detail.documentRequestGroups[0].id);
        }
    }, [detail.documentRequestGroups, activeGroupId]);

    const handleLinkGroup = (groupId: string) => {
        setLinkingGroupId(groupId);
    };

    const handleAddGroup = () => {
        startTransition(async () => {
            const result = await addDocumentRequestGroup(detail.id, "Document requests");
            if (result.success) {
                setLinkingGroupId(result.id);
                onMutated();
            } else {
                toast.error(result.error || "Failed");
            }
        });
    };

    const activeGroup = detail.documentRequestGroups.find(g => g.id === activeGroupId) ?? null;
    const docs = React.useMemo(
        () => (activeGroup ? [...activeGroup.documents].sort((a, b) => a.order - b.order) : []),
        [activeGroup]
    );
    const allowAttach = activeGroup?.allowAdditionalAttachments ?? true;

    const [sortCol, setSortCol] = React.useState<"id" | "name" | null>(null);
    const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");

    const displayDocs = React.useMemo(() => {
        if (!sortCol) return docs;
        const sorted = [...docs].sort((a, b) => {
            const av = sortCol === "id" ? a.documentTemplateId : a.name;
            const bv = sortCol === "id" ? b.documentTemplateId : b.name;
            const cmp = String(av ?? "").localeCompare(String(bv ?? ""), undefined, { sensitivity: "base" });
            return sortDir === "asc" ? cmp : -cmp;
        });
        return sorted;
    }, [docs, sortCol, sortDir]);

    const handleSort = (col: "id" | "name") => {
        if (sortCol === col) {
            if (sortDir === "asc") setSortDir("desc");
            else { setSortCol(null); setSortDir("asc"); }
        } else {
            setSortCol(col);
            setSortDir("asc");
        }
    };

    const handleToggleRequired = (docId: string, value: boolean) => {
        startTransition(async () => {
            const result = await updateDocumentRequest(docId, { isAnswerRequired: value });
            if (!result.success) toast.error(result.error || "Failed");
            else onMutated();
        });
    };

    const handleReorder = (docId: string, dir: "up" | "down") => {
        startTransition(async () => {
            const result = await reorderDocumentRequest(docId, dir);
            if (!result.success) toast.error(result.error || "Failed");
            else onMutated();
        });
    };

    const handleToggleAttach = (value: boolean) => {
        if (!activeGroup) return;
        startTransition(async () => {
            const result = await updateDocumentRequestGroup(activeGroup.id, { allowAdditionalAttachments: value });
            if (!result.success) toast.error(result.error || "Failed");
            else onMutated();
        });
    };

    const handleUpdateGroupLabel = (groupId: string, label: string) => {
        startTransition(async () => {
            const result = await updateDocumentRequestGroup(groupId, { label });
            if (!result.success) toast.error(result.error || "Failed");
            else onMutated();
        });
    };

    const handleDeleteGroup = (groupId: string) => {
        if (!window.confirm("Delete this document request group? This will remove all linked documents.")) return;
        startTransition(async () => {
            const result = await deleteDocumentRequestGroup(groupId);
            if (!result.success) toast.error(result.error || "Failed");
            else {
                onMutated();
                // Switch to another group if available
                const remaining = detail.documentRequestGroups.filter(g => g.id !== groupId);
                if (remaining.length > 0) {
                    setActiveGroupId(remaining[0].id);
                } else {
                    setActiveGroupId(null);
                }
            }
        });
    };

    return (
        <div className="space-y-8">
            {/* 5a. Message from buyer */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                    The Request is based on the selected form. Only sections that need additional specifications will be displayed here.
                </p>

                <div className="mt-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-bold text-slate-800">Message to the supplier</Label>
                        {canManage && !editingMessage ? (
                            <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setEditingMessage(true)}>
                                <Pencil className="h-3.5 w-3.5" /> Edit
                            </Button>
                        ) : null}
                    </div>

                    {editingMessage ? (
                        <div className="mt-2 space-y-3">
                            <LongTextRichField
                                value={messageDraft}
                                onChange={setMessageDraft}
                                label="Message to the supplier"
                                required
                                placeholder="Enter your message to the supplier..."
                                disabled={!canManage}
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" onClick={() => { setEditingMessage(false); setMessageDraft(detail.messageBody ?? ""); }}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSaveMessage} disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                    {isPending ? "Saving..." : "Save message"}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-2 max-h-72 overflow-y-auto whitespace-pre-wrap rounded-lg border border-slate-100 bg-slate-50/60 p-4 text-sm leading-6 text-slate-700">
                            {detail.messageBody || "No message configured."}
                        </div>
                    )}
                </div>
            </section>

            {/* 5b. Document requests - Multiple groups */}
            <section className="space-y-6">
                {detail.documentRequestGroups.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                        <FileText className="mx-auto mb-3 h-9 w-9 text-slate-300" />
                        <p className="text-sm font-medium text-slate-600">No document request groups yet</p>
                        <p className="mt-1 text-xs text-slate-400">Click Add document request group to create one.</p>
                        {canManage && (
                            <Button className="mt-4 gap-1.5 bg-slate-900 text-white hover:bg-slate-800" onClick={handleAddGroup} disabled={isPending}>
                                <Plus className="h-4 w-4" /> Add document request group
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Group tabs/navigation */}
                        <div className="flex flex-wrap gap-2">
                            {detail.documentRequestGroups.map((group) => (
                                <div key={group.id} className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setActiveGroupId(group.id)}
                                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                            activeGroupId === group.id
                                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                : "text-slate-600 hover:bg-slate-100"
                                        }`}
                                    >
                                        <span>{group.label}</span>
                                        <span className="text-xs text-slate-400">({group.documents.length})</span>
                                    </button>
{canManage && (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <button
                type="button"
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Group options"
            >
                <MoreHorizontal className="h-4 w-4" />
            </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => handleDeleteGroup(group.id)} className="text-rose-600 focus:bg-rose-50 focus:text-rose-700">
                <Trash2 className="mr-2 h-4 w-4" /> Delete group
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
)}
                                </div>
                            ))}
                            {canManage && (
                                <Button variant="outline" size="sm" className="gap-1.5 text-slate-600 hover:text-emerald-600 hover:border-emerald-300" onClick={handleAddGroup} disabled={isPending}>
                                    <Plus className="h-3.5 w-3.5" /> Add group
                                </Button>
                            )}
                        </div>

                        {/* Active group content */}
                        {activeGroup ? (
                            <>
                                <div className="flex items-center justify-between gap-3">
                                    {canManage && (
                                        <div className="flex items-center gap-2">
                                            <Input
                                                value={activeGroup.label}
                                                onChange={(e) => handleUpdateGroupLabel(activeGroup.id, e.target.value)}
                                                placeholder="Group label"
                                                className="w-48 text-sm"
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-1.5"
                                                onClick={() => handleLinkGroup(activeGroup.id)}
                                                disabled={isPending}
                                            >
                                                <Link2 className="h-3.5 w-3.5" /> Link Document Type
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-rose-600 hover:bg-rose-50"
                                                onClick={() => handleDeleteGroup(activeGroup.id)}
                                                disabled={isPending}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {docs.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                                        <FileText className="mx-auto mb-3 h-9 w-9 text-slate-300" />
                                        <p className="text-sm font-medium text-slate-600">No document types selected yet</p>
                                        <p className="mt-1 text-xs text-slate-400">Click Link Document Type to add some.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-hidden rounded-xl border border-slate-200">
                                        <div className="max-h-[60vh] overflow-y-auto">
                                            <table className="w-full text-sm">
                                                <thead className="sticky top-0 z-10 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                    <tr className="border-b border-slate-200">
                                                        <th className="w-10 px-4 py-3 text-center">
                                                            <GripVertical className="h-4 w-4 text-slate-400 mx-auto" />
                                                        </th>
                                                        <th className="px-4 py-3 text-left">
                                                            <button type="button" onClick={() => handleSort("id")} className="inline-flex items-center gap-1 font-semibold uppercase tracking-wider hover:text-emerald-700">
                                                                ID
                                                                {sortCol === "id" ? (
                                                                    <span className="text-emerald-600">{sortDir === "asc" ? "▲" : "▼"}</span>
                                                                ) : (
                                                                    <span className="text-slate-300">↕</span>
                                                                )}
                                                            </button>
                                                        </th>
                                                        <th className="px-4 py-3 text-left">
                                                            <button type="button" onClick={() => handleSort("name")} className="inline-flex items-center gap-1 font-semibold uppercase tracking-wider hover:text-emerald-700">
                                                                Name
                                                                {sortCol === "name" ? (
                                                                    <span className="text-emerald-600">{sortDir === "asc" ? "▲" : "▼"}</span>
                                                                ) : (
                                                                    <span className="text-slate-300">↕</span>
                                                                )}
                                                            </button>
                                                        </th>
                                                        <th className="px-4 py-3 text-right">Is answer required?</th>
                                                        <th className="w-20 px-4 py-3 text-center">Order</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {displayDocs.map((doc: AssessmentDetail["documentRequestGroups"][number]["documents"][number], idx: number) => (
                                                        <tr key={doc.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
                                                            <td className="px-4 py-3 text-center text-slate-400">
                                                                <GripVertical className="h-4 w-4 mx-auto" />
                                                            </td>
                                                            <td className="px-4 py-3 font-mono text-xs text-slate-500">{doc.documentTemplateId}</td>
                                                            <td className="px-4 py-3 font-medium text-slate-800">{doc.name}</td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex justify-end">
                                                                    <button
                                                                        type="button"
                                                                        disabled={!canManage}
                                                                        onClick={() => handleToggleRequired(doc.id, !doc.isAnswerRequired)}
                                                                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                                                            doc.isAnswerRequired ? "bg-slate-900" : "bg-slate-300"
                                                                        } ${canManage ? "cursor-pointer" : "cursor-default"}`}
                                                                    >
                                                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                                            doc.isAnswerRequired ? "translate-x-4" : "translate-x-0.5"
                                                                        }`} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center justify-center gap-1">
                                                                    <button
                                                                        type="button"
                                                                        disabled={!canManage || idx === 0}
                                                                        onClick={() => handleReorder(doc.id, "up")}
                                                                        className="rounded p-1 text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30 disabled:text-slate-300"
                                                                    >
                                                                        <ArrowUp className="h-4 w-4" />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        disabled={!canManage || idx === displayDocs.length - 1}
                                                                        onClick={() => handleReorder(doc.id, "down")}
                                                                        className="rounded p-1 text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30 disabled:text-slate-300"
                                                                    >
                                                                        <ArrowDown className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {activeGroup && (
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <FileText className="h-4 w-4 text-slate-400" />
                                        <span>Allow suppliers to attach additional documents</span>
                                        <button
                                            type="button"
                                            disabled={!canManage}
                                            onClick={() => handleToggleAttach(!allowAttach)}
                                            className={`relative ml-1 inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                                allowAttach ? "bg-slate-900" : "bg-slate-300"
                                            }`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                allowAttach ? "translate-x-4" : "translate-x-0.5"
                                            }`} />
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : null}
                    </>
                )}

                {linkingGroupId ? (
                    <SelectDocumentTemplateModal
                        open={Boolean(linkingGroupId)}
                        onOpenChange={(o) => { if (!o) setLinkingGroupId(null); }}
                        groupId={linkingGroupId}
                        alreadyLinkedIds={
                            detail.documentRequestGroups
                                .find((g: AssessmentDetail["documentRequestGroups"][number]) => g.id === linkingGroupId)
                                ?.documents.map((d: AssessmentDetail["documentRequestGroups"][number]["documents"][number]) => d.documentTemplateId) ?? []
                        }
                        onLinked={onMutated}
                    />
                ) : null}
            </section>
        </div>
    );
}



