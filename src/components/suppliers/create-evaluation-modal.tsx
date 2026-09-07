"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronDown, FileText, Info, Loader2, Search, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
    createEvaluation,
    getEvaluationTemplates,
    type CreateEvaluationInput,
} from "@/app/actions/supplier-evaluations";
import type { SupplierEvaluationTemplate } from "@/db/schema";

const SUPPORTED_LANGUAGES = [
    { code: "en", label: "English" },
    { code: "de", label: "Deutsch" },
    { code: "es", label: "Español" },
    { code: "fr", label: "Français" },
    { code: "it", label: "Italiano" },
    { code: "zh", label: "中文" },
];

export interface CreateEvaluationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    supplierId: string;
    supplierName?: string;
    onCreated?: (evaluationId: string) => void;
    /** Optional list of preloaded templates. If undefined, will be fetched when opened. */
    templates?: SupplierEvaluationTemplate[];
}

export function CreateEvaluationModal({
    open,
    onOpenChange,
    supplierId,
    supplierName,
    onCreated,
    templates: providedTemplates,
}: CreateEvaluationModalProps) {
    const router = useRouter();
    const [templates, setTemplates] = React.useState<SupplierEvaluationTemplate[]>(
        providedTemplates ?? [],
    );
    const [templatesLoading, setTemplatesLoading] = React.useState(false);
    const [templateId, setTemplateId] = React.useState<string>("");
    const [title, setTitle] = React.useState<string>("");
    const [titleTouched, setTitleTouched] = React.useState(false);
    const [language, setLanguage] = React.useState<string>("en");
    const [tplSearch, setTplSearch] = React.useState("");
    const [tplOpen, setTplOpen] = React.useState(false);
    const [submitting, setSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const tplButtonRef = React.useRef<HTMLButtonElement>(null);
    const tplListRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (providedTemplates) {
            setTemplates(providedTemplates);
            return;
        }
        if (!open) return;
        let cancelled = false;
        setTemplatesLoading(true);
        getEvaluationTemplates()
            .then((rows) => {
                if (cancelled) return;
                setTemplates(rows);
            })
            .catch((err) => {
                if (cancelled) return;
                console.error("Failed to load evaluation templates:", err);
            })
            .finally(() => {
                if (!cancelled) setTemplatesLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [open, providedTemplates]);

    React.useEffect(() => {
        if (!open) {
            setTemplateId("");
            setTitle("");
            setTitleTouched(false);
            setLanguage("en");
            setTplSearch("");
            setTplOpen(false);
            setError(null);
            setSubmitting(false);
        }
    }, [open]);

    const selectedTemplate = React.useMemo(
        () => templates.find((t) => t.id === templateId) ?? null,
        [templates, templateId],
    );

    React.useEffect(() => {
        if (selectedTemplate && !titleTouched) {
            setTitle(selectedTemplate.name);
        }
    }, [selectedTemplate, titleTouched]);

    const filteredTemplates = React.useMemo(() => {
        const q = tplSearch.trim().toLowerCase();
        if (!q) return templates;
        return templates.filter(
            (t) =>
                t.name.toLowerCase().includes(q) ||
                (t.description ?? "").toLowerCase().includes(q),
        );
    }, [templates, tplSearch]);

    const canSubmit = Boolean(templateId && title.trim() && !submitting);

    const handleSelectTemplate = (t: SupplierEvaluationTemplate) => {
        setTemplateId(t.id);
        setTplSearch("");
        setTplOpen(false);
        setError(null);
    };

    React.useEffect(() => {
        if (!tplOpen) return;
        const handler = (e: MouseEvent) => {
            if (
                tplButtonRef.current &&
                !tplButtonRef.current.contains(e.target as Node) &&
                tplListRef.current &&
                !tplListRef.current.contains(e.target as Node)
            ) {
                setTplOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [tplOpen]);

    const handleClose = () => {
        if (submitting) return;
        onOpenChange(false);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!canSubmit) return;
        setSubmitting(true);
        setError(null);
        try {
            const input: CreateEvaluationInput = {
                supplierId,
                templateId,
                title: title.trim(),
                language,
            };
            const result = await createEvaluation(input);
            if (result.success) {
                toast.success("Evaluation created");
                onCreated?.(result.evaluation.id);
                router.refresh();
                onOpenChange(false);
            } else {
                setError(result.error);
            }
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Failed to create evaluation");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={(v) => (!submitting ? onOpenChange(v) : undefined)}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <Dialog.Content
                    className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[560px] max-w-[94vw] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
                    onEscapeKeyDown={(e) => {
                        if (submitting) e.preventDefault();
                    }}
                    onPointerDownOutside={(e) => {
                        if (submitting) e.preventDefault();
                    }}
                >
                    <div className="mb-4 flex items-start justify-between gap-4">
                        <div>
                            <Dialog.Title className="flex items-center gap-2 text-xl font-black tracking-tight text-slate-950">
                                <FileText className="h-5 w-5 text-primary" />
                                Create new Evaluation
                            </Dialog.Title>
                            <Dialog.Description className="mt-1 text-sm text-slate-500">
                                {supplierName ? (
                                    <>
                                        For supplier{" "}
                                        <span className="font-semibold text-slate-700">{supplierName}</span>
                                    </>
                                ) : (
                                    "Choose a template and give the evaluation a title."
                                )}
                            </Dialog.Description>
                        </div>
                        <Dialog.Close
                            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            aria-label="Close"
                            onClick={(e) => {
                                e.preventDefault();
                                handleClose();
                            }}
                        >
                            <X className="h-4 w-4" />
                        </Dialog.Close>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="eval-template" className="text-sm font-semibold text-slate-800">
                                Select Evaluation template <span className="text-rose-500">*</span>
                            </Label>
                            <div className="relative">
                                <button
                                    ref={tplButtonRef}
                                    type="button"
                                    id="eval-template"
                                    onClick={() => setTplOpen((v) => !v)}
                                    className={cn(
                                        "flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-sm transition-colors hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
                                        !selectedTemplate && "text-slate-400",
                                    )}
                                    aria-haspopup="listbox"
                                    aria-expanded={tplOpen}
                                >
                                    <span className="truncate text-left">
                                        {selectedTemplate
                                            ? selectedTemplate.name
                                            : templatesLoading
                                              ? "Loading templates…"
                                              : "Select a template"}
                                    </span>
                                    <ChevronDown
                                        className={cn(
                                            "h-4 w-4 text-slate-400 transition-transform",
                                            tplOpen && "rotate-180",
                                        )}
                                    />
                                </button>
                                {tplOpen ? (
                                    <div
                                        ref={tplListRef}
                                        className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-slate-200 bg-white shadow-xl"
                                    >
                                        <div className="border-b border-slate-100 p-1.5">
                                            <div className="relative">
                                                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                                                <Input
                                                    autoFocus
                                                    value={tplSearch}
                                                    onChange={(e) => setTplSearch(e.target.value)}
                                                    placeholder="Search templates…"
                                                    className="h-8 pl-7 text-sm"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                        </div>
                                        <div className="max-h-60 overflow-auto py-1" role="listbox">
                                            {filteredTemplates.length === 0 ? (
                                                <div className="px-3 py-3 text-center text-sm text-slate-500">
                                                    {templatesLoading
                                                        ? "Loading…"
                                                        : "No templates found."}
                                                </div>
                                            ) : (
                                                filteredTemplates.map((t) => (
                                                    <button
                                                        key={t.id}
                                                        type="button"
                                                        onClick={() => handleSelectTemplate(t)}
                                                        onMouseDown={(e) => e.preventDefault()}
                                                        className={cn(
                                                            "flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm transition-colors hover:bg-slate-50",
                                                            t.id === templateId && "bg-primary/10 text-primary",
                                                        )}
                                                        role="option"
                                                        aria-selected={t.id === templateId}
                                                    >
                                                        <span className="font-medium text-slate-900">
                                                            {t.name}
                                                        </span>
                                                        {t.description ? (
                                                            <span className="line-clamp-2 text-xs text-slate-500">
                                                                {t.description}
                                                            </span>
                                                        ) : null}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                            {selectedTemplate ? (
                                <div className="mt-2 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                    <span>
                                        The Evaluation template can&apos;t be changed after creation.
                                    </span>
                                </div>
                            ) : null}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="eval-title" className="text-sm font-semibold text-slate-800">
                                Evaluation title <span className="text-rose-500">*</span>
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    id="eval-title"
                                    value={title}
                                    onChange={(e) => {
                                        setTitle(e.target.value);
                                        setTitleTouched(true);
                                    }}
                                    placeholder="Evaluation title"
                                    className="flex-1"
                                    autoComplete="off"
                                />
                                <select
                                    aria-label="Language"
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="h-10 rounded-md border border-slate-200 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    {SUPPORTED_LANGUAGES.map((l) => (
                                        <option key={l.code} value={l.code}>
                                            {l.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {error ? (
                            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                                {error}
                            </div>
                        ) : null}

                        <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={!canSubmit}
                                className="min-w-[160px]"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating…
                                    </>
                                ) : (
                                    "Create Evaluation"
                                )}
                            </Button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
