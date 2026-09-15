"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    ArrowRight,
    Download,
    Share2,
    Globe,
    PanelRightClose,
    PanelRightOpen,
    Save,
    Send,
    CheckCircle2,
    XCircle,
    Loader2,
    ShieldAlert,
    AlertTriangle,
    FileText,
    MessageSquare,
    Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormRenderer } from "@/components/assessments/FormRenderer";
import { DocumentPreviewModal } from "@/components/assessments/DocumentPreviewModal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import {
    saveExternalAssessmentDraft,
    submitExternalAssessment,
    rejectExternalAssessment,
    uploadExternalAssessmentDocument,
    type AssessmentStatus,
    type ExternalFormData,
} from "@/app/actions/external-assessments";
import { validateFormAnswers, validateFormAnswersDetailed, type FieldValidationError } from "@/lib/assessment-templates/validate";
import { localizeSchema } from "@/lib/assessment-templates/i18n";
import type { FileUploadData, FormAnswer } from "@/lib/assessment-templates/types";
import { getDocumentUploadLabel } from "@/lib/document-upload-display";

const STATUS_STYLES: Record<AssessmentStatus, { label: string; labelDe: string; className: string; icon: React.ReactNode }> = {
    answer_pending: { label: "Answer pending", labelDe: "Ausstehend", className: "border-amber-200 bg-amber-50 text-amber-700", icon: <span className="h-2 w-2 rounded-full bg-amber-500" /> },
    in_progress: { label: "In progress", labelDe: "In Bearbeitung", className: "border-sky-200 bg-sky-50 text-sky-700", icon: <Loader2 className="h-4 w-4 animate-spin text-sky-600" /> },
    submitted: { label: "Submitted", labelDe: "Gesendet", className: "border-emerald-200 bg-emerald-50 text-emerald-700", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
    rejected: { label: "Rejected", labelDe: "Abgelehnt", className: "border-rose-200 bg-rose-50 text-rose-700", icon: <span className="h-2 w-2 rounded-full bg-rose-500" /> },
};

    const LANGUAGES: { code: "en" | "de"; label: string }[] = [
        { code: "en", label: "English" },
        { code: "de", label: "Deutsch" },
    ];

function formatDate(iso: string | null): string {
    if (!iso) return "–";
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function getFieldValidationErrors(
    errors: FieldValidationError[],
    sectionKey: string,
    blockKey?: string
): Record<string, string> {
    const sectionBlockErrors: Record<string, string> = {};
    for (const err of errors) {
        if (err.sectionKey === sectionKey && (!blockKey || err.blockKey === blockKey)) {
            sectionBlockErrors[err.fieldKey] = err.message;
        }
    }
    return sectionBlockErrors;
}

export function ExternalAssessmentFormClient({ initialData }: { initialData: ExternalFormData }) {
    const router = useRouter();
    const [answers, setAnswers] = React.useState<FormAnswer>(initialData.answers);
    const [status, setStatus] = React.useState<AssessmentStatus>(initialData.status);
    const [rightOpen, setRightOpen] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [submitting, setSubmitting] = React.useState(false);
    const [showErrors, setShowErrors] = React.useState(false);
    const [activeSection, setActiveSection] = React.useState("edit-response");
    const [rejectOpen, setRejectOpen] = React.useState(false);
    const [rejectReason, setRejectReason] = React.useState("");
    const [submitModalOpen, setSubmitModalOpen] = React.useState(false);
    const [termsAccepted, setTermsAccepted] = React.useState(false);
    const [submittedAt, setSubmittedAt] = React.useState<string | null>(null);
    const [showUndoBanner, setShowUndoBanner] = React.useState(false);
    const [language, setLanguage] = React.useState<"en" | "de">("en");
    const [fieldValidationErrors, setFieldValidationErrors] = React.useState<Record<string, string>>({});
    const [sectionValidationErrors, setSectionValidationErrors] = React.useState<Record<string, boolean>>({});
    const [documentUploads, setDocumentUploads] = React.useState<Record<string, { url: string; name?: string | null }>>(
        Object.fromEntries(
            initialData.documentRequests
                .filter((doc) => doc.documentUrl)
                .map((doc) => [doc.id, { url: doc.documentUrl!, name: doc.name }])
        )
    );
    const [uploadingDocument, setUploadingDocument] = React.useState<string | null>(null);
    const [previewDocument, setPreviewDocument] = React.useState<{ url: string; name: string } | null>(null);
    const [previewError, setPreviewError] = React.useState(false);
    const [hasRestoredDraft, setHasRestoredDraft] = React.useState(false);
    const draftKey = `axiom:external:${initialData.id}`;

    const lang = language === "de" ? "de" : "en";
    const tr = (en: string, de: string) => (lang === "de" ? de : en);
    const localizedSchema = React.useMemo(() => 
        initialData.schema ? localizeSchema(initialData.schema, lang) : null, 
        [initialData.schema, lang]
    );

    const scrollRef = React.useRef<HTMLDivElement>(null);
    const isDraftStatus = status === "answer_pending" || status === "in_progress";
    const readonly = !isDraftStatus;

    const sections = localizedSchema?.sections ?? [];

    // Write recovery data synchronously on every change. This covers reloads
    // before the debounced server save has completed.
    React.useEffect(() => {
        if (!hasRestoredDraft || readonly || !isDraftStatus || !initialData.id) return;
        try {
            localStorage.setItem(draftKey, JSON.stringify({ answers, updatedAt: new Date().toISOString() }));
        } catch { /* Storage can be unavailable or full; server autosave still runs. */ }
    }, [answers, draftKey, hasRestoredDraft, initialData.id, isDraftStatus, readonly]);

    React.useEffect(() => {
        if (!hasRestoredDraft || readonly || !isDraftStatus) return;
        const timeout = window.setTimeout(() => {
            void saveExternalAssessmentDraft(initialData.assessmentRequestId, initialData.id, answers)
                .then((res) => {
                    if (res.ok) {
                        setStatus(res.status ?? "in_progress");
                    }
                })
                .catch(() => undefined);
        }, 1200);

        return () => window.clearTimeout(timeout);
    }, [answers, hasRestoredDraft, initialData.assessmentRequestId, initialData.id, readonly, isDraftStatus]);

    React.useEffect(() => {
        if (readonly || !isDraftStatus || !initialData.id) return;
        try {
            const stored = localStorage.getItem(draftKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                const localDraft = parsed?.answers && typeof parsed.answers === "object" ? parsed : null;
                const localIsNewer = localDraft?.updatedAt
                    && (!initialData.draftUpdatedAt || new Date(localDraft.updatedAt) > new Date(initialData.draftUpdatedAt));
                if (localDraft && localIsNewer && Object.keys(localDraft.answers).length > 0) {
                    setAnswers((prev) => ({ ...prev, ...localDraft.answers }));
                }
            }
        } catch { /* ignore */ } finally {
            setHasRestoredDraft(true);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openDocumentPreview = (url: string, name: string) => {
        if (url.startsWith("blob:")) {
            toast.error(tr("This uploaded file is no longer available. Please upload it again.", "Diese hochgeladene Datei ist nicht mehr verfügbar. Bitte laden Sie sie erneut hoch."));
            return;
        }
        setPreviewError(false);
        setPreviewDocument({ url, name });
    };

    const downloadDocument = (url: string, name: string) => {
        if (url.startsWith("blob:")) {
            toast.error(tr("This uploaded file is no longer available. Please upload it again.", "Diese hochgeladene Datei ist nicht mehr verfügbar. Bitte laden Sie sie erneut hoch."));
            return;
        }
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = name;
        // Storage URLs are durable. A new tab is safe here and preserves the
        // form if a browser cannot honor download for a cross-origin URL.
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    };

    // Scrollspy: observe each section within the center scroll container.
    React.useEffect(() => {
        const root = scrollRef.current;
        if (!root) return;
        const elements = Array.from(root.querySelectorAll<HTMLElement>("[data-section]"));
        if (elements.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                if (visible[0]) {
                    setActiveSection(visible[0].target.getAttribute("data-section") ?? "");
                }
            },
            { root, rootMargin: "0px 0px -70% 0px", threshold: 0 }
        );

        elements.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [sections.length]);

    // Update validation errors when form changes or on submit attempt
    React.useEffect(() => {
        if (showErrors && localizedSchema) {
            const detailedErrors = validateFormAnswersDetailed(localizedSchema, answers);
            setFieldValidationErrors(
                detailedErrors.reduce((acc, err) => {
                    acc[err.fieldKey] = err.message;
                    return acc;
                }, {} as Record<string, string>)
            );

            // Update section validation state
            const sectionState: Record<string, boolean> = {};
            for (const section of sections) {
                const hasErrors = detailedErrors.some((e) => e.sectionKey === section.key);
                sectionState[section.key] = hasErrors;
            }
            setSectionValidationErrors(sectionState);
        }
    }, [answers, localizedSchema, sections, showErrors]);

    const handleScrollTo = (key: string) => {
        const el = scrollRef.current?.querySelector<HTMLElement>(`[data-section="${key}"]`);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const handleSaveDraft = async () => {
        setSaving(true);
        try {
            const res = await saveExternalAssessmentDraft(
                initialData.assessmentRequestId,
                initialData.id,
                answers
            );
            if (res.ok) {
                setStatus(res.status ?? "in_progress");
                toast.success(tr("Draft saved", "Entwurf gespeichert"));
            } else {
                toast.error(res.error ?? tr("Could not save draft", "Entwurf konnte nicht gespeichert werden"));
            }
        } catch (e) {
            toast.error(tr("Could not save draft", "Entwurf konnte nicht gespeichert werden"));
        } finally {
            setSaving(false);
        }
    };

    const handleDocumentUpload = async (documentRequestId: string | null, file: File) => {
        const key = documentRequestId ?? `additional-${file.name}`;
        setUploadingDocument(key);
        try {
            const result = await uploadExternalAssessmentDocument(
                initialData.assessmentRequestId,
                initialData.id,
                documentRequestId,
                file
            );
            if (!result.ok || !result.url) {
                toast.error(result.error ?? tr("Upload failed", "Upload fehlgeschlagen"));
                return;
            }
            if (documentRequestId) {
                setDocumentUploads((prev) => ({ ...prev, [documentRequestId]: { url: result.url!, name: file.name } }));
            } else {
                const current = Array.isArray(answers.additional_documents) ? answers.additional_documents as FileUploadData[] : [];
                const uploaded: FileUploadData = { name: file.name, url: result.url, size: file.size, type: file.type };
                setAnswers((prev) => ({ ...prev, additional_documents: [...current, uploaded] }));
            }
            toast.success(tr("Document uploaded", "Dokument hochgeladen"));
        } finally {
            setUploadingDocument(null);
        }
    };

    const handleSubmit = async () => {
        setShowErrors(true);
        if (!localizedSchema) return;
        const missingDocuments = initialData.documentRequests.filter(
            (doc) => doc.isAnswerRequired && !documentUploads[doc.id]?.url
        );
        if (missingDocuments.length > 0) {
            toast.error(tr("Please upload all required documents", "Bitte laden Sie alle erforderlichen Dokumente hoch"), {
                description: missingDocuments[0].name,
            });
            return;
        }
        const errors = validateFormAnswers(localizedSchema, answers);
        if (errors.length > 0) {
            const detailed = validateFormAnswersDetailed(localizedSchema, answers);
            const byField: Record<string, string> = {};
            const sectionSet: Record<string, boolean> = {};
            for (const fe of detailed) {
                byField[fe.fieldKey] = fe.message;
                sectionSet[fe.sectionKey] = true;
            }
            setFieldValidationErrors((prev) => ({ ...prev, ...byField }));
            setSectionValidationErrors((prev) => ({ ...prev, ...sectionSet }));
            const firstSection = detailed[0]?.sectionKey;
            if (firstSection) {
                requestAnimationFrame(() => handleScrollTo(firstSection));
            }
            toast.error(tr("Please complete required fields", "Bitte Pflichtfelder ausfüllen"), {
                description: errors[0],
            });
            return;
        }
        // Open submit confirmation modal
        setTermsAccepted(false);
        setSubmitModalOpen(true);
    };

    const handleConfirmSubmit = async () => {
        setSubmitting(true);
        setSubmitModalOpen(false);
        try {
            const res = await submitExternalAssessment(
                initialData.assessmentRequestId,
                initialData.id,
                answers
            );
            if (res.ok) {
                const now = new Date().toISOString();
                setSubmittedAt(now);
                setShowUndoBanner(true);
                setStatus("submitted");
                toast.success(tr("Response submitted", "Antwort gesendet"));
                return;
            }

            if (res.errors || res.fieldErrors) {
                // Surface validation errors inline on the offending fields and
                // scroll to the first invalid section so the supplier sees the
                // exact problem instead of an opaque "Could not submit" toast.
                setShowErrors(true);
                if (res.fieldErrors && localizedSchema) {
                    const byField: Record<string, string> = {};
                    const sectionSet: Record<string, boolean> = {};
                    for (const fe of res.fieldErrors) {
                        byField[fe.fieldKey] = fe.message;
                        sectionSet[fe.sectionKey] = true;
                    }
                    setFieldValidationErrors((prev) => ({ ...prev, ...byField }));
                    setSectionValidationErrors((prev) => ({ ...prev, ...sectionSet }));

                    const firstSection = res.fieldErrors[0]?.sectionKey;
                    if (firstSection) {
                        // Defer to next frame so the new validation state has rendered.
                        requestAnimationFrame(() => handleScrollTo(firstSection));
                    }
                }
                const firstMsg = res.errors?.[0] ?? "Please complete the highlighted fields.";
                toast.error(tr("Please complete required fields", "Bitte Pflichtfelder ausfüllen"), {
                    description: firstMsg,
                });
                return;
            }

            toast.error(res.error ?? tr("Could not submit", "Senden fehlgeschlagen"));
        } catch (e) {
            console.error("Submit failed", e);
            toast.error(tr("Could not submit", "Senden fehlgeschlagen"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleUndoSubmission = async () => {
        setSubmitting(true);
        try {
            const res = await saveExternalAssessmentDraft(
                initialData.assessmentRequestId,
                initialData.id,
                answers
            );
            if (res.ok) {
                setStatus("in_progress");
                setShowUndoBanner(false);
                setSubmittedAt(null);
                toast.success(tr("Submission undone", "Einreichung rückgängig gemacht"));
            } else {
                toast.error(res.error ?? tr("Could not undo submission", "Einreichung konnte nicht rückgängig gemacht werden"));
            }
        } catch (e) {
            toast.error(tr("Could not undo submission", "Einreichung konnte nicht rückgängig gemacht werden"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleViewSuccessPage = () => {
        if (submittedAt) {
            router.push(
                `/external/assessments/${initialData.assessmentRequestId}/requests/${initialData.id}/success?submittedAt=${encodeURIComponent(submittedAt)}`
            );
        }
    };

    const handleReject = async () => {
        setSubmitting(true);
        try {
            const res = await rejectExternalAssessment(
                initialData.assessmentRequestId,
                initialData.id,
                rejectReason || undefined
            );
            if (res.ok) {
                setStatus("rejected");
                setRejectOpen(false);
                toast.success(tr("Participation rejected", "Teilnahme abgelehnt"));
            } else {
                toast.error(res.error ?? tr("Could not reject", "Ablehnen fehlgeschlagen"));
            }
        } catch (e) {
            toast.error(tr("Could not reject", "Ablehnen fehlgeschlagen"));
        } finally {
            setSubmitting(false);
        }
    };

    // Keep all hooks above this guard so a missing schema cannot change hook order.
    if (!localizedSchema?.sections?.length) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
            </div>
        );
    }

    const statusStyle = STATUS_STYLES[status];

    const navItems = [
        { key: "edit-response", title: tr("Edit response", "Antwort bearbeiten") },
        ...sections.map((s) => ({ key: s.key, title: s.title })),
    ];

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <style jsx global>{`
                @media print {
                    html,
                    body {
                        height: auto !important;
                        max-height: none !important;
                        overflow: visible !important;
                        background: #fff !important;
                    }
                    /* Neutralize any height/scroll-constrained ancestors (shell, page transition, flex layout). */
                    #__next,
                    body > *,
                    .min-h-screen,
                    .flex.flex-col,
                    .flex-1,
                    .overflow-hidden,
                    .overflow-y-auto,
                    .overflow-x-auto,
                    div,
                    main,
                    section,
                    article,
                    aside,
                    nav,
                    header,
                    footer {
                        height: auto !important;
                        max-height: none !important;
                        min-height: 0 !important;
                        overflow: visible !important;
                    }
                    header,
                    nav,
                    aside,
                    footer,
                    .no-print {
                        display: none !important;
                    }
                    main {
                        display: block !important;
                        max-width: none !important;
                        width: 100% !important;
                        padding: 0 !important;
                    }
                    main > div,
                    .max-w-3xl {
                        max-width: none !important;
                        width: 100% !important;
                    }
                    .sticky {
                        position: static !important;
                    }
                    .border-b,
                    .border-r,
                    .border-l {
                        border: none !important;
                    }
                    .shadow-sm,
                    .shadow-lg {
                        box-shadow: none !important;
                    }
                    .bg-white {
                        background: #fff !important;
                    }
                    .rounded-2xl,
                    .rounded-xl {
                        border-radius: 0 !important;
                    }
                    .p-5,
                    .p-6,
                    .p-8,
                    .px-4,
                    .px-8,
                    .py-8 {
                        padding: 0 !important;
                    }
                    .space-y-6 > * + * {
                        margin-top: 1rem !important;
                    }
                    .space-y-4 > * + * {
                        margin-top: 0.75rem !important;
                    }
                    .mb-6,
                    .mb-8 {
                        margin-bottom: 1rem !important;
                    }
                    button,
                    select,
                    .absolute.inset-0 {
                        display: none !important;
                    }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    @page {
                        margin: 14mm;
                    }
                }
            `}</style>
            {/* Top bar */}
            <header className="h-14 border-b border-slate-200 bg-white sticky top-0 z-30 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">A</span>
                    </div>
                    <span className="font-semibold text-slate-900">Axiom</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900" aria-label="Messages">
                        <MessageSquare className="h-5 w-5" />
                    </Button>
                    <div className="relative">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <Globe className="h-4 w-4" />
                            {LANGUAGES.find((l) => l.code === language)?.label ?? "English"}
                            <ArrowLeft className="h-3 w-3 rotate-90" />
                        </Button>
                        <select
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as "en" | "de")}
                            aria-label="Select language"
                        >
                            {LANGUAGES.map((l) => (
                                <option key={l.code} value={l.code}>{l.label}</option>
                            ))}
                        </select>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
                        <Download className="h-4 w-4" />
                        {tr("Export Response", "Antwort exportieren")}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() =>
                            router.push(
                                `/external/assessments/${initialData.assessmentRequestId}/requests/${initialData.id}/share`
                            )
                        }
                    >
                        <Share2 className="h-4 w-4" />
                        {tr("Share Request", "Anfrage teilen")}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setRightOpen((v) => !v)}
                        aria-label="Toggle details panel"
                    >
                        {rightOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
                    </Button>
                </div>
            </header>

            {/* Post-submission banner */}
            {showUndoBanner && submittedAt && (
                <div className="border-b border-slate-200 bg-emerald-50 px-4 py-3">
                    <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                            <span className="text-sm font-medium text-emerald-800">
                                {tr(
                                    `You submitted this request on ${new Date(submittedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} at ${new Date(submittedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`,
                                    `Sie haben diese Anfrage am ${new Date(submittedAt).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })} um ${new Date(submittedAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} eingereicht`
                                )}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleUndoSubmission}
                                disabled={submitting}
                                className="text-emerald-700 hover:bg-emerald-100 gap-1.5"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                {tr("Undo submission", "Einreichung rückgängig machen")}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleViewSuccessPage}
                                className="gap-1.5"
                            >
                                <FileText className="h-4 w-4" />
                                {tr("View details", "Details ansehen")}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Body */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left nav (scrollspy) */}
                <nav className="w-60 shrink-0 border-r border-slate-200 bg-white overflow-y-auto min-h-0 hidden md:block">
                    <div className="p-4 space-y-1">
                        {navItems.map((item) => {
                            const hasErrors = item.key !== "edit-response" && sectionValidationErrors[item.key];
                            return (
                                <button
                                    key={item.key}
                                    onClick={() => handleScrollTo(item.key)}
                                    className={cn(
                                        "w-full text-left text-sm px-3 py-2 rounded-md transition-colors border-l-2 flex items-center justify-between",
                                        activeSection === item.key
                                            ? "border-emerald-600 font-semibold text-slate-900 bg-slate-50"
                                            : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                    )}
                                >
                                    <span>{item.title}</span>
                                    {hasErrors && (
                                        <AlertTriangle className="h-4 w-4 text-rose-500 flex-shrink-0" aria-label="Validation errors in this section" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </nav>

                {/* Center form */}
<main ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 lg:px-8 py-8">
                            <div className="max-w-3xl mx-auto response-print-area">
                        <div className="flex items-center justify-between mb-6">
                            <Badge variant="outline" className={`${statusStyle.className} flex items-center gap-1.5`}>
                                {statusStyle.icon}
                                {tr(statusStyle.label, statusStyle.labelDe)}
                            </Badge>
                            {readonly && (
                                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                                    {status === "submitted" ? tr("Submitted — read only", "Gesendet — nur lesen") : tr("Rejected — read only", "Abgelehnt — nur lesen")}
                                </Badge>
                            )}
                        </div>

                        {localizedSchema && (
                        <>
                        {/* Leading "Edit response" cover page */}
                        <div data-section="edit-response" className="mb-8">
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                                        <FileText className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <h1 className="truncate text-lg font-bold text-slate-900">
                                            {initialData.requestDetails.subject}
                                        </h1>
                                        <p className="text-sm text-slate-500">{tr("Edit response", "Antwort bearbeiten")}</p>
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-wrap items-center gap-3">
                                    <Badge variant="outline" className={`${statusStyle.className} flex items-center gap-1.5`}>
                                        {statusStyle.icon}
                                        {tr(statusStyle.label, statusStyle.labelDe)}
                                    </Badge>
                                    <span className="text-sm text-slate-500">
                                        {tr(
                                            "Complete the form below and submit your response to the buyer.",
                                            "Füllen Sie das folgende Formular aus und senden Sie Ihre Antwort an den Käufer."
                                        )}
                                    </span>
                                </div>
                                {!readonly && (
                                    <div className="mt-5">
                                        <Button
                                            onClick={() => handleScrollTo(sections[0]?.key ?? "")}
                                            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                                        >
                                            {tr("Edit response", "Antwort bearbeiten")}
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <FormRenderer
                            schema={localizedSchema}
                            answers={answers}
                            onChange={setAnswers}
                            readOnly={readonly}
                            onValidate={(a) =>
                                showErrors
                                    ? (() => {
                                          const errs = validateFormAnswers(localizedSchema, a);
                                          return { valid: errs.length === 0, errors: errs };
                                      })()
                                    : { valid: true, errors: [] }
                            }
                            validationErrors={fieldValidationErrors}
                            showRequiredHighlights={showErrors}
                        />

                        {initialData.documentRequests.length > 0 && (
                            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" data-section="document-requests">
                                <h2 className="text-xl font-bold text-slate-900">{tr("Requested documents", "Angeforderte Dokumente")}</h2>
                                <div className="mt-4 space-y-4">
                                    {initialData.documentRequests.map((doc) => {
                                        const missingRequiredDocument = doc.isAnswerRequired && !documentUploads[doc.id]?.url;
                                        return (
                                        <div key={doc.id} className={cn("flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4", missingRequiredDocument ? "border-rose-300 bg-rose-50/60" : "border-slate-200 bg-white")}>
                                            <div>
                                                <p className={cn("font-medium", missingRequiredDocument ? "text-rose-800" : "text-slate-800")}>{doc.name}</p>
                                                {missingRequiredDocument ? (
                                                    <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-rose-700">
                                                        <AlertTriangle className="h-3.5 w-3.5" />
                                                        {tr("Required: please upload this document", "Erforderlich: Bitte laden Sie dieses Dokument hoch")}
                                                    </p>
                                                ) : (
                                                    <p className="text-xs text-slate-500">{doc.groupLabel}{doc.isAnswerRequired ? " · Required" : " · Optional"}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {documentUploads[doc.id] && (
                                                    <div className="flex items-center gap-1.5 text-right">
                                                        <button
                                                            type="button"
                                                            className="text-sm font-medium text-emerald-700 hover:underline max-w-[200px] truncate"
                                                            onClick={() => openDocumentPreview(documentUploads[doc.id].url, getDocumentUploadLabel(documentUploads[doc.id], doc.name))}
                                                        >
                                                            {getDocumentUploadLabel(documentUploads[doc.id], doc.name)}
                                                        </button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-slate-500 hover:text-emerald-700"
                                                            title={tr("Preview document", "Dokumentvorschau")}
                                                            onClick={() => openDocumentPreview(documentUploads[doc.id].url, getDocumentUploadLabel(documentUploads[doc.id], doc.name))}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-slate-500 hover:text-emerald-700"
                                                            title={tr("Download uploaded file", "Hochgeladene Datei herunterladen")}
                                                            onClick={() => downloadDocument(documentUploads[doc.id].url, getDocumentUploadLabel(documentUploads[doc.id], doc.name))}
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                                {!readonly && (
                                                    <label className="cursor-pointer rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                                                        {uploadingDocument === doc.id ? "Uploading..." : documentUploads[doc.id] ? "Replace file" : "Upload file"}
                                                        <input type="file" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleDocumentUpload(doc.id, file); event.currentTarget.value = ""; }} />
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {initialData.documentRequests.some((doc) => doc.allowAdditionalAttachments) && (
                            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h2 className="text-xl font-bold text-slate-900">{tr("Additional documents", "Zusätzliche Dokumente")}</h2>
                                <p className="mt-1 text-sm text-slate-500">{tr("You may provide additional documents relevant to this request.", "Sie können zusätzliche relevante Dokumente bereitstellen.")}</p>
                                {!readonly && (
                                    <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                        <FileText className="h-4 w-4" /> {tr("Add additional documents", "Zusätzliche Dokumente hinzufügen")}
                                        <input type="file" multiple className="hidden" onChange={(event) => { Array.from(event.target.files ?? []).forEach((file) => void handleDocumentUpload(null, file)); event.currentTarget.value = ""; }} />
                                    </label>
                                )}
                                {Array.isArray(answers.additional_documents) && answers.additional_documents.length > 0 && (
                                    <ul className="mt-4 space-y-2 text-sm text-slate-700">
                                        {(answers.additional_documents as FileUploadData[]).map((file, idx) => (
                                            <li key={file.url || idx} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50/50 p-2.5">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
                                                    <button
                                                        type="button"
                                                        className="text-left font-medium text-slate-800 hover:underline truncate"
                                                        onClick={() => openDocumentPreview(file.url, file.name)}
                                                    >
                                                        {file.name}
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-slate-500 hover:text-emerald-700"
                                                        title={tr("Preview document", "Dokumentvorschau")}
                                                        onClick={() => openDocumentPreview(file.url, file.name)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-slate-500 hover:text-emerald-700"
                                                        title={tr("Download document", "Dokument herunterladen")}
                                                        onClick={() => downloadDocument(file.url, file.name)}
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>
                        )}
                        </>
                    )}
                    </div>
                </main>

                {/* Right details panel */}
                {rightOpen && (
                    <aside className="w-80 shrink-0 border-l border-slate-200 bg-white overflow-y-auto min-h-0 hidden lg:block">
                        <div className="p-4 space-y-6">
                            <section>
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3 flex items-center justify-between">
                                    {tr("Request details", "Anfragedetails")}
                                </h3>
                                <dl className="space-y-3 text-sm">
                                    <div>
                                        <dt className="text-slate-500 text-xs">{tr("Subject", "Betreff")}</dt>
                                        <dd className="text-slate-800 flex items-center gap-1">
                                            <span className="text-emerald-600">⇄</span>
                                            <span className="truncate">{initialData.requestDetails.subject}</span>
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-slate-500 text-xs">{tr("Sent on", "Gesendet am")}</dt>
                                        <dd className="text-slate-800">{formatDate(initialData.requestDetails.sentOn)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-slate-500 text-xs">{tr("Due on", "Fällig am")}</dt>
                                        <dd className="text-slate-800">{formatDate(initialData.requestDetails.dueOn)}</dd>
                                    </div>
                                </dl>
                            </section>

                            <section>
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
                                    {tr("Contact information", "Kontaktinformationen")}
                                </h3>
                                <dl className="space-y-3 text-sm">
                                    <div>
                                        <dt className="text-slate-500 text-xs">{tr("Organization", "Organisation")}</dt>
                                        <dd className="text-slate-800">{initialData.contactInformation.organization}</dd>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                                                {initialData.contactInformation.mainContact.name.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="text-slate-800">{initialData.contactInformation.mainContact.name}</div>
                                            <div className="text-slate-500 text-xs">{initialData.contactInformation.email}</div>
                                        </div>
                                    </div>
                                </dl>
                            </section>

                            {!readonly && (
                                <section>
                                    <Button
                                        variant="outline"
                                        className="w-full gap-2 text-rose-600 border-rose-200 hover:bg-rose-50"
                                        onClick={() => setRejectOpen(true)}
                                    >
                                        <XCircle className="h-4 w-4" />
                                        {tr("Reject participation", "Teilnahme ablehnen")}
                                    </Button>
                                </section>
                            )}
                        </div>
                    </aside>
                )}
            </div>

            {/* Reject confirm */}
            {rejectOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md">
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex items-center gap-2 text-rose-600">
                                <ShieldAlert className="h-5 w-5" />
                                <h3 className="font-semibold text-slate-900">{tr("Reject participation", "Teilnahme ablehnen")}</h3>
                            </div>
                            <p className="text-sm text-slate-600">
                                {tr("Are you sure you want to decline this request? You can provide a reason (optional).", "Möchten Sie diese Anfrage wirklich ablehnen? Sie können einen Grund angeben (optional).")}
                            </p>
                            <textarea
                                className="w-full rounded-md border border-slate-300 p-2 text-sm"
                                rows={3}
                                placeholder={tr("Reason (optional)", "Grund (optional)")}
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" onClick={() => setRejectOpen(false)} disabled={submitting}>
                                    {tr("Cancel", "Abbrechen")}
                                </Button>
                                <Button variant="destructive" onClick={handleReject} disabled={submitting}>
                                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                                    {tr("Reject", "Ablehnen")}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Submit Response Modal */}
            {submitModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md">
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex items-center gap-2 text-slate-900">
                                <FileText className="h-5 w-5 text-emerald-600" />
                                <h3 className="font-semibold text-slate-900">{tr("Submit request", "Anfrage senden")}</h3>
                            </div>
                            <p className="text-sm text-slate-600">
                                {tr(
                                    "By submitting this response, you confirm that all information provided is accurate and complete to the best of your knowledge. You acknowledge that this information will be shared with the requesting buyer for evaluation purposes.",
                                    "Durch das Senden dieser Antwort bestätigen Sie, dass alle bereitgestellten Informationen nach bestem Wissen und Gewissen richtig und vollständig sind. Sie nehmen zur Kenntnis, dass diese Informationen zum Zwecke der Bewertung mit dem anfragenden Käufer geteilt werden."
                                )}
                            </p>
                            <label className="flex items-start gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                    className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="text-sm text-slate-700">
                                    {tr(
                                        "I have read and agree to the Privacy Policy and Terms of Service",
                                        "Ich habe die Datenschutzrichtlinie und die Nutzungsbedingungen gelesen und stimme ihnen zu"
                                    )}
                                </span>
                            </label>
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" onClick={() => setSubmitModalOpen(false)} disabled={submitting}>
                                    {tr("Cancel", "Abbrechen")}
                                </Button>
                                <Button
                                    onClick={handleConfirmSubmit}
                                    disabled={submitting || !termsAccepted}
                                    className="gap-2 bg-slate-900 hover:bg-slate-800 text-white"
                                >
                                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    {tr("Confirm", "Bestätigen")}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Bottom bar */}
            {!readonly && (
                <footer className="h-16 border-t border-slate-200 bg-white sticky bottom-0 z-30 flex items-center justify-between px-4">
                    <Button variant="outline" onClick={handleSaveDraft} disabled={saving || submitting} className="gap-2">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {tr("Save as draft", "Als Entwurf speichern")}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={saving || submitting}
                        className="gap-2 bg-slate-900 hover:bg-slate-800 text-white"
                    >
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        {tr("Submit response", "Antwort senden")}
                    </Button>
                </footer>
            )}

            {readonly && (
                <footer className="h-16 border-t border-slate-200 bg-white sticky bottom-0 z-30 flex items-center justify-center px-4">
                    <span className="text-sm text-slate-500">
                        {tr("This response is submitted and can no longer be edited.", "Diese Antwort wurde gesendet und kann nicht mehr bearbeitet werden.")}
                        {status === "rejected" && tr(" This response is rejected and can no longer be edited.", " Diese Antwort wurde abgelehnt und kann nicht mehr bearbeitet werden.")}
                    </span>
                </footer>
            )}

            <DocumentPreviewModal
                open={Boolean(previewDocument)}
                onOpenChange={(open) => {
                    if (!open) {
                        setPreviewDocument(null);
                        setPreviewError(false);
                    }
                }}
                document={previewDocument}
            />
        </div>
    );
}
