"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
    ChevronRight,
    ChevronDown,
    MoreHorizontal,
    PanelRightClose,
    PanelRightOpen,
    CircleDot,
    ArrowLeftRight,
    Send,
    FileText,
    Users,
    Calendar,
    X,
    ListChecks,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    publishAssessment,
    closeAssessment,
    getAssessmentContacts,
} from "@/app/actions/assessments";
import type { AssessmentDetail } from "@/lib/assessment-types";
import { SetupStep } from "./setup-step";
import { FormStep } from "./form-step";
import { ParticipantsStep } from "./participants-step";
import { DraftSavedToast } from "./preview/draft-saved-toast";
import { OverviewPanelNew, OverviewSidebar } from "./overview-panel-new";
import { ResponsesPanelNew, ResponsesSidebar } from "./responses-panel-new";
import { FormTabContent } from "./form-tab-content";
import { ShareRequestClient } from "./share-request-client";

export type View = "overview" | "responses" | "form" | "share";
export type Step = "general" | "form" | "participants";

const statusStyles: Record<string, { dot: string; label: string; badge: string }> = {
    draft: { dot: "bg-blue-500", label: "Draft", badge: "border-blue-200 bg-blue-50 text-blue-700" },
    published: { dot: "bg-emerald-500", label: "Published", badge: "border-emerald-200 bg-emerald-50 text-emerald-700" },
    closed: { dot: "bg-rose-500", label: "Closed", badge: "border-rose-200 bg-rose-50 text-rose-700" },
};

function initials(name: string | null) {
    if (!name) return "?";
    return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function formatDateTime(value: Date | string | null) {
    if (!value) return "—";
    const d = typeof value === "string" ? new Date(value) : value;
    return d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function AssessmentDetailClient({
    detail,
    userOptions,
    canManage,
    initialStep,
    initialView,
    currentUserId,
}: {
    detail: AssessmentDetail;
    userOptions: { id: string; name: string | null; email: string | null; image: string | null }[];
    canManage: boolean;
    initialStep: Step;
    initialView: View;
    currentUserId: string;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [view, setView] = React.useState<View>(initialView);
    const [step, setStep] = React.useState<Step>(initialStep);
    const [sidebarOpen, setSidebarOpen] = React.useState(true);
    const [detailsOpen, setDetailsOpen] = React.useState(true);
    const [moreOpen, setMoreOpen] = React.useState(true);
    const [isPublishing, startTransition] = React.useTransition();
    const [isSavingDraft, setIsSavingDraft] = React.useState(false);
    const [isSavingSuppliers, setIsSavingSuppliers] = React.useState(false);
    const [draftToastOpen, setDraftToastOpen] = React.useState(false);
    const [shareContacts, setShareContacts] = React.useState<{ id: string; name: string | null; email: string }[]>([]);
    const [existingAccess, setExistingAccess] = React.useState<{ id: string; name: string | null; email: string }[]>([]);

    const saveRef = React.useRef<(() => Promise<void>) | null>(null);
    const registerSave = React.useCallback((fn: (() => Promise<void>) | null) => {
        saveRef.current = fn;
    }, []);

    const handleSaveDraft = async () => {
        const fn = saveRef.current;
        if (!fn) return;
        setIsSavingDraft(true);
        try {
            await fn();
            setDraftToastOpen(true);
        } finally {
            setIsSavingDraft(false);
        }
    };

    const loadShareContacts = React.useCallback(async () => {
        try {
            const [contactsResult, accessResult] = await Promise.all([
                getAssessmentContacts(detail.id),
                fetch(`/api/assessments/${detail.id}/access`).then(r => r.json()).catch(() => ({ access: [] })),
            ]);
            if (contactsResult.success) {
                setShareContacts(contactsResult.contacts.map(c => ({ id: c.id, name: c.name, email: c.email })));
            }
            if (accessResult.success) {
                setExistingAccess(accessResult.access);
            }
        } catch (e) {
            console.error("Failed to load share contacts:", e);
        }
    }, [detail.id]);

    React.useEffect(() => {
        if (view === "share") {
            loadShareContacts();
        }
    }, [view, loadShareContacts]);

    const status = statusStyles[detail.status] ?? statusStyles.draft;

    const refresh = () => router.refresh();

    const steps: { id: Step; label: string; icon: React.ReactNode; complete: boolean }[] = [
        { id: "general", label: "Setup", icon: <CircleDot className="h-4 w-4" />, complete: Boolean(detail.title && detail.responsibleId) },
        { id: "form", label: "Form", icon: <FileText className="h-4 w-4" />, complete: detail.documentRequestGroups.length > 0 },
        { id: "participants", label: "Participants", icon: <Users className="h-4 w-4" />, complete: detail.suppliers.length > 0 },
    ];

    const currentStepIndex = steps.findIndex((s) => s.id === step);
    const goNext = () => {
        if (currentStepIndex < steps.length - 1) {
            const next = steps[currentStepIndex + 1].id;
            setStep(next);
            router.replace(`/requests/assessments/${detail.id}?tab=form&step=${next}`, { scroll: false });
        }
    };

    const handlePublish = (notify = true) => {
        startTransition(async () => {
            const result = await publishAssessment(detail.id, notify);
            if (result.success) {
                toast.success(notify ? "Published and notified suppliers" : "Published without notifying");
                refresh();
            } else {
                toast.error(result.error || "Failed to publish");
            }
        });
    };

    const handleClose = () => {
        if (!window.confirm("Close this request? It will no longer accept responses.")) return;
        startTransition(async () => {
            const result = await closeAssessment(detail.id);
            if (result.success) {
                toast.success("Request closed");
                refresh();
            } else {
                toast.error(result.error || "Failed to close");
            }
        });
    };

    // Default view routing: Published -> Overview, Draft -> Form
    React.useEffect(() => {
        if (!searchParams.has("tab")) {
            if (detail.status === "published") {
                setView("overview");
                router.replace(`/requests/assessments/${detail.id}?tab=overview`, { scroll: false });
            } else {
                setView("form");
                setStep("general");
                router.replace(`/requests/assessments/${detail.id}?tab=form&step=general`, { scroll: false });
            }
        }
    }, [detail.status, searchParams, router, detail.id]);

    return (
        <div className="flex min-h-full flex-col bg-background">
            {/* Breadcrumb + Title Bar */}
            <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 lg:px-8 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
                <div className="flex items-center gap-2 min-w-0">
                    <Link href="/requests/assessments" className="flex items-center gap-1 text-slate-500 hover:text-slate-700">
                        <ArrowLeftRight className="h-4 w-4" /> Requests
                    </Link>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                    <span className="font-mono text-xs text-slate-400">{detail.id.slice(0, 8)}</span>
                    <span className="font-semibold text-slate-900 truncate lg:max-w-[300px]">{detail.title}</span>
                    <span className={`h-2 w-2 rounded-full ${status.dot}`} aria-hidden />
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push("/requests/assessments")}>Back to list</DropdownMenuItem>
                        <DropdownMenuItem>Rename request</DropdownMenuItem>
                        <DropdownMenuItem>Duplicate request</DropdownMenuItem>
                        <DropdownMenuItem className="text-rose-600">Delete request</DropdownMenuItem>
                        {canManage && detail.status !== "closed" ? (
                            <DropdownMenuItem onClick={handleClose} className="text-rose-600">Close request</DropdownMenuItem>
                        ) : null}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

{/* Sub-nav tabs */}
            <div className="flex items-center gap-1 border-b border-slate-200 px-4 lg:px-8">
                {([
                    { id: "overview" as const, label: "Overview", icon: <Users className="h-4 w-4" /> },
                    { id: "responses" as const, label: "Responses", icon: <ListChecks className="h-4 w-4" /> },
                    { id: "form" as const, label: "Form", icon: <FileText className="h-4 w-4" /> },
                    { id: "share" as const, label: "Share", icon: <Send className="h-4 w-4" /> },
                ]).map((t) => {
                    const active = view === t.id;
                    return (
                        <button
                            key={t.id}
                            disabled={t.id === "share" && !canManage}
                            className={`relative px-4 py-2.5 text-sm font-normal transition-colors disabled:cursor-not-allowed disabled:text-slate-300 ${
                                active ? "text-slate-900 font-semibold border-b-2 border-emerald-600" : "text-slate-400 hover:text-slate-600"
                            }`}
                            onClick={() => {
                                if (t.id === "form") {
                                    setView("form");
                                    setStep("general");
                                    router.replace(`/requests/assessments/${detail.id}?tab=form&step=general`, { scroll: false });
                                } else if (t.id === "share") {
                                    setView("share");
                                    router.replace(`/requests/assessments/${detail.id}?tab=share`, { scroll: false });
                                } else {
                                    setView(t.id);
                                    router.replace(`/requests/assessments/${detail.id}?tab=${t.id}`, { scroll: false });
                                }
                            }}
                        >
                            <span className="flex items-center gap-2">
                                {t.icon}
                                {t.label}
                            </span>
                            {active ? (
                                <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-emerald-600" />
                            ) : null}
                        </button>
                    );
                })}
                <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto h-7 w-7 text-slate-400"
                    onClick={() => setSidebarOpen((v) => !v)}
                >
                    {sidebarOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
                </Button>
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col gap-6 p-4 lg:flex-row lg:p-8">
                <div className="min-w-0 flex-1">
                    {view === "overview" && (
                        <>
                            <OverviewPanelNew detail={detail} canManage={canManage} />
                        </>
                    )}
                    {view === "responses" && (
                        <>
                            <ResponsesPanelNew detail={detail} />
                        </>
                    )}
                    {view === "form" && (
                        <FormTabContent
                            detail={detail}
                            canManage={canManage}
                            userOptions={userOptions}
                            step={step}
                            setStep={setStep}
                            onMutated={refresh}
                            registerSave={registerSave}
                            isSavingSuppliers={isSavingSuppliers}
                            setIsSavingSuppliers={setIsSavingSuppliers}
                            isPublishing={isPublishing}
                            handlePublish={handlePublish}
                            goNext={goNext}
                            currentIndex={["general", "form", "participants"].indexOf(step)}
                            isLastStep={step === "participants"}
                            handleSaveDraft={handleSaveDraft}
                            isSavingDraft={isSavingDraft}
                            currentUserId={currentUserId}
                        />
                    )}
                    {view === "share" && (
                        <ShareRequestClient
                            assessmentId={detail.id}
                            requestId={detail.id}
                            organization={detail.responsible?.name ?? "PRETTL"}
                            subject={detail.title}
                            existingAccess={existingAccess}
                            orgContacts={shareContacts}
                            onClose={() => {
                                setView("form");
                                setStep("general");
                                router.replace(`/requests/assessments/${detail.id}?tab=form&step=general`, { scroll: false });
                            }}
                        />
                    )}
                </div>

                {/* Sidebar */}
                {sidebarOpen ? (
                    <aside className="w-full lg:w-80 space-y-4">
                        {view === "overview" && <OverviewSidebar detail={detail} />}
                        {view === "responses" && <ResponsesSidebar detail={detail} currentSupplier={null} />}
                        {view === "form" && (
                            <>
                            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <button
                                    type="button"
                                    onClick={() => setDetailsOpen((v) => !v)}
                                    className="flex w-full items-center justify-between px-5 py-3"
                                >
                                    <h3 className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Details</h3>
                                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${detailsOpen ? "" : "-rotate-90"}`} />
                                </button>
                                {detailsOpen ? (
                                    <dl className="space-y-3 px-5 pb-5 text-sm">
                                        <div className="flex items-center justify-between">
                                            <dt className="text-slate-500">Status</dt>
                                            <dd>
                                                <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${status.badge}`}>
                                                    <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                                                    {status.label}
                                                </span>
                                            </dd>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <dt className="text-slate-500">Responsible</dt>
                                            <dd className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    {detail.responsible?.image ? <AvatarImage src={detail.responsible.image} alt="" /> : null}
                                                    <AvatarFallback className="text-[9px]">{initials(detail.responsible?.name ?? null)}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-slate-700">{detail.responsible?.name ?? "—"}</span>
                                            </dd>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <dt className="text-slate-500">Team</dt>
                                            <dd>
                                                {detail.teamIds?.length ? (
                                                    <Badge variant="outline" className="border-slate-200 bg-slate-50">
                                                        <Users className="mr-1 h-3 w-3" />{detail.teamIds.length}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-slate-400">—</span>
                                                )}
                                            </dd>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <dt className="text-slate-500">Deadline</dt>
                                            <dd className="flex items-center gap-1.5 text-slate-700">
                                                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                {detail.dueDate ? new Date(detail.dueDate).toLocaleDateString("en-GB") : "—"}
                                            </dd>
                                        </div>
                                    </dl>
                                ) : null}
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <button
                                    type="button"
                                    onClick={() => setMoreOpen((v) => !v)}
                                    className="flex w-full items-center justify-between px-5 py-3"
                                >
                                    <h3 className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">More information</h3>
                                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${moreOpen ? "" : "-rotate-90"}`} />
                                </button>
                                {moreOpen ? (
                                    <dl className="space-y-3 px-5 pb-5 text-sm">
                                        <div className="flex items-center justify-between gap-2">
                                            <dt className="text-slate-500">Created by</dt>
                                            <dd className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarFallback className="text-[9px]">{initials(detail.createdBy?.name ?? null)}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-slate-700">{detail.createdBy?.name ?? "—"}</span>
                                            </dd>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <dt className="text-slate-500">Created at</dt>
                                            <dd className="flex items-center gap-1.5 text-slate-700">
                                                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                {formatDateTime(detail.createdAt)}
                                            </dd>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <dt className="text-slate-500">Template</dt>
                                            <dd className="flex items-center gap-1.5 text-slate-700">
                                                <FileText className="h-3.5 w-3.5 text-slate-400" />
                                                <span className="truncate max-w-[160px]">{detail.template?.name ?? "—"}</span>
                                            </dd>
                                        </div>
                                    </dl>
                                ) : null}
                            </div>
                    </>
                        )}
                    </aside>
                ) : null}
            </div>

            {/* Bottom action bar for non-form views */}
            {(view === "overview" || view === "responses") && (
                <div className="sticky bottom-0 z-30 flex items-center justify-between border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:px-8">
                    <span className="text-sm text-slate-500">
                        {view === "overview" ? "Supplier overview" : "Supplier responses"}
                    </span>
                    <div className="flex items-center gap-2">
                        {canManage && detail.status !== "closed" ? (
                            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => { setView("form"); setStep("general"); router.replace(`/requests/assessments/${detail.id}?tab=form&step=general`, { scroll: false }); }}>
                                <FileText className="h-4 w-4" /> Open form editor
                            </Button>
                        ) : null}
                        <Button variant="ghost" onClick={() => router.push("/requests/assessments")}>
                            <X className="h-4 w-4" /> Close
                        </Button>
                    </div>
                </div>
            )}

            <DraftSavedToast open={draftToastOpen} onClose={() => setDraftToastOpen(false)} />
        </div>
    );
}