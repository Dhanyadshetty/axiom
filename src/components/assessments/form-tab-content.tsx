import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, FileText, Users, Save, Send, Eye, AlertTriangle, Pencil, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AssessmentDetail } from "@/lib/assessment-types";
import { SetupStep } from "./setup-step";
import { FormStep } from "./form-step";
import { getBundledTemplateSchema } from "@/lib/assessment-templates";
import { ParticipantsStep } from "./participants-step";
import { RequestPreviewDialog } from "./request-preview-dialog";
import { FormRenderer } from "./FormRenderer";
import { localizeSchema } from "@/lib/assessment-templates/i18n";
import { saveAssessmentMessage } from "@/app/actions/assessments";
import { getSupplierFormPrefill } from "@/app/actions/assessments-prefill";
import type { FormAnswer } from "@/lib/assessment-templates/types";
import { toast } from "sonner";
import { validateFormAnswersDetailed } from "@/lib/assessment-templates/validate";

const stepConfig = [
    { id: "general" as const, label: "Setup", icon: <FileText className="h-4 w-4" /> },
    { id: "form" as const, label: "Form", icon: <FileText className="h-4 w-4" /> },
    { id: "participants" as const, label: "Participants", icon: <Users className="h-4 w-4" /> },
];

function StepProgressBar({
    steps,
    currentIndex,
    onSelect,
}: {
    steps: { id: string; label: string }[];
    currentIndex: number;
    onSelect: (id: string) => void;
}) {
    return (
        <div className="flex w-full max-w-md items-stretch overflow-hidden rounded-lg border border-slate-200">
            {steps.map((s, idx) => {
                const active = idx === currentIndex;
                return (
                    <button
                        key={s.id}
                        type="button"
                        onClick={() => onSelect(s.id)}
                        className={`flex-1 px-3 py-2 text-center text-sm transition-colors ${
                            active
                                ? "bg-orange-500 font-bold text-white"
                                : "bg-white font-medium text-slate-400 hover:bg-slate-50"
                        } ${idx > 0 ? "border-l border-slate-200" : ""}`}
                    >
                        {s.label}
                    </button>
                );
            })}
        </div>
    );
}

export function FormTabContent({
    detail,
    canManage,
    userOptions,
    step,
    setStep,
    onMutated,
    registerSave,
    isSavingSuppliers,
    setIsSavingSuppliers,
    isPublishing,
    handlePublish,
    goNext,
    currentIndex,
    isLastStep,
    handleSaveDraft,
    isSavingDraft,
    currentUserId,
}: {
    detail: AssessmentDetail;
    canManage: boolean;
    userOptions: { id: string; name: string | null; email: string | null; image: string | null }[];
    step: "general" | "form" | "participants";
    setStep: (s: "general" | "form" | "participants") => void;
    onMutated: () => void;
    registerSave: (fn: (() => Promise<void>) | null) => void;
    isSavingSuppliers: boolean;
    setIsSavingSuppliers: (v: boolean) => void;
    isPublishing: boolean;
    handlePublish: (notify?: boolean) => void;
    goNext: () => void;
    currentIndex: number;
    isLastStep: boolean;
    handleSaveDraft: () => void;
    isSavingDraft: boolean;
    currentUserId: string;
}) {
    const isPublished = detail.status === "published";
    const isClosed = detail.status === "closed";
    // Use the schema-driven renderer for any category with a bundled JSON
    // schema. Historically only PMA had a schema, so the legacy document-
    // group UI (`FormStep`) was used for everything else — and prefill was
    // never wired into `FormStep`. Now that all 9 categories have bundled
    // schemas, route every template with a bundled schema through
    // `SchemaFormStep` so prefill works uniformly.
    const hasSchemaTemplate =
            !!detail.template &&
            getBundledTemplateSchema(detail.template.category) !== null;

    const router = useRouter();
    const [previewOpen, setPreviewOpen] = React.useState(false);
    const goToStep = (id: "general" | "form" | "participants") => {
        setStep(id);
        router.replace(`/requests/assessments/${detail.id}?tab=form&step=${id}`, { scroll: false });
    };

    const handleSaveMessage = React.useCallback(async () => {
        if (!detail.messageBody) return;
        try {
            const result = await saveAssessmentMessage(detail.id, detail.messageBody);
            if (result.success) {
                toast.success("Message saved");
                onMutated();
            } else {
                toast.error(result.error || "Failed to save");
            }
        } catch (e) {
            toast.error("Failed to save message");
        }
    }, [detail.id, detail.messageBody, onMutated]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100">
                        <FileText className="h-4 w-4 text-slate-600" />
                    </span>
                    <div className="min-w-0">
                        <h1 className="text-xl font-bold text-slate-900 truncate">
                            {detail.id.slice(0, 8)}: {detail.title}
                        </h1>
                        <p className="text-sm text-slate-500">
                            {isPublished ? "Published — editing mode (no re-publish)" : "Draft — complete all steps to publish"}
                        </p>
                    </div>
                </div>
            </div>

            <hr className="border-slate-200" />

            {/* Step content */}
            <div className="space-y-6">
                {step === "general" ? (
                    <SetupStep detail={detail} canManage={canManage} userOptions={userOptions} registerSave={registerSave} currentUserId={currentUserId} />
                ) : null}
                {step === "form" && hasSchemaTemplate ? (
                    <SchemaFormStep
                        detail={detail}
                        canManage={canManage}
                        onMutated={onMutated}
                        registerSave={registerSave}
                    />
                ) : step === "form" ? (
                    <FormStep detail={detail} canManage={canManage} onMutated={onMutated} registerSave={registerSave} />
                ) : null}
                {step === "participants" ? (
                    <ParticipantsStep detail={detail} canManage={canManage} onMutated={onMutated} registerSave={registerSave} onSavingChange={setIsSavingSuppliers} />
                ) : null}
            </div>

            {/* Bottom action bar with segmented progress indicator */}
            <div className="sticky bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:px-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <StepProgressBar
                        steps={stepConfig}
                        currentIndex={currentIndex}
                        onSelect={(id) => goToStep(id as "general" | "form" | "participants")}
                    />

                    <div className="flex flex-wrap items-center gap-2">
                        {canManage && !isPublished && !isClosed ? (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => setPreviewOpen(true)}
                                    className="gap-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                                >
                                    <Eye className="h-4 w-4" /> Preview
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleSaveDraft}
                                    disabled={isSavingDraft}
                                    className="gap-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                                >
                                    <Save className="h-4 w-4" /> {isSavingDraft ? "Saving…" : "Save as draft"}
                                </Button>
                                <Button
                                            variant="outline"
                                            onClick={() => {
                                                const currentStepIndex = stepConfig.findIndex(s => s.id === step);
                                                if (currentStepIndex > 0) {
                                                    goToStep(stepConfig[currentStepIndex - 1].id as "general" | "form" | "participants");
                                                }
                                            }}
                                            className="gap-2 border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                                            disabled={step === "general"}
                                        >
                                            <ArrowLeft className="h-4 w-4" /> Back
                                        </Button>
                                        {isLastStep ? (
                                            <Button
                                                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                                                disabled={isPublishing || isSavingSuppliers}
                                                onClick={() => handlePublish(true)}
                                            >
                                                <Send className="h-4 w-4" /> {isPublishing ? "Publishing..." : isSavingSuppliers ? "Saving suppliers..." : "Publish Request"}
                                            </Button>
                                        ) : (
                                            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={goNext}>
                                                Next step <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        )}
                            </>
                        ) : (
                            <span className="text-sm text-slate-500 italic">
                                {isPublished
                                    ? "Request published — changes save as draft"
                                    : isClosed
                                    ? "Request closed"
                                    : ""}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <RequestPreviewDialog open={previewOpen} onOpenChange={setPreviewOpen} detail={detail} />
        </div>
    );
}

function SchemaFormStep({
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
    const [isPending, startTransition] = React.useTransition();
    const [activeSection, setActiveSection] = React.useState<string>("");
    const [showErrors, setShowErrors] = React.useState(false);
    const [fieldValidationErrors, setFieldValidationErrors] = React.useState<Record<string, string>>({});
    const [sectionValidationErrors, setSectionValidationErrors] = React.useState<Record<string, boolean>>({});
    const scrollRef = React.useRef<HTMLDivElement>(null);

    const lang: "en" | "de" = "en";
    const localizedSchema = React.useMemo(() => {
        try {
            const schema = JSON.parse(detail.template?.config ?? "{}");
            return localizeSchema(schema, lang);
        } catch {
            return null;
        }
    }, [detail.template?.config, lang]);

    const [answers, setAnswers] = React.useState<any>({});
    const [status] = React.useState<"draft" | "submitted">("draft");

    const participantKey = React.useMemo(
        () =>
            (detail.suppliers ?? [])
                .map(
                    (s) =>
                        `${s.supplierId}:${s.contactId ?? s.contacts?.[0]?.contactId ?? ""}`
                )
                .join("|"),
        [detail.suppliers]
    );

    React.useEffect(() => {
        if (!detail.id) return;
        let cancelled = false;
        (async () => {
            const prefill = await getSupplierFormPrefill(detail.id);
            if (cancelled) return;
            setAnswers((prev: any) => {
                const next: any = { ...(prev ?? {}) };
                for (const [k, v] of Object.entries(prefill as FormAnswer)) {
                    const existing = next[k];
                    const isEmpty =
                        existing === undefined ||
                        existing === null ||
                        existing === "" ||
                        (Array.isArray(existing) && existing.length === 0) ||
                        (typeof existing === "object" &&
                            !Array.isArray(existing) &&
                            existing !== null &&
                            Object.keys(existing).length === 0);
                    if (isEmpty) {
                        next[k] = v;
                    } else if (
                        typeof v === "object" &&
                        v !== null &&
                        !Array.isArray(v) &&
                        typeof existing === "object" &&
                        existing !== null
                    ) {
                        next[k] = { ...v, ...existing };
                    }
                }
                return next;
            });
        })();
        return () => {
            cancelled = true;
        };
    }, [detail.id, participantKey]);

    const handleSaveDraft = React.useCallback(async () => {
        startTransition(async () => {
            const result = await saveAssessmentMessage(detail.id, messageDraft);
            if (result.success) toast.success("Saved as draft");
            else toast.error(result.error || "Failed to save");
        });
    }, [detail.id, messageDraft]);

    React.useEffect(() => {
        if (!canManage) {
            registerSave(null);
            return;
        }
        registerSave(() => handleSaveDraft());
        return () => registerSave(null);
    }, [canManage, registerSave, handleSaveDraft]);

    // Scrollspy: observe each section within the center scroll container.
    React.useEffect(() => {
        const root = scrollRef.current;
        if (!root || !localizedSchema) return;
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
    }, [localizedSchema?.sections.length]);

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
            for (const section of localizedSchema.sections) {
                const hasErrors = detailedErrors.some((e) => e.sectionKey === section.key);
                sectionState[section.key] = hasErrors;
            }
            setSectionValidationErrors(sectionState);
        }
    }, [answers, localizedSchema, showErrors]);

    const handleScrollTo = (key: string) => {
        const el = scrollRef.current?.querySelector<HTMLElement>(`[data-section="${key}"]`);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const handleSaveMessageBtn = () => {
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

    const readOnly = status === "submitted" || !canManage;

    if (!localizedSchema || !localizedSchema.sections || !Array.isArray(localizedSchema.sections)) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
            </div>
        );
    }

    const sections = localizedSchema.sections;

    return (
        <div className="space-y-6">
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
                            <Textarea
                                value={messageDraft}
                                onChange={(e) => setMessageDraft(e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 min-h-[120px]"
                                placeholder="Enter your message to the supplier..."
                                disabled={!canManage}
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" onClick={() => { setEditingMessage(false); setMessageDraft(detail.messageBody ?? ""); }}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSaveMessageBtn} disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
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

            {/* Schema-based form */}
            <div className="flex gap-6">
                {/* Left nav (scrollspy) */}
                <nav className="w-60 shrink-0 border-r border-slate-200 bg-white overflow-y-auto hidden lg:block sticky top-24 self-start h-[calc(100vh-120px)]">
                    <div className="p-4 space-y-1">
                        {sections.map((section) => {
                            const hasErrors = sectionValidationErrors[section.key];
                            return (
                                <Button
                                    key={section.key}
                                    variant={activeSection === section.key ? "default" : "ghost"}
                                    className="w-full text-left justify-start gap-2 rounded-md px-3 py-2 text-sm border-l-2 transition"
                                    onClick={() => handleScrollTo(section.key)}
                                >
                                    <span>{section.title}</span>
                                    {hasErrors && <AlertTriangle className="h-4 w-4 text-rose-500 flex-shrink-0" />}
                                </Button>
                            );
                        })}
                    </div>
                </nav>

                {/* Center form */}
                <main ref={scrollRef} className="flex-1 overflow-y-auto px-4 lg:px-8 py-8 min-w-0">
                    <div className="max-w-4xl mx-auto">
                        <FormRenderer
                            schema={localizedSchema}
                            answers={answers}
                            onChange={setAnswers}
                            readOnly={readOnly}
                            validationErrors={fieldValidationErrors}
                        />
                    </div>
                </main>

                {/* Right details panel */}
                <aside className="w-72 shrink-0 border-l border-slate-200 bg-white overflow-y-auto hidden xl:block sticky top-24 self-start h-[calc(100vh-120px)]">
                    <div className="p-4 space-y-6">
                        <section>
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3 flex items-center justify-between">
                                Request details
                            </h3>
                            <dl className="space-y-3 text-sm">
                                <div>
                                    <dt className="text-slate-500 text-xs">Subject</dt>
                                    <dd className="text-slate-800 flex items-center gap-1">
                                        <span className="text-emerald-600">⇄</span>
                                        <span className="truncate">{detail.title}</span>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500 text-xs">Sent on</dt>
                                    <dd className="text-slate-800">{detail.createdAt ? new Date(detail.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500 text-xs">Due on</dt>
                                    <dd className="text-slate-800">{detail.dueDate ? new Date(detail.dueDate).toLocaleDateString("en-GB") : "—"}</dd>
                                </div>
                            </dl>
                        </section>

                        <section>
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
                                Contact information
                            </h3>
                            <dl className="space-y-3 text-sm">
                                <div>
                                    <dt className="text-slate-500 text-xs">Organization</dt>
                                    <dd className="text-slate-800">{detail.responsible?.name ?? "PRETTL Mechatronics & Actuators"}</dd>
                                </div>
                                {detail.responsible && (
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                                                {detail.responsible.name?.split(" ").map(n => n[0]).join("").toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="text-slate-800">{detail.responsible.name}</div>
                                            <div className="text-slate-500 text-xs">{detail.responsible.email}</div>
                                        </div>
                                    </div>
                                )}
                            </dl>
                        </section>

                        {!readOnly && (
                            <section>
                                <Button
                                    variant="outline"
                                    className="w-full gap-2 text-rose-600 border-rose-200 hover:bg-rose-50"
                                    onClick={() => setShowErrors(true)}
                                >
                                    <XCircle className="h-4 w-4" />
                                    Reject participation
                                </Button>
                            </section>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}