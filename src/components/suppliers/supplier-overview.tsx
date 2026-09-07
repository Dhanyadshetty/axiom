"use client";

import * as React from "react";
import Link from "next/link";
import {
    Activity,
    BarChart3,
    Building2,
    Globe2,
    Leaf,
    Mail,
    Phone,
    Users,
    TrendingUp,
    TrendingDown,
    Target,
    Sparkles,
    Settings2,
    ArrowLeft,
    Plus,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Area,
    AreaChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { updateSupplierProfile } from "@/app/actions/suppliers";

type Profile = Record<string, any>;

function routeId(supplier: { id: string; supplierNumber: string | null }) {
    return supplier.supplierNumber || supplier.id;
}

function scoreColor(value: number | null | undefined) {
    if (value == null) return "bg-slate-100 text-slate-600";
    if (value >= 70) return "bg-emerald-100 text-emerald-700";
    if (value >= 40) return "bg-amber-100 text-amber-700";
    return "bg-rose-100 text-rose-700";
}

function flagEmoji(code: string | null | undefined) {
    const normalized = (code || "").toUpperCase();
    if (!/^[A-Z]{2}$/.test(normalized)) return "🌐";
    return String.fromCodePoint(...normalized.split("").map((c) => 127397 + c.charCodeAt(0)));
}

export function SupplierOverview({ supplier, orders }: { supplier: any; orders: any[] }) {
    const profile: Profile = supplier.profile || {};
    const rid = routeId(supplier);

    const [activities, setActivities] = React.useState<any[]>(profile.activities || []);
    const [opportunities, setOpportunities] = React.useState<any[]>(profile.opportunities || []);
    const [notes, setNotes] = React.useState<string>(profile.notes ?? "");
    const [goals, setGoals] = React.useState<string>(profile.goals ?? "");
    const [notesHistory, setNotesHistory] = React.useState<any[]>(profile.notesHistory || []);
    const [goalsHistory, setGoalsHistory] = React.useState<any[]>(profile.goalsHistory || []);
    const [saving, setSaving] = React.useState(false);

    const persist = React.useCallback(
        async (patch: Profile) => {
            setSaving(true);
            await updateSupplierProfile(rid, patch);
            setSaving(false);
        },
        [rid],
    );

    // ── Volume by year (from orders) ───────────────────────────────────────
    const volumeByYear = React.useMemo(() => {
        const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
        const map = new Map<number, number>(years.map((y) => [y, 0]));
        for (const o of orders || []) {
            const y = o.createdAt ? new Date(o.createdAt).getUTCFullYear() : null;
            if (y && map.has(y)) map.set(y, (map.get(y) || 0) + Number(o.totalAmount || 0));
        }
        return years.map((y) => ({ year: String(y), volume: Math.round(map.get(y) || 0) }));
    }, [orders]);

    const annualRevenue = React.useMemo(() => {
        const arr = Array.isArray(profile.financialFigures?.annual_revenue)
            ? profile.financialFigures.annual_revenue
            : [];
        return [...arr]
            .sort((a: any, b: any) => a.year - b.year)
            .map((r: any) => ({ year: String(r.year), revenue: r.revenue }));
    }, [profile]);

    const purchaseBySupplier = React.useMemo(() => {
        const arr = Array.isArray(profile.financialFigures?.annual_purchase_volume_main_suppliers)
            ? profile.financialFigures.annual_purchase_volume_main_suppliers
            : [];
        return arr.map((s: any) => ({ name: s.supplier, share: s.share_pct }));
    }, [profile]);

    // ── Activity logging ───────────────────────────────────────────────────
    const [activityType, setActivityType] = React.useState("phone");
    const [activityText, setActivityText] = React.useState("");

    const addActivity = () => {
        if (!activityText.trim()) return;
        const next = [
            { id: crypto.randomUUID(), type: activityType, text: activityText.trim(), at: new Date().toISOString() },
            ...activities,
        ];
        setActivities(next);
        persist({ activities: next });
        setActivityText("");
    };

    const [oppKind, setOppKind] = React.useState("savings");
    const [oppAmount, setOppAmount] = React.useState("");
    const [oppNote, setOppNote] = React.useState("");

    const addOpportunity = () => {
        if (!oppNote.trim() && !oppAmount) return;
        const next = [
            {
                id: crypto.randomUUID(),
                kind: oppKind,
                amount: Number(oppAmount) || 0,
                note: oppNote.trim(),
                at: new Date().toISOString(),
            },
            ...opportunities,
        ];
        setOpportunities(next);
        persist({ opportunities: next });
        setOppAmount("");
        setOppNote("");
    };

    const saveNotes = () => {
        const nextHistory = notes.trim()
            ? [{ text: notes, at: new Date().toISOString() }, ...notesHistory].slice(0, 10)
            : notesHistory;
        setNotesHistory(nextHistory);
        persist({ notes, notesHistory: nextHistory });
    };

    const saveGoals = () => {
        const nextHistory = goals.trim()
            ? [{ text: goals, at: new Date().toISOString() }, ...goalsHistory].slice(0, 10)
            : goalsHistory;
        setGoalsHistory(nextHistory);
        persist({ goals, goalsHistory: nextHistory });
    };

    const statusLabel = (supplier.status || "active").charAt(0).toUpperCase() + (supplier.status || "active").slice(1);
    const website = profile.general_information?.public_website
        ? profile.general_information.public_website.replace(/^https?:\/\//, "")
        : null;

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8">
                <Link
                    href="/suppliers"
                    className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to suppliers
                </Link>

                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-emerald-100 text-emerald-700">
                            <Building2 className="h-7 w-7" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-black text-slate-900">{supplier.name}</h1>
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        supplier.status === "active"
                                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                            : "border-slate-200 bg-slate-50 text-slate-600",
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "mr-1.5 h-2 w-2 rounded-full",
                                            supplier.status === "active" ? "bg-emerald-500" : "bg-slate-400",
                                        )}
                                    />
                                    {statusLabel}
                                </Badge>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                                <span className="font-mono">#{supplier.supplierNumber ?? supplier.id}</span>
                                <span className="inline-flex items-center gap-1">
                                    <span>{flagEmoji(supplier.countryCode)}</span>
                                    {supplier.countryCode ? supplier.countryCode : "—"}
                                    {supplier.city ? ` · ${supplier.city}` : ""}
                                </span>
                                {website ? (
                                    <a
                                        href={`https://${website}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                                    >
                                        <Globe2 className="h-3.5 w-3.5" /> {website}
                                    </a>
                                ) : null}
                                {supplier.contactEmail ? (
                                    <a
                                        href={`mailto:${supplier.contactEmail}`}
                                        className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                                    >
                                        <Mail className="h-3.5 w-3.5" /> {supplier.contactEmail}
                                    </a>
                                ) : null}
                            </div>
                        </div>
                    </div>
                    <Button asChild variant="outline" className="gap-2">
                        <Link href={`/suppliers/${rid}/properties`}>
                            View all properties
                        </Link>
                    </Button>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-[1.7fr_1fr]">
                    {/* Main column */}
                    <div className="space-y-4">
                        {/* Highlights */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-500">
                                    <Sparkles className="h-4 w-4 text-emerald-600" /> Highlights
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    {[
                                        { label: "Risk", value: supplier.riskScore, icon: <Activity className="h-4 w-4" /> },
                                        { label: "ESG", value: supplier.esgScore, icon: <Leaf className="h-4 w-4" /> },
                                        { label: "Performance", value: supplier.performanceScore, icon: <TrendingUp className="h-4 w-4" /> },
                                        { label: "Financial", value: supplier.financialScore, icon: <BarChart3 className="h-4 w-4" /> },
                                    ].map((m) => (
                                        <div key={m.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                {m.icon} {m.label}
                                            </div>
                                            <div className={cn("mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-bold", scoreColor(m.value))}>
                                                {m.value ?? "—"}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-white p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">AI summary</p>
                                    <p className="mt-1 text-sm text-slate-700">
                                        {profile.aiSummary ||
                                            `Automated insight for ${supplier.name}: ${supplier.strategicClassification || "unclassified"} supplier based in ${
                                                supplier.city || supplier.countryCode || "unknown location"
                                            }.`}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-white p-4">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Price development</p>
                                    {annualRevenue.length ? (
                                        <div className="h-40">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={annualRevenue} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="price" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                                                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                                                    <YAxis tick={{ fontSize: 11 }} width={44} />
                                                    <Tooltip />
                                                    <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#price)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-400">No price history available.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Key figures & volume charts */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">Key figures</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div>
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Transaction volume (2020–2026)
                                    </p>
                                    <div className="h-52">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={volumeByYear} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                                                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                                                <YAxis tick={{ fontSize: 11 }} width={52} />
                                                <Tooltip />
                                                <Bar dataKey="volume" fill="#0f766e" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                {purchaseBySupplier.length ? (
                                    <div>
                                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Category / purchase volume by main supplier
                                        </p>
                                        <div className="h-52">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart layout="vertical" data={purchaseBySupplier} margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                                                    <XAxis type="number" tick={{ fontSize: 11 }} />
                                                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={70} />
                                                    <Tooltip />
                                                    <Bar dataKey="share" fill="#6366f1" radius={[0, 4, 4, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                ) : null}
                            </CardContent>
                        </Card>

                        {/* Activities & Opportunities */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card className="shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-500">
                                        <Phone className="h-4 w-4 text-blue-600" /> Activities
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex flex-wrap gap-2">
                                        <Select value={activityType} onValueChange={setActivityType}>
                                            <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="phone">Phone call</SelectItem>
                                                <SelectItem value="meeting">Meeting</SelectItem>
                                                <SelectItem value="email">Email</SelectItem>
                                                <SelectItem value="note">Note</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            value={activityText}
                                            onChange={(e) => setActivityText(e.target.value)}
                                            placeholder="Log an activity…"
                                            className="h-9 flex-1"
                                            onKeyDown={(e) => e.key === "Enter" && addActivity()}
                                        />
                                        <Button size="sm" className="h-9 gap-1" onClick={addActivity}>
                                            <Plus className="h-4 w-4" /> Add
                                        </Button>
                                    </div>
                                    <div className="max-h-48 space-y-2 overflow-auto">
                                        {activities.length ? (
                                            activities.map((a) => (
                                                <div key={a.id} className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm">
                                                    <span className="font-semibold capitalize text-slate-700">{a.type}</span>
                                                    <span className="ml-2 text-slate-600">{a.text}</span>
                                                    <span className="ml-2 text-[11px] text-slate-400">
                                                        {new Date(a.at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-slate-400">No activities logged yet.</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-500">
                                        <Target className="h-4 w-4 text-emerald-600" /> Opportunities
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex flex-wrap gap-2">
                                        <Select value={oppKind} onValueChange={setOppKind}>
                                            <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="savings">Savings opportunity</SelectItem>
                                                <SelectItem value="price_increase">Price increase</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            value={oppAmount}
                                            onChange={(e) => setOppAmount(e.target.value)}
                                            type="number"
                                            placeholder="Amount"
                                            className="h-9 w-24"
                                        />
                                        <Input
                                            value={oppNote}
                                            onChange={(e) => setOppNote(e.target.value)}
                                            placeholder="Note…"
                                            className="h-9 flex-1"
                                        />
                                        <Button size="sm" className="h-9 gap-1" onClick={addOpportunity}>
                                            <Plus className="h-4 w-4" /> Add
                                        </Button>
                                    </div>
                                    <div className="max-h-48 space-y-2 overflow-auto">
                                        {opportunities.length ? (
                                            opportunities.map((o) => (
                                                <div key={o.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm">
                                                    <span className="text-slate-600">{o.note || o.kind}</span>
                                                    <span
                                                        className={cn(
                                                            "inline-flex items-center gap-1 font-semibold",
                                                            o.kind === "savings" ? "text-emerald-600" : "text-rose-600",
                                                        )}
                                                    >
                                                        {o.kind === "savings" ? (
                                                            <TrendingDown className="h-3.5 w-3.5" />
                                                        ) : (
                                                            <TrendingUp className="h-3.5 w-3.5" />
                                                        )}
                                                        {o.amount ? `${o.amount.toLocaleString()}` : ""}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-slate-400">No opportunities logged yet.</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Profile: Notes & Goals */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card className="shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">Notes</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={5}
                                        placeholder="Add internal notes…"
                                    />
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] text-slate-400">
                                            {notesHistory.length ? `${notesHistory.length} revision(s)` : "No revisions"}
                                        </span>
                                        <Button size="sm" variant="outline" onClick={saveNotes} disabled={saving}>
                                            Save notes
                                        </Button>
                                    </div>
                                    {notesHistory.length ? (
                                        <ul className="space-y-1 border-t border-slate-100 pt-2 text-[11px] text-slate-400">
                                            {notesHistory.slice(0, 3).map((h, i) => (
                                                <li key={i}>
                                                    {new Date(h.at).toLocaleString()} — {h.text.slice(0, 60)}
                                                    {h.text.length > 60 ? "…" : ""}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : null}
                                </CardContent>
                            </Card>
                            <Card className="shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">Goals</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Textarea
                                        value={goals}
                                        onChange={(e) => setGoals(e.target.value)}
                                        rows={5}
                                        placeholder="Set supplier goals…"
                                    />
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] text-slate-400">
                                            {goalsHistory.length ? `${goalsHistory.length} revision(s)` : "No revisions"}
                                        </span>
                                        <Button size="sm" variant="outline" onClick={saveGoals} disabled={saving}>
                                            Save goals
                                        </Button>
                                    </div>
                                    {goalsHistory.length ? (
                                        <ul className="space-y-1 border-t border-slate-100 pt-2 text-[11px] text-slate-400">
                                            {goalsHistory.slice(0, 3).map((h, i) => (
                                                <li key={i}>
                                                    {new Date(h.at).toLocaleString()} — {h.text.slice(0, 60)}
                                                    {h.text.length > 60 ? "…" : ""}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : null}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        <Card className="h-fit shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">Key information</CardTitle>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7">
                                            <Settings2 className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem asChild>
                                            <Link href={`/suppliers/${rid}/properties`}>Configure properties</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href={`/suppliers/${rid}/properties`}>Configure sidebar</Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <InfoRow label="Supplier Status" value={statusLabel} />
                                <InfoRow label="Supplier Type" value={supplier.supplierType ?? "—"} />
                                <InfoRow
                                    label="Area of Need"
                                    value={(supplier.areaOfNeed || []).join(", ") || "—"}
                                />
                                <InfoRow
                                    label="Commodity"
                                    value={(supplier.commodityGroup || []).join(", ") || "—"}
                                />
                                <InfoRow
                                    label="Responsible Buyer"
                                    value={(supplier.responsibleBuyer || []).join(", ") || "—"}
                                />
                                <InfoRow label="Order Volume" value={`${supplier.currentYearVolume ?? 0}`} />
                                <InfoRow label="ABC Classification" value={supplier.abcClassification ?? "None"} />
                                <div className="pt-2">
                                    <Button asChild className="w-full gap-2">
                                        <Link href={`/suppliers/${rid}/properties`}>
                                            <Users className="h-4 w-4" /> View all properties
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2 last:border-0">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
            <span className="text-right font-medium text-slate-700">{value}</span>
        </div>
    );
}
