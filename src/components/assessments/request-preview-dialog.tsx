"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import {
    AlertTriangle,
    X,
    PanelRightClose,
    PanelRightOpen,
    Building2,
    Scale,
    Globe,
    Landmark,
    Users,
    BarChart3,
    FileText,
    MessageSquare,
    Euro,
    UploadCloud,
    MessageCircle,
} from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { AssessmentDetail } from "@/lib/assessment-types";
import { FloatingChatWidget, LangChevron } from "./preview/floating-chat-widget";

/* -------------------------------------------------------------------------- */
/* Language selector                                                           */
/* -------------------------------------------------------------------------- */

const LANGUAGES = [
    { code: "EN", label: "English", flag: "🇬🇧" },
    { code: "DE", label: "Deutsch", flag: "🇩🇪" },
    { code: "FR", label: "Français", flag: "🇫🇷" },
    { code: "IT", label: "Italiano", flag: "🇮🇹" },
    { code: "PL", label: "Polski", flag: "🇵🇱" },
    { code: "SK", label: "Slovenščina", flag: "🇸🇰" },
    { code: "CN", label: "中文", flag: "🇨🇳" },
    { code: "ES", label: "Español", flag: "🇪🇸" },
];

function LanguageSelector() {
    const [open, setOpen] = React.useState(false);
    const [lang, setLang] = React.useState(LANGUAGES[0]);
    return (
        <div className="relative">
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
                <span>{lang.flag}</span>
                <span>{lang.code}</span>
                <LangChevron />
            </button>
            {open ? (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute left-0 z-50 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                        {LANGUAGES.map((l) => (
                            <button
                                key={l.code}
                                onClick={() => { setLang(l); setOpen(false); }}
                                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50 ${l.code === lang.code ? "font-semibold text-slate-900" : "text-slate-600"}`}
                            >
                                <span className="text-base">{l.flag}</span>
                                {l.label}
                            </button>
                        ))}
                    </div>
                </>
            ) : null}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Read-only field + section helpers                                           */
/* -------------------------------------------------------------------------- */

function Field({
    label,
    value,
    required,
}: {
    label: string;
    value?: string | null;
    required?: boolean;
}) {
    return (
        <div className="space-y-1">
            <label className="flex items-center gap-1 text-xs font-medium text-slate-500">
                {label}
                {required ? <span className="text-rose-500">*</span> : null}
            </label>
            <div className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
                {value?.trim() ? value : <span className="text-slate-400">—</span>}
            </div>
        </div>
    );
}

function CommentDot() {
    return (
        <button
            className="rounded p-1 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-500"
            aria-label="Field comments"
        >
            <MessageCircle className="h-4 w-4" />
            <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-orange-400" />
        </button>
    );
}

function Card({
    icon,
    title,
    required,
    children,
}: {
    icon: React.ReactNode;
    title: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    {icon}
                </span>
                <h4 className="flex items-center gap-1 text-sm font-semibold text-slate-800">
                    {title}
                    {required ? <span className="text-rose-500">*</span> : null}
                </h4>
            </div>
            <div className="space-y-3">{children}</div>
        </div>
    );
}

function MessageBox({ children }: { children: React.ReactNode }) {
    return (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-slate-600">
            {children}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Skeleton                                                                    */
/* -------------------------------------------------------------------------- */

function Skeleton({ className = "" }: { className?: string }) {
    return <div className={`animate-pulse rounded bg-slate-200 ${className}`} />;
}

/* -------------------------------------------------------------------------- */
/* Main component                                                              */
/* -------------------------------------------------------------------------- */

type NavId = "message" | "general" | "technical" | "quality";

export function RequestPreviewDialog({
    open,
    onOpenChange,
    detail,
}: {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    detail: AssessmentDetail;
}) {
    const [panelOpen, setPanelOpen] = React.useState(true);
    const [active, setActive] = React.useState<NavId>("message");
    const [bannerOpen, setBannerOpen] = React.useState(true);
    const [loading, setLoading] = React.useState(true);

    const { data: session } = useSession();
    const currentUser = session?.user;
    const contactName = currentUser?.name?.trim() || "Current User";
    const contactEmail = currentUser?.email || "";
    const contactInitials = contactName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() ?? "")
        .join("") || "CU";

    React.useEffect(() => {
        if (!open) return;
        setActive("message");
        setBannerOpen(true);
        setPanelOpen(true);
        setLoading(true);
        const t = window.setTimeout(() => setLoading(false), 750);
        return () => window.clearTimeout(t);
    }, [open]);

    const nav: { id: NavId; label: string; icon: React.ReactNode }[] = [
        { id: "message", label: "Message from the buyer", icon: <MessageSquare className="h-4 w-4" /> },
        { id: "general", label: "1. General Information", icon: <Building2 className="h-4 w-4" /> },
        { id: "technical", label: "2. Technical Information", icon: <Scale className="h-4 w-4" /> },
        { id: "quality", label: "3. Quality Systems", icon: <FileText className="h-4 w-4" /> },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[96vh] max-w-[1560px] overflow-hidden p-0">
                <DialogTitle className="sr-only">Request preview</DialogTitle>
                {/* ---------- Header (always rendered, fully loaded) ---------- */}
                <header className="relative flex items-center gap-4 border-b border-slate-200 bg-white px-5 py-3">
                    <span className="text-xl font-extrabold tracking-tight text-emerald-600">PMA</span>
                    <LanguageSelector />
                    <div className="ml-auto flex items-center gap-2">
                        <button
                            onClick={() => setPanelOpen((v) => !v)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                            aria-label="Toggle details panel"
                        >
                            {panelOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
                        </button>
                    </div>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Close preview"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </header>

                {loading ? (
                    <LoadingState />
                ) : (
                    <div className="flex min-h-0 flex-1">
                        {/* ---------- Left sidebar nav ---------- */}
                        <aside className="w-[250px] shrink-0 overflow-y-auto border-r border-slate-200 bg-slate-50 p-3">
                            <nav className="space-y-1">
                                {nav.map((n) => {
                                    const isActive = n.id === active;
                                    return (
                                        <button
                                            key={n.id}
                                            onClick={() => setActive(n.id)}
                                            className={`relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                                                isActive
                                                    ? "bg-white font-semibold text-slate-900 shadow-sm"
                                                    : "text-slate-600 hover:bg-slate-100"
                                            }`}
                                        >
                                            {isActive ? (
                                                <span className="absolute left-0 top-1/2 h-6 -translate-y-1/2 rounded-r bg-emerald-600 w-1" />
                                            ) : null}
                                            <span className={isActive ? "text-emerald-600" : "text-slate-400"}>{n.icon}</span>
                                            {n.label}
                                        </button>
                                    );
                                })}
                            </nav>
                        </aside>

                        {/* ---------- Main content ---------- */}
                        <div className="min-w-0 flex-1 overflow-y-auto bg-slate-100 p-5">
                            {bannerOpen ? (
                                <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                    <p className="flex-1">
                                        You are previewing this Request as a Supplier. Changes cannot be made in preview mode.
                                    </p>
                                    <button
                                        onClick={() => setBannerOpen(false)}
                                        className="rounded p-0.5 text-amber-500 hover:bg-amber-100"
                                        aria-label="Dismiss"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : null}

                            {active === "message" ? (
                                <MessageSection detail={detail} />
                            ) : null}
                            {active === "general" ? <GeneralInformation /> : null}
                            {active === "technical" ? <TechnicalInformation /> : null}
                            {active === "quality" ? <QualitySystems detail={detail} /> : null}
                        </div>

                        {/* ---------- Right details panel ---------- */}
                        {panelOpen ? (
                            <aside className="hidden w-[360px] shrink-0 overflow-y-auto border-l border-slate-200 bg-white p-5 lg:block">
                                <Collapsible title="Request details" defaultOpen>
                                    <dl className="space-y-3 text-sm">
                                        <div className="flex items-center justify-between gap-2">
                                            <dt className="text-slate-500">Subject</dt>
                                            <dd className="flex min-w-0 items-center gap-1 text-right font-medium text-slate-700">
                                                <FileText className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                                <span className="truncate">SSA-71397 Supplier Self A...</span>
                                            </dd>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <dt className="text-slate-500">Sent on</dt>
                                            <dd className="text-right font-medium text-slate-700">12.08.2026 10:53</dd>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <dt className="text-slate-500">Due on</dt>
                                            <dd className="text-right font-medium text-slate-700">—</dd>
                                        </div>
                                    </dl>
                                </Collapsible>

                                <div className="my-4 border-t border-slate-100" />

                                <Collapsible title="Contact information" defaultOpen>
                                    <dl className="space-y-3 text-sm">
                                        <div className="flex items-center justify-between gap-2">
                                            <dt className="flex items-center gap-1 text-slate-500"><Building2 className="h-3.5 w-3.5" /> Organization</dt>
                                            <dd className="truncate text-right font-medium text-slate-700">PRETTL Mechatronics & Actua...</dd>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <dt className="text-slate-500">Main contact</dt>
                                            <dd className="flex items-center gap-2 text-right font-medium text-slate-700">
                                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">{contactInitials}</span>
                                                {contactName}
                                            </dd>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <dt className="text-slate-500">Email</dt>
                                            <dd>
                                                {contactEmail ? (
                                                    <a href={`mailto:${contactEmail}`} className="text-right font-medium text-blue-600 hover:underline">{contactEmail}</a>
                                                ) : (
                                                    <span className="text-right font-medium text-slate-400">—</span>
                                                )}
                                            </dd>
                                        </div>
                                    </dl>
                                </Collapsible>
                            </aside>
                        ) : null}
                    </div>
                )}

                <FloatingChatWidget />
            </DialogContent>
        </Dialog>
    );
}

/* -------------------------------------------------------------------------- */
/* Loading skeleton                                                            */
/* -------------------------------------------------------------------------- */

function LoadingState() {
    return (
        <div className="flex min-h-0 flex-1">
            <aside className="w-[250px] shrink-0 space-y-3 border-r border-slate-200 bg-slate-50 p-4">
                <div className="flex gap-2">
                    <Skeleton className="h-2.5 w-[120px]" />
                    <Skeleton className="h-2.5 w-[60px]" />
                </div>
                <Skeleton className="h-2.5 w-[120px]" />
                <Skeleton className="h-2.5 w-[280px]" />
            </aside>

            <div className="min-w-0 flex-1 bg-slate-100 p-6">
                {/* partial early render: Company address text block */}
                <p className="text-sm font-semibold text-slate-700">Company address</p>
                <p className="mt-1 text-sm text-slate-500">Acme Components Pte Ltd</p>
                <p className="text-sm text-slate-500">12 Orchard Road, 238897 Singapore, Singapore</p>

                <div className="mt-6 space-y-2">
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-5/6" />
                </div>
                <div className="mx-auto mt-8 h-1.5 w-[650px] max-w-full rounded-full bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200" />
            </div>

            <aside className="hidden w-[360px] shrink-0 border-l border-slate-200 bg-white p-6 lg:block">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="mt-3 space-y-2">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-40" />
                </div>
            </aside>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Content sections                                                            */
/* -------------------------------------------------------------------------- */

function Collapsible({
    title,
    defaultOpen,
    children,
}: {
    title: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
}) {
    const [open, setOpen] = React.useState(defaultOpen ?? true);
    return (
        <div>
            <button
                onClick={() => setOpen((v) => !v)}
                className="mb-2 flex w-full items-center justify-between text-xs font-black uppercase tracking-[0.16em] text-slate-400"
            >
                {title}
                <span className="text-slate-300">{open ? "▾" : "▸"}</span>
            </button>
            {open ? children : null}
        </div>
    );
}

function MessageSection({ detail }: { detail: AssessmentDetail }) {
    return (
        <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900">Message from the buyer</h2>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <MessageSquare className="h-4 w-4 text-emerald-600" /> Message from buyer
                </div>
                <div className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {detail.messageBody ||
                        `Dear Supplier,

We are in the process of evaluating and onboarding our supply base for the categories covered by this request. To gain a better understanding of your company, your production capabilities and your quality systems, we kindly ask you to complete the following self-assessment.

The questionnaire should take approximately 20 minutes to complete. All information is treated confidentially and used exclusively for supplier evaluation purposes.

Kind regards,
${detail.responsible?.name ?? "Axiom Procurement"}`}
                </div>
            </div>
        </section>
    );
}

function GeneralInformation() {
    return (
        <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900">1. General Information</h2>

            <Card icon={<Building2 className="h-4 w-4" />} title="Company address" required>
                <Field label="Supplier number" />
                <Field label="Name" />
                <Field label="Address" />
            </Card>

            <Card icon={<Scale className="h-4 w-4" />} title="Legal details" required>
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Legal form" />
                    <Field label="Parent company" />
                    <Field label="Tax ID" />
                    <Field label="VAT ID" required />
                    <Field label="Foundation year" />
                </div>
            </Card>

            <Card icon={<Globe className="h-4 w-4" />} title="Public appearance" required>
                <Field label="Website" />
            </Card>

            <Card icon={<Building2 className="h-4 w-4" />} title="Other basic information">
                <Field label="Where is your company's headquarters located?" required />
                <Field label="What is your EORI number?" required />
                <Field label="What is your D-U-N-S number?" required />
                <Field label="If applicable, please state your local trade register entry." required />
            </Card>

            <Card icon={<Landmark className="h-4 w-4" />} title="Bank connection" required>
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Bank Name" />
                    <Field label="IBAN" />
                    <Field label="BIC/SWIFT" />
                    <Field label="Currency" />
                </div>
            </Card>

            <Card icon={<Building2 className="h-4 w-4" />} title="Product liability / manufacturer's liability">
                <Field label="What is the name of your insurer?" required />
                <Field label="What is your insurance number?" required />
                <Field label="What is the insured amount (in €)?" required />
            </Card>

            <Card icon={<BarChart3 className="h-4 w-4" />} title="Production and sales Sites" required>
                <MessageBox>Please list all production and sales sites relevant to the supply of this request.</MessageBox>
                <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
                    <UploadCloud className="mx-auto mb-2 h-7 w-7 text-slate-300" />
                    <p className="text-sm text-slate-400">No production or sales sites have been provided yet.</p>
                </div>
            </Card>

            <Card icon={<Building2 className="h-4 w-4" />} title="Production site">
                <MessageBox>Provide the details of the primary production site from which you expect to supply us.</MessageBox>
                <Field label="What is the company name of the production site?" required />
                <Field label="In which country is the production site located?" required />
                <Field label="Postal code & city of the production site:" required />
                <Field label="What is the production area (in m²)?" />
                <Field label="Name of the contact person at the production site:" required />
                <Field label="Contact e-mail at the production site:" required />
                <Field label="Contact phone number at the production site:" required />
            </Card>

            <Card icon={<Users className="h-4 w-4" />} title="Contacts" required>
                <MessageBox>Please provide information about the main production facility from which you expect to supply us.</MessageBox>
                <p className="text-sm font-medium text-slate-700">* Please provide contacts for the requested departments:</p>
                <div className="flex flex-wrap gap-2">
                    {["Sales", "Quality Management", "Logistics/Supply Chain", "Executive Management", "Complaints", "Engineering", "Purchasing/Procurement"].map((d) => (
                        <span key={d} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">{d}</span>
                    ))}
                </div>
                <div className="overflow-hidden rounded-xl border border-slate-200">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs font-black uppercase tracking-wider text-slate-500">
                            <tr>
                                <th className="px-3 py-2 text-left">Contact</th>
                                <th className="px-3 py-2 text-left">Email</th>
                                <th className="px-3 py-2 text-left">🌐 Language</th>
                                <th className="px-3 py-2 text-left">Department</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { c: "Jane Doe", e: "jane.doe@acme.com", l: "English", d: "Sales" },
                                { c: "Max Müller", e: "max.mueller@acme.com", l: "Deutsch", d: "Quality Management" },
                            ].map((r) => (
                                <tr key={r.e} className="border-t border-slate-100">
                                    <td className="px-3 py-2 text-slate-700">{r.c}</td>
                                    <td className="px-3 py-2 text-slate-600">{r.e}</td>
                                    <td className="px-3 py-2 text-slate-600">{r.l}</td>
                                    <td className="px-3 py-2"><Badge variant="outline" className="border-slate-200 bg-slate-50">{r.d}</Badge></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Card icon={<Users className="h-4 w-4" />} title="Employees">
                <Field label="Total number of employees – previous year:" required />
                <Field label="Total number of employees – current year:" required />
                <Field label="Direct employees:" />
                <Field label="Indirect employees:" />
                <Field label="Employees in management:" />
                <Field label="Employees in engineering:" />
            </Card>

            <Card icon={<Users className="h-4 w-4" />} title="Customers">
                <MessageBox>Example: &quot;Max Mustermann GmbH, 10%&quot;. For audits, list the most recent customer audit with date and scope.</MessageBox>
                <Field label="How many customers does your company have in total?" required />
                <Field label="How many customers account for 80% of your sales?" required />
                <Field label="Please provide the name of your largest customers (A-customers) and their respective share of turnover (%)" required />
                <Field label="Please provide the data of your most recent customer audits." required />
            </Card>

            <Card icon={<Euro className="h-4 w-4" />} title="Annual revenues in EUR" required>
                <div className="flex gap-2">
                    {["2024", "2025", "2026"].map((y) => (
                        <span key={y} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">Required year: {y}</span>
                    ))}
                </div>
                <div className="space-y-2">
                    {["2024", "2025", "2026"].map((y) => (
                        <div key={y} className="flex items-center gap-3">
                            <span className="w-12 text-xs text-slate-500">{y}</span>
                            <Skeleton className="h-4 flex-1" />
                        </div>
                    ))}
                </div>
            </Card>

            <Card icon={<Building2 className="h-4 w-4" />} title="Share Revenue in %">
                {["Automotive", "Industry", "Medicine", "Aerospace", "Other sectors"].map((s) => (
                    <div key={s} className="flex items-center gap-3">
                        <span className="w-32 text-xs font-medium text-slate-600">{s}</span>
                        <div className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-400">—</div>
                        <CommentDot />
                    </div>
                ))}
            </Card>

            <Card icon={<Building2 className="h-4 w-4" />} title="List of Main Suppliers">
                <MessageBox>List your main suppliers and the % of purchasing volume per supplier.</MessageBox>
                <Field label="Main suppliers" />
            </Card>
        </section>
    );
}

function TechnicalInformation() {
    return (
        <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900">2. Technical Information</h2>
            <Card icon={<Building2 className="h-4 w-4" />} title="List of Main Equipment / Machinery">
                <MessageBox>Example: &quot;CNC Mill — DMG Mori NLX 2500 — 5 units&quot;.</MessageBox>
                <Field label="Main equipment / machinery" />
            </Card>
            <Card icon={<Building2 className="h-4 w-4" />} title="Core Competences">
                <MessageBox>Select the commodity groups you supply and describe your core products and processes.</MessageBox>
                <Field label="Please select the commodity group(s):" />
                <Field label="Please describe your core products and processes for each commodity group." />
            </Card>
        </section>
    );
}

function QualitySystems({ detail }: { detail: AssessmentDetail }) {
    const docs = detail.documentRequestGroups
        .flatMap((g) => g.documents)
        .sort((a, b) => a.order - b.order);
    return (
        <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900">3. Quality Systems</h2>
            <Card icon={<FileText className="h-4 w-4" />} title="Document requests">
                {docs.length === 0 ? (
                    <MessageBox>No document requests have been added to this request yet.</MessageBox>
                ) : (
                    docs.map((d) => (
                        <div key={d.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                            <span className="flex items-center gap-2 text-sm text-slate-700">
                                <FileText className="h-4 w-4 text-violet-600" /> {d.name}
                            </span>
                            <Badge variant="outline" className={d.isAnswerRequired ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-600"}>
                                {d.isAnswerRequired ? "Required" : "Optional"}
                            </Badge>
                        </div>
                    ))
                )}
            </Card>
        </section>
    );
}
