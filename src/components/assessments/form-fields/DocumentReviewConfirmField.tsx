"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, Eye, FileText, MoreVertical, Printer, RotateCw, X, ZoomIn, ZoomOut } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DocumentPreviewModal } from "../DocumentPreviewModal";
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

type Template = NonNullable<DocumentReviewConfirmFieldProps["templates"]>[number];

export function DocumentReviewConfirmField({ value, onChange, label, required, help, disabled, helperText, templates = [] }: DocumentReviewConfirmFieldProps) {
  const [showTemplates, setShowTemplates] = React.useState(false);
  const [reviewOpen, setReviewOpen] = React.useState(false);
  const [previewTemplate, setPreviewTemplate] = React.useState<Template | null>(null);
  const [selectedTemplate, setSelectedTemplate] = React.useState<Template | null>(templates[0] ?? null);
  const [decision, setDecision] = React.useState<"accepted" | "declined" | "">(value.decision ?? "");
  const [zoom, setZoom] = React.useState(100);
  const [rotation, setRotation] = React.useState(0);

  const openReview = () => {
    setDecision(value.decision ?? "");
    setSelectedTemplate(templates.find((template) => template.id === value.templateId) ?? templates[0] ?? null);
    setZoom(100);
    setRotation(0);
    setReviewOpen(true);
  };

  const submitReview = () => {
    if (!decision) return;
    onChange({ ...value, confirmed: decision === "accepted", notApplicable: false, decision, confirmedAt: new Date().toISOString(), templateId: selectedTemplate?.id });
    setReviewOpen(false);
  };

  const markNotApplicable = () => {
    onChange({ ...value, confirmed: false, notApplicable: true, decision: "", confirmedAt: new Date().toISOString() });
    setShowTemplates(false);
  };

  const viewer = (template: Template | null) => (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-2">
        <span className="max-w-[45%] truncate text-sm font-medium text-slate-700">{template?.name ?? "No template selected"}</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setZoom((current) => Math.max(50, current - 10))} title="Zoom out"><ZoomOut /></Button>
          <span className="w-12 text-center text-xs text-slate-500">{zoom}%</span>
          <Button variant="ghost" size="icon" onClick={() => setZoom((current) => Math.min(200, current + 10))} title="Zoom in"><ZoomIn /></Button>
          <Button variant="ghost" size="icon" onClick={() => setRotation((current) => (current + 90) % 360)} title="Rotate"><RotateCw /></Button>
          {template && <Button variant="ghost" size="icon" asChild title="Download"><a href={template.url} download><Download /></a></Button>}
          {template && <Button variant="ghost" size="icon" onClick={() => window.print()} title="Print"><Printer /></Button>}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-3">
        {template ? <iframe src={`${template.url}#zoom=${zoom}`} title={template.name} className="h-full min-h-[360px] w-full bg-white" style={{ transform: `rotate(${rotation}deg)`, transformOrigin: "center center" }} /> : <div className="flex h-full items-center justify-center text-sm text-slate-500">No provided template</div>}
      </div>
    </div>
  );

  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-sm font-medium text-slate-800">{label}{required && <span className="font-bold text-rose-600" aria-hidden="true">*</span>}</Label>
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <p className="text-sm text-slate-600">{helperText || "Please review and confirm the document"}</p>
          {templates.length > 0 && <div className="mt-2 flex flex-wrap items-center gap-2"><span className="text-xs text-slate-500">{templates.length} template{templates.length > 1 ? "s" : ""} provided:</span><Button variant="ghost" size="sm" onClick={() => setShowTemplates((open) => !open)} className="gap-1.5 text-slate-600 hover:text-emerald-700"><FileText className="h-3.5 w-3.5" />View templates</Button></div>}
        </div>
        {value.confirmed || value.notApplicable ? <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700">{value.notApplicable ? <span className="text-sm font-medium">Not applicable</span> : <><CheckCircle2 className="h-4 w-4" /><span className="text-sm font-medium">Confirmed</span></>}{value.confirmed && value.confirmedAt && <span className="text-xs opacity-70">{new Date(value.confirmedAt).toLocaleDateString("en-GB")}</span>}<Button variant="ghost" size="sm" onClick={() => onChange({ ...value, confirmed: false, notApplicable: false, decision: "" })} className="text-xs text-emerald-700 hover:bg-emerald-100">Undo</Button>{value.confirmed && !disabled && <Button variant="ghost" size="sm" onClick={() => setShowTemplates(true)} className="gap-1.5 text-xs text-emerald-700 hover:bg-emerald-100"><Eye className="h-3.5 w-3.5" />View confirmation</Button>}</div> : <div className="flex items-center gap-1"><Button onClick={openReview} disabled={disabled} className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"><FileText className="h-4 w-4" />Review and confirm</Button><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="icon" disabled={disabled} title="More options"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={markNotApplicable}>Not applicable</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>}
      </div>

      {showTemplates && templates.length > 0 && <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3"><div className="mb-2 flex items-center justify-between"><span className="text-sm font-medium text-slate-700">Provided templates</span><Button variant="ghost" size="icon" onClick={() => setShowTemplates(false)} aria-label="Close templates"><X /></Button></div><div className="space-y-2">{templates.map((template) => <div key={template.id} className="flex items-center justify-between rounded border bg-white p-2"><button type="button" className="max-w-[220px] truncate text-left text-sm text-slate-700 hover:underline" onClick={() => { setSelectedTemplate(template); setReviewOpen(true); setShowTemplates(false); }}>{template.name}</button><div className="flex items-center gap-1"><Button variant="ghost" size="icon" onClick={() => setPreviewTemplate(template)} title="Preview"><Eye /></Button><Button variant="ghost" size="icon" asChild title="Download"><a href={template.url} download><Download /></a></Button></div></div>)}</div></div>}

      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}><DialogContent className="flex h-[88vh] max-w-6xl flex-col overflow-hidden"><DialogHeader><DialogTitle>Document request: &lsquo;{label}&rsquo;</DialogTitle><p className="text-sm text-slate-500">Requested on this assessment.</p></DialogHeader><div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.9fr)]">{viewer(selectedTemplate)}<div className="min-h-0 space-y-4 overflow-y-auto rounded-lg border border-slate-200 bg-white p-4"><div><p className="text-sm font-semibold text-slate-800">Provided templates</p><div className="mt-2 space-y-2">{templates.map((template) => <div key={template.id} className={cn("flex items-center justify-between gap-2 rounded-md border p-2", selectedTemplate?.id === template.id ? "border-emerald-500 bg-emerald-50" : "border-slate-200")}><button type="button" className="min-w-0 truncate text-left text-sm text-slate-700" onClick={() => setSelectedTemplate(template)}><FileText className="mr-2 inline h-4 w-4" />{template.name}</button><div className="flex shrink-0"><Button variant="ghost" size="icon" onClick={() => setPreviewTemplate(template)} title="Preview"><Eye /></Button><Button variant="ghost" size="icon" asChild title="Download"><a href={template.url} download><Download /></a></Button></div></div>)}</div></div><div className="space-y-2"><p className="text-sm font-medium text-slate-700">Decision</p><label className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 p-3"><input type="radio" name={`decision-${label}`} checked={decision === "accepted"} onChange={() => setDecision("accepted")} className="h-4 w-4" /><span className="text-sm text-slate-700">Accept document</span></label><label className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 p-3"><input type="radio" name={`decision-${label}`} checked={decision === "declined"} onChange={() => setDecision("declined")} className="h-4 w-4" /><span className="text-sm text-slate-700">Decline document</span></label></div></div></div><DialogFooter><Button variant="outline" onClick={() => setReviewOpen(false)}>Cancel</Button><Button onClick={submitReview} disabled={!decision} className="bg-slate-900 hover:bg-slate-800">Submit</Button></DialogFooter></DialogContent></Dialog>
      <DocumentPreviewModal open={Boolean(previewTemplate)} onOpenChange={(open) => !open && setPreviewTemplate(null)} document={previewTemplate} />
      {help && <p className="text-xs text-slate-500">{help}</p>}
    </div>
  );
}