"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle2, ExternalLink, Eye, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import type { DocumentReviewData } from "@/lib/assessment-templates/types";

interface DocumentReviewConfirmFieldProps {
  value: DocumentReviewData;
  onChange: (value: DocumentReviewData) => void;
  label: string;
  required?: boolean;
  help?: string;
  disabled?: boolean;
  helperText?: string;
  templates?: Array<{ id: string; name: string; nameDe?: string; url: string }>;
}

export function DocumentReviewConfirmField({
  value,
  onChange,
  label,
  required,
  help,
  disabled,
  helperText,
  templates = [],
}: DocumentReviewConfirmFieldProps) {
  const [showTemplates, setShowTemplates] = React.useState(false);
  const [reviewOpen, setReviewOpen] = React.useState(false);
  const [decision, setDecision] = React.useState<"accepted" | "declined" | "">(value.decision ?? "");

  const handleOpenReview = () => {
    setDecision(value.decision ?? "");
    setReviewOpen(true);
  };

  const handleSubmitReview = () => {
    if (!decision) return;
    onChange({
      ...value,
      confirmed: decision === "accepted",
      decision,
      confirmedAt: new Date().toISOString(),
      templateId: templates[0]?.id,
    });
    setReviewOpen(false);
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
        {label}
        {required && <span className="text-rose-500" aria-hidden="true">*</span>}
      </Label>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-sm text-slate-600">{helperText || "Please review and confirm the document"}</p>
          {templates.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500">
                {templates.length} template{templates.length > 1 ? "s" : ""} provided:
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTemplates(!showTemplates)}
                className="gap-1.5 text-slate-600 hover:text-emerald-700"
              >
                <FileText className="h-3.5 w-3.5" />
                View templates
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {value.confirmed ? (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">Confirmed</span>
              {value.confirmedAt && (
                <span className="text-xs opacity-70">
                  {new Date(value.confirmedAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onChange({ ...value, confirmed: false, decision: "" })}
                className="text-xs text-emerald-700 hover:bg-emerald-100"
              >
                Undo
              </Button>
              {!disabled && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTemplates(true)}
                  className="text-xs text-emerald-700 hover:bg-emerald-100 gap-1.5"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View confirmation
                </Button>
              )}
            </div>
          ) : (
            <Button
              onClick={handleOpenReview}
              disabled={disabled}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <FileText className="h-4 w-4" />
              Review and confirm
            </Button>
          )}
        </div>
      </div>

      {showTemplates && templates.length > 0 && (
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Available templates</span>
            <Button variant="ghost" size="icon" onClick={() => setShowTemplates(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {templates.map((tmpl) => (
              <div key={tmpl.id} className="flex items-center justify-between rounded border bg-white p-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-slate-400" />
                  <span className="text-sm text-slate-700">{tmpl.name}</span>
                </div>
                <Button variant="ghost" size="sm" className="gap-1.5" asChild>
                  <a href={tmpl.url} target="_blank" rel="noopener noreferrer">
                    <Eye className="h-3.5 w-3.5" />
                    Open
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review and confirm modal with embedded PDF viewer */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Document request: &lsquo;{label}&rsquo;</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Embedded PDF viewer (first template) */}
            {templates[0] && (
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <iframe
                  src={templates[0].url}
                  title={templates[0].name}
                  className="w-full h-72 bg-slate-50"
                />
                <div className="flex items-center justify-between p-2 border-t border-slate-200">
                  <span className="text-sm text-slate-600 truncate">{templates[0].name}</span>
                  <Button variant="ghost" size="sm" asChild className="gap-1.5">
                    <a href={templates[0].url} target="_blank" rel="noopener noreferrer" download>
                      <ExternalLink className="h-3.5 w-3.5" />
                      Download
                    </a>
                  </Button>
                </div>
              </div>
            )}

            {/* Accept / Decline radio */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Decision</p>
              <label className="flex items-center gap-2 cursor-pointer rounded-md border border-slate-200 p-3">
                <input
                  type="radio"
                  name={`decision-${label}`}
                  checked={decision === "accepted"}
                  onChange={() => setDecision("accepted")}
                  className="h-4 w-4 text-emerald-600"
                />
                <span className="text-sm text-slate-700">Accept document</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer rounded-md border border-slate-200 p-3">
                <input
                  type="radio"
                  name={`decision-${label}`}
                  checked={decision === "declined"}
                  onChange={() => setDecision("declined")}
                  className="h-4 w-4 text-rose-600"
                />
                <span className="text-sm text-slate-700">Decline document</span>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitReview} disabled={!decision} className="bg-emerald-600 hover:bg-emerald-700">
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {help && <p className="text-xs text-slate-500">{help}</p>}
    </div>
  );
}
