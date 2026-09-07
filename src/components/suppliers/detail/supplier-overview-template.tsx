"use client";

import * as React from "react";
import {
    BarChart3,
    ChevronDown,
    Coins,
    ExternalLink,
    FileText,
    Flag,
    History,
    Pencil,
    Phone,
    Plus,
    Sparkles,
} from "lucide-react";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { SupplierHeader } from "./supplier-header";
import {
    KeyInformationSidebar,
    type KeyInfoItem,
} from "./key-information-sidebar";
import { Section } from "./section";
import { isNonEmpty } from "./styling";

export interface OverviewSupplier {
    id: string;
    supplierNumber?: string | null;
    name: string;
    countryCode?: string | null;
    countryName?: string | null;
    city?: string | null;
    website?: string | null;
    supplierStatus?: string | null;
    supplierType?: string | null;
    areaOfNeed?: string[];
    commodityGroup?: string[];
    responsibleBuyer?: string[];
    strategicClassification?: string | null;
    abcClassification?: string | null;
    orderVolume2025?: number | null;
    notes?: string;
    goals?: string;
    aiSummary?: string;
    transactionVolume?: { year: number; volume: number }[];
    categoryVolume?: { category: string; share: number }[];
    activities?: { id: string; type: string; text: string; at: string }[];
    opportunities?: {
        id: string;
        kind: "savings" | "price_increase";
        amount: number;
        note: string;
        at: string;
    }[];
}

function flagEmoji(code: string | null | undefined): string {
    const normalized = (code || "").toUpperCase();
    if (!/^[A-Z]{2}$/.test(normalized)) return "🌐";
    return String.fromCodePoint(...normalized.split("").map((c) => 127397 + c.charCodeAt(0)));
}

export function SupplierOverviewTemplate({
    supplier,
}: {
    supplier: OverviewSupplier;
}) {
    const supplierNumber = supplier.supplierNumber ?? supplier.id;
    const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

    return (
        <div className="min-h-screen bg-slate-50">
            <SupplierHeader
                supplier={supplier}
                section="overview"
                supplierNumber={supplierNumber}
                sidebarCollapsed={sidebarCollapsed}
                onToggleSidebar={() => setSidebarCollapsed((c) => !c)}
            />
            <div className="mx-auto max-w-7xl px-6 py-4">
                <div
                    className={cn(
                        "mt-4 grid gap-4",
                        sidebarCollapsed ? "grid-cols-1" : "lg:grid-cols-[1fr_320px]",
                    )}
                >
                    <OverviewBody supplier={supplier} />
                    {sidebarCollapsed ? null : (
                        <KeyInformationSidebar
                            title="Key information"
                            items={buildKeyInfo(supplier)}
                            bottomButton={{
                                label: "View all properties",
                                href: `/suppliers/${supplierNumber}/properties`,
                            }}
                            onConfigureSidebar={() => {
                                window.location.href = `/suppliers/${supplierNumber}/properties`;
                            }}
                            onConfigureProperties={() => {
                                window.location.href = `/suppliers/${supplierNumber}/properties`;
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

function buildKeyInfo(supplier: OverviewSupplier): KeyInfoItem[] {
    return [
        {
            label: "Supplier Status",
            value: supplier.supplierStatus ?? "",
            kind: "pill",
        },
        {
            label: "Supplier Type",
            value: supplier.supplierType ?? "",
            kind: "pill",
        },
        {
            label: "Area of Need",
            value: supplier.areaOfNeed ?? [],
            kind: "multi-pill",
            removable: true,
        },
        {
            label: "Commodity Group",
            value: supplier.commodityGroup ?? [],
            kind: "multi-pill",
            removable: true,
        },
        {
            label: "Responsible Buyer",
            value: null,
            kind: "select-user",
            options: [],
        },
        {
            label: "Order Volume 2025",
            value: supplier.orderVolume2025 ?? null,
            kind: "number",
        },
        {
            label: "ABC",
            value: supplier.abcClassification ?? "",
            kind: "select",
            options: ["A", "B", "C"],
        },
    ];
}

function OverviewBody({ supplier }: { supplier: OverviewSupplier }) {
    return (
        <div className="space-y-4">
            <LogoAndSubheader supplier={supplier} />
            <HighlightsSection supplier={supplier} />
            <ActivitiesAndOpportunities supplier={supplier} />
            <KeyFiguresSection supplier={supplier} />
            <ProfileSection supplier={supplier} />
        </div>
    );
}

function LogoAndSubheader({ supplier }: { supplier: OverviewSupplier }) {
    return (
        <Card className="shadow-sm">
            <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                        <Flag className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-slate-900">{supplier.name}</div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span className="font-mono">#{supplier.supplierNumber ?? supplier.id}</span>
                            <span className="text-slate-300">·</span>
                            <span className="inline-flex items-center gap-1">
                                <span aria-hidden>{flagEmoji(supplier.countryCode)}</span>
                                {supplier.city ? `${supplier.city}, ` : ""}
                                {supplier.countryName || supplier.countryCode || "—"}
                            </span>
                            {supplier.website ? (
                                <>
                                    <span className="text-slate-300">·</span>
                                    <a
                                        href={
                                            supplier.website.startsWith("http")
                                                ? supplier.website
                                                : `https://${supplier.website}`
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        {supplier.website.replace(/^https?:\/\//, "")}
                                    </a>
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function HighlightsSection({ supplier }: { supplier: OverviewSupplier }) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Sparkles className="h-4 w-4 text-emerald-600" /> Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-700">
                        {isNonEmpty(supplier.aiSummary) ? (
                            supplier.aiSummary
                        ) : (
                            <span className="text-slate-400">
                                No information found. Please check if the supplier&apos;s information is
                                up-to-date.
                            </span>
                        )}
                    </p>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        Price development
                    </CardTitle>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                </CardHeader>
                <CardContent>
                    {isNonEmpty(supplier.transactionVolume) ? (
                        <div className="h-40">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={supplier.transactionVolume}
                                    margin={{ top: 4, right: 8, left: 8, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="hl" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} width={44} />
                                    <Tooltip />
                                    <Area
                                        type="monotone"
                                        dataKey="volume"
                                        stroke="#10b981"
                                        fill="url(#hl)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400">
                            No price development data for this supplier.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function ActivitiesAndOpportunities(_props: { supplier: OverviewSupplier }) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Phone className="h-4 w-4 text-blue-600" /> Activities
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-slate-200 py-6 text-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                            <Phone className="h-5 w-5 text-slate-400" />
                        </div>
                        <p className="text-sm text-slate-500">
                            Track phone calls, meetings, and emails with the Supplier.
                        </p>
                        <Button size="sm" variant="outline" className="mt-1 gap-1">
                            <Plus className="h-3.5 w-3.5" /> New activity
                            <ChevronDown className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Coins className="h-4 w-4 text-emerald-600" /> Active opportunities
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-slate-200 py-6 text-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                            <Coins className="h-5 w-5 text-slate-400" />
                        </div>
                        <p className="text-sm text-slate-500">
                            Log current savings opportunities or price increases for this Supplier.
                        </p>
                        <Button size="sm" variant="outline" className="mt-1 gap-1">
                            <Plus className="h-3.5 w-3.5" /> Add opportunity
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function KeyFiguresSection({ supplier }: { supplier: OverviewSupplier }) {
    const tx = supplier.transactionVolume ?? [];
    const cat = supplier.categoryVolume ?? [];

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        Transaction volume
                    </CardTitle>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                </CardHeader>
                <CardContent>
                    {tx.length > 0 ? (
                        <div className="h-52">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={tx}
                                    margin={{ top: 4, right: 8, left: 8, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} width={52} />
                                    <Tooltip />
                                    <Bar dataKey="volume" fill="#0f766e" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-1 py-8 text-center text-sm text-slate-400">
                            <BarChart3 className="h-5 w-5" />
                            <p>No order data available for this supplier.</p>
                            <p>No orders have been made at this supplier in the last 5 years.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        Category volume
                    </CardTitle>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                </CardHeader>
                <CardContent>
                    {cat.length > 0 ? (
                        <div className="h-52">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    layout="vertical"
                                    data={cat}
                                    margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                                    <XAxis type="number" tick={{ fontSize: 11 }} />
                                    <YAxis
                                        type="category"
                                        dataKey="category"
                                        tick={{ fontSize: 11 }}
                                        width={70}
                                    />
                                    <Tooltip />
                                    <Bar dataKey="share" fill="#6366f1" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-1 py-8 text-center text-sm text-slate-400">
                            <BarChart3 className="h-5 w-5" />
                            <p>No data available for categories.</p>
                            <p>No orders have been made at this supplier in the last 12 months.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function ProfileSection({ supplier }: { supplier: OverviewSupplier }) {
    return (
        <Section title="Profile" icon={FileText}>
            <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
                <NotesBlock notes={supplier.notes ?? ""} />
                <GoalsBlock goals={supplier.goals ?? ""} />
            </div>
        </Section>
    );
}

function NotesBlock({ notes }: { notes: string }) {
    const [text, setText] = React.useState(notes);
    React.useEffect(() => setText(notes), [notes]);
    return (
        <div className="flex flex-col gap-2 border-b border-slate-100 p-4 md:border-b-0 md:border-r">
            <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Notes
                </span>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Notes history"
                    >
                        <History className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Edit notes"
                    >
                        <Pencil className="h-4 w-4" />
                    </button>
                </div>
            </div>
            <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={5}
                placeholder="Enter text"
                className="resize-none"
            />
        </div>
    );
}

function GoalsBlock({ goals }: { goals: string }) {
    const [text, setText] = React.useState(goals);
    React.useEffect(() => setText(goals), [goals]);
    return (
        <div className="flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Goals
                </span>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Goals history"
                    >
                        <History className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Edit goals"
                    >
                        <Pencil className="h-4 w-4" />
                    </button>
                </div>
            </div>
            <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={5}
                placeholder="Enter text"
                className="resize-none"
            />
        </div>
    );
}
