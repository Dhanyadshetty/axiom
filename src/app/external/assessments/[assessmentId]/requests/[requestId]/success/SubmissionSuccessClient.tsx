"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
    CheckCircle2,
    Download,
    FileText,
    Bell,
    Edit2,
    HelpCircle,
    Mail,
    Copy,
    Check,
    ExternalLink,
    Building2,
    BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const LANGUAGES: { code: "en" | "de"; label: string }[] = [
    { code: "en", label: "English" },
    { code: "de", label: "Deutsch" },
];

function formatDateTime(iso: string | null): string {
    if (!iso) return "–";
    const date = new Date(iso);
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + " at " + date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function formatDateTimeDe(iso: string | null): string {
    if (!iso) return "–";
    const date = new Date(iso);
    return date.toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" }) + " um " + date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

export function SubmissionSuccessClient({ initialData, submittedAt }: { initialData: any; submittedAt?: string }) {
    const router = useRouter();
    const [language, setLanguage] = React.useState<"en" | "de">("en");
    const [copied, setCopied] = React.useState(false);

    const lang = language === "de" ? "de" : "en";
    const tr = (en: string, de: string) => (lang === "de" ? de : en);

    const requestSubject = initialData?.requestDetails?.subject || "Supplier Self Assessment";

    const handleCopyEmail = () => {
        navigator.clipboard.writeText(initialData?.contactInformation?.email || "");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success(tr("Email copied to clipboard", "E-Mail in Zwischenablage kopiert"));
    };

    const handleEditResponse = () => {
        router.push(`/external/assessments/${initialData.assessmentRequestId}/requests/${initialData.id}/form`);
    };

    const handleViewResponse = () => {
        router.push(`/external/assessments/${initialData.assessmentRequestId}/requests/${initialData.id}/form`);
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <style jsx global>{`
                @media print {
                    html, body {
                        height: auto !important;
                        max-height: none !important;
                        overflow: visible !important;
                        background: #fff !important;
                    }
                    #__next, body > *, .min-h-screen, .flex.flex-col, .flex-1, .overflow-hidden, .overflow-y-auto, .overflow-x-auto, div, main, section, article, aside, nav, header, footer {
                        height: auto !important;
                        max-height: none !important;
                        min-height: 0 !important;
                        overflow: visible !important;
                    }
                    header, nav, aside, footer, .no-print { display: none !important; }
                    main { display: block !important; max-width: none !important; width: 100% !important; padding: 0 !important; }
                    main > div, .max-w-3xl { max-width: none !important; width: 100% !important; }
                    .sticky { position: static !important; }
                    .border-b, .border-r, .border-l { border: none !important; }
                    .shadow-sm, .shadow-lg { box-shadow: none !important; }
                    .bg-white { background: #fff !important; }
                    .rounded-2xl, .rounded-xl { border-radius: 0 !important; }
                    .p-5, .p-6, .p-8, .px-4, .px-8, .py-8 { padding: 0 !important; }
                    .space-y-6 > * + * { margin-top: 1rem !important; }
                    .space-y-4 > * + * { margin-top: 0.75rem !important; }
                    .mb-6, .mb-8 { margin-bottom: 1rem !important; }
                    button, select, .absolute.inset-0 { display: none !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    @page { margin: 14mm; }
                }
            `}</style>

            {/* Top bar - only Export Response + View response */}
            <header className="h-14 border-b border-slate-200 bg-white sticky top-0 z-30 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">A</span>
                    </div>
                    <span className="font-semibold text-slate-900">Axiom</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <span className="h-4 w-4">🌐</span>
                            {LANGUAGES.find((l) => l.code === language)?.label ?? "English"}
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
                    <Button variant="outline" size="sm" className="gap-2 no-print" onClick={() => window.print()}>
                        <Download className="h-4 w-4" />
                        {tr("Export Response", "Antwort exportieren")}
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 no-print" onClick={handleViewResponse}>
                        <FileText className="h-4 w-4" />
                        {tr("View response", "Antwort ansehen")}
                    </Button>
                </div>
            </header>

            {/* Body */}
            <main className="flex-1 px-4 lg:px-8 py-8">
                <div className="max-w-3xl mx-auto space-y-6">
                    {/* Success heading */}
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100">
                            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            {tr("Your response has been submitted", "Ihre Antwort wurde eingereicht")}
                        </h1>
                        <p className="text-slate-600">
                            {tr(
                                `Thank you for completing the Supplier Self Assessment for "${requestSubject}".`,
                                `Vielen Dank für das Ausfüllen der Lieferanten-Selbstauskunft für "${requestSubject}".`
                            )}
                        </p>
                        {submittedAt && (
                            <p className="text-sm text-slate-500">
                                {tr(
                                    `Submitted on ${formatDateTime(submittedAt)}`,
                                    `Eingereicht am ${formatDateTimeDe(submittedAt)}`
                                )}
                            </p>
                        )}
                    </div>

                    {/* What is next? panel */}
                    <Card className="border-slate-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Bell className="h-5 w-5 text-emerald-600" />
                                {tr("What happens next?", "Was passiert als Nächstes?")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-0">
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <Check className="h-4 w-4 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900">{tr("Buyer notified", "Käufer benachrichtigt")}</p>
                                    <p className="text-sm text-slate-600">
                                        {tr("The buyer has been automatically notified about your submission.", "Der Käufer wurde automatisch über Ihre Einreichung informiert.")}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center">
                                    <Edit2 className="h-4 w-4 text-sky-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-slate-900">{tr("Edit response until closed", "Antwort bearbeiten bis zum Abschluss")}</p>
                                    <p className="text-sm text-slate-600">
                                        {tr("You can continue to edit your response until the buyer closes the assessment.", "Sie können Ihre Antwort weiterhin bearbeiten, bis der Käufer die Bewertung abschließt.")}
                                    </p>
                                </div>
                                <Button variant="outline" size="sm" onClick={handleEditResponse} className="gap-2 shrink-0">
                                    <Edit2 className="h-4 w-4" />
                                    {tr("Edit response", "Antwort bearbeiten")}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Questions? panel */}
                    <Card className="border-slate-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <HelpCircle className="h-5 w-5 text-sky-600" />
                                {tr("Questions?", "Fragen?")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-0">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center">
                                    <Mail className="h-4 w-4 text-sky-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-700">{tr("Contact person", "Ansprechpartner")}</p>
                                    <p className="text-sm text-slate-900">{initialData?.contactInformation?.mainContact?.name || "–"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center">
                                    <Mail className="h-4 w-4 text-sky-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-700">{tr("Email", "E-Mail")}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-slate-900 truncate">{initialData?.contactInformation?.email || "–"}</span>
                                        <Button variant="ghost" size="icon" onClick={handleCopyEmail} className="h-8 w-8" aria-label={tr("Copy email", "E-Mail kopieren")}>
                                            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-slate-500" />}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* How is my data handled? link */}
                    <Card className="border-slate-200">
                        <CardContent className="pt-6 pb-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                                        <BookOpen className="h-4 w-4 text-violet-600" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700">{tr("How is my data handled?", "Wie werden meine Daten verarbeitet?")}</span>
                                </div>
                                <Button variant="ghost" size="sm" className="gap-1.5 text-violet-700 hover:bg-violet-50">
                                    <span>{tr("Learn more", "Mehr erfahren")}</span>
                                    <ExternalLink className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* About Tacto footer panel */}
                    <Card className="border-slate-200">
                        <CardContent className="pt-6 pb-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                                        <Building2 className="h-4 w-4 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">{tr("About Tacto", "Über Tacto")}</p>
                                        <p className="text-sm text-slate-500">{tr("Supplier collaboration platform for sustainable procurement.", "Plattform für Lieferantenkollaboration für nachhaltige Beschaffung.")}</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className="gap-2">
                                    {tr("Learn more", "Mehr erfahren")}
                                    <ExternalLink className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
