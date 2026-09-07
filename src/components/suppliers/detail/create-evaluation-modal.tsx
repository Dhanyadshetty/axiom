"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    createEvaluation,
    type CreateEvaluationInput,
} from "@/app/actions/supplier-evaluations";
import type { SupplierEvaluationTemplate } from "@/db/schema";

export interface CreateEvaluationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    supplierId: string;
    supplierName: string;
    templates: SupplierEvaluationTemplate[];
    onCreated?: () => void | Promise<void>;
}

export function CreateEvaluationModal({
    open,
    onOpenChange,
    supplierId,
    supplierName,
    templates,
    onCreated,
}: CreateEvaluationModalProps) {
    const [templateId, setTemplateId] = React.useState("");
    const [title, setTitle] = React.useState("");
    const [language, setLanguage] = React.useState("en");
    const [notes, setNotes] = React.useState("");
    const [submitting, setSubmitting] = React.useState(false);

    React.useEffect(() => {
        if (open) {
            setTemplateId(templates[0]?.id ?? "");
            setTitle("");
            setLanguage("en");
            setNotes("");
            setSubmitting(false);
        }
    }, [open, templates]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (submitting) return;

        const payload: CreateEvaluationInput = {
            supplierId,
            templateId,
            title: title.trim(),
            language: language.trim() || "en",
            notes: notes.trim() ? notes.trim() : undefined,
        };

        setSubmitting(true);
        try {
            const result = await createEvaluation(payload);
            if (result.success) {
                toast.success("Evaluation created");
                if (onCreated) {
                    await onCreated();
                } else {
                    onOpenChange(false);
                }
            } else {
                toast.error(result.error || "Failed to create evaluation");
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to create evaluation");
        } finally {
            setSubmitting(false);
        }
    };

    const canSubmit = Boolean(templateId) && title.trim().length > 0 && !submitting;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Create evaluation</DialogTitle>
                    <DialogDescription>
                        Start a new evaluation for {supplierName}. Choose a template and give it a
                        descriptive title.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="evaluation-template">Template</Label>
                        <select
                            id="evaluation-template"
                            value={templateId}
                            onChange={(event) => setTemplateId(event.target.value)}
                            className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
                            disabled={submitting || templates.length === 0}
                            required
                        >
                            {templates.length === 0 ? (
                                <option value="">No templates available</option>
                            ) : (
                                templates.map((template) => (
                                    <option key={template.id} value={template.id}>
                                        {template.name}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="evaluation-title">Title</Label>
                        <Input
                            id="evaluation-title"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            placeholder={`e.g. ${supplierName} — Q1 ESG review`}
                            required
                            disabled={submitting}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="evaluation-language">Language</Label>
                        <Input
                            id="evaluation-language"
                            value={language}
                            onChange={(event) => setLanguage(event.target.value)}
                            placeholder="en"
                            maxLength={8}
                            disabled={submitting}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="evaluation-notes">Notes</Label>
                        <Textarea
                            id="evaluation-notes"
                            value={notes}
                            onChange={(event) => setNotes(event.target.value)}
                            placeholder="Optional context for this evaluation"
                            rows={3}
                            disabled={submitting}
                        />
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!canSubmit} className="gap-1.5">
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            Create evaluation
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
