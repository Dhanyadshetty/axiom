'use client'

import React, { useEffect, useMemo, useState } from 'react';
import Link from "next/link";
import { toast } from "sonner";
import {
    ArrowUpRight,
    Building2,
    Download,
    FileBarChart2,
    Globe2,
    Handshake,
    Layers,
    Network,
    ShieldCheck,
    ShieldAlert,
    Sparkles,
    Users,
} from "lucide-react";
import {
    BarChart,
    Bar,
    ResponsiveContainer,
    Tooltip,
    CartesianGrid,
    XAxis,
    YAxis,
} from 'recharts';

import { buildSupplierEcosystem } from "@/app/actions/agents/supplier-ecosystem";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { downloadCsvFile } from "@/lib/client/download";
import { useLanguage } from "@/components/i18n/language-provider";
import { t } from "@/lib/i18n";

type EcosystemNode = {
    id: string;
    name: string;
    riskScore: number;
    category: string;
    orderVolume: number;
    orderValue: number;
    partCategories: string[];
    contractStatus: 'active' | 'expiring' | 'none';
    performanceScore: number;
};

type EcosystemRelationship = {
    fromId: string;
    toId: string;
    relationshipType: 'shared_category' | 'shared_parts' | 'competitor' | 'backup';
    strength: number;
};

type EcosystemData = {
    overallHealthScore: number;
    nodes: EcosystemNode[];
    relationships: EcosystemRelationship[];
    clusters: Array<{ name: string; supplierIds: string[] }>;
    riskHotspots: Array<{
        sourceSupplier: string;
        impactSeverity: string;
        financialExposure: number;
        mitigationOptions: string[];
    }>;
    recommendations: string[];
};

function formatMoney(value: number) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(value || 0);
}

function getRiskTone(score: number) {
    if (score >= 75) return "border-red-200 bg-red-50 text-red-700";
    if (score >= 50) return "border-amber-200 bg-amber-50 text-amber-700";
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

export default function SupplierEcosystemPage() {
    const { language } = useLanguage();
    const ta = t(language, "admin");
    const [ecosystem, setEcosystem] = useState<EcosystemData | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setErrorMessage(null);
        try {
            const result = await buildSupplierEcosystem();
            if (result.success) {
                setEcosystem(result.data ?? null);
                return;
            }

            setEcosystem(null);
            setErrorMessage(result.error || "Failed to map supplier ecosystem");
            toast.error(result.error || "Failed to map supplier ecosystem");
        } catch {
            setEcosystem(null);
            setErrorMessage("Failed to map supplier ecosystem");
            toast.error("Failed to map supplier ecosystem");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const backupCoveredIds = useMemo(() => {
        const set = new Set<string>();
        for (const relationship of ecosystem?.relationships ?? []) {
            if (relationship.relationshipType === 'backup') {
                set.add(relationship.fromId);
            }
        }
        return set;
    }, [ecosystem]);

    const partnerRows = useMemo(
        () => [...(ecosystem?.nodes ?? [])].sort((left, right) => {
            if (right.performanceScore !== left.performanceScore) {
                return right.performanceScore - left.performanceScore;
            }
            return right.orderValue - left.orderValue;
        }),
        [ecosystem],
    );

    const performanceWatch = useMemo(
        () => partnerRows.filter((node) => node.performanceScore < 75 || node.riskScore >= 70).slice(0, 5),
        [partnerRows],
    );

    const expiringContracts = useMemo(
        () => (ecosystem?.nodes ?? []).filter((node) => node.contractStatus === 'expiring'),
        [ecosystem],
    );

    const singleSourcePartners = useMemo(
        () => (ecosystem?.nodes ?? []).filter((node) => node.orderValue > 0 && !backupCoveredIds.has(node.id)),
        [backupCoveredIds, ecosystem],
    );

    const clusterChartData = useMemo(
        () => (ecosystem?.clusters ?? [])
            .slice(0, 6)
            .map((cluster) => ({
                name: cluster.name.replace(" Suppliers", ""),
                partners: cluster.supplierIds.length,
            })),
        [ecosystem],
    );

    const hotspotExposureData = useMemo(
        () => (ecosystem?.riskHotspots ?? [])
            .slice(0, 6)
            .map((hotspot) => ({
                name: hotspot.sourceSupplier.split(" ").slice(0, 2).join(" "),
                exposure: Math.round(hotspot.financialExposure || 0),
            })),
        [ecosystem],
    );

    const handleDownloadPerformanceReport = () => {
        if (!ecosystem || ecosystem.nodes.length === 0) {
            toast.error(ta.noSupplierEcosystemData);
            return;
        }

        downloadCsvFile("axiom-supplier-performance-report.csv", [
            [
                "Supplier",
                "Category",
                "Risk Score",
                "Performance Score",
                "Order Volume",
                "Order Value",
                "Contract Status",
                "Backup Covered",
                "Part Categories",
            ],
            ...ecosystem.nodes.map((node) => [
                node.name,
                node.category || "General",
                node.riskScore,
                node.performanceScore,
                node.orderVolume,
                node.orderValue,
                node.contractStatus,
                backupCoveredIds.has(node.id) ? "Yes" : "No",
                (node.partCategories || []).join("; "),
            ]),
        ]);
        toast.success(ta.supplierPerformanceReportDownloaded);
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-muted/20">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{ta.mappingSupplierEcosystem}</p>
                </div>
            </div>
        );
    }

    if (!ecosystem && errorMessage) {
        return (
            <div className="flex min-h-full flex-col bg-background p-4 lg:p-8">
                <Card className="border-dashed">
                    <CardHeader>
                        <CardTitle>{ta.supplierEcosystemRebuildFailed}</CardTitle>
                        <CardDescription>
                            {errorMessage}. {ta.rebuildDescription}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-3">
                            <Button variant="outline" onClick={fetchData}>{ta.retryMapping}</Button>
                            <Link href="/suppliers">
                                <Button variant="outline">{ta.openSuppliers}</Button>
                            </Link>
                            <Link href="/admin/import">
                                <Button>{ta.loadSupplierData}</Button>
                            </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (ecosystem && ecosystem.nodes.length === 0) {
        return (
            <div className="flex min-h-full flex-col bg-background p-4 lg:p-8">
                <Card className="border-dashed">
                    <CardHeader>
                            <CardTitle>{ta.awaitingLiveNetwork}</CardTitle>
                            <CardDescription>
                                {ta.awaitingLiveNetworkBody}
                            </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-3">
                        <Button variant="outline" onClick={fetchData}>Rebuild Network</Button>
                        <Link href="/suppliers">
                            <Button variant="outline">Open Suppliers</Button>
                        </Link>
                        <Link href="/admin/import">
                            <Button>Load Supplier Data</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!ecosystem) {
        return (
            <div className="flex min-h-full flex-col bg-background p-4 lg:p-8">
                <Card className="border-dashed">
                    <CardHeader>
                            <CardTitle>{ta.supplierEcosystemWaiting}</CardTitle>
                            <CardDescription>
                                {ta.supplierEcosystemWaitingBody}
                            </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-3">
                        <Button variant="outline" onClick={fetchData}>Rebuild Network</Button>
                        <Link href="/suppliers">
                            <Button variant="outline">Open Suppliers</Button>
                        </Link>
                        <Link href="/admin/import">
                            <Button>Load Supplier Data</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-full flex-col bg-background p-4 lg:p-8 space-y-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                            <Network className="h-8 w-8 text-primary" />
                            {ta.supplierEcosystem}
                        </h1>
                        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                            {ta.healthScore.replace("{score}", String(ecosystem.overallHealthScore))}
                        </Badge>
                    </div>
                    <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                        {ta.ecosystemIntro}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                        <Button variant="outline" className="gap-2" onClick={fetchData} disabled={loading}>
                            <Sparkles className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> {ta.rebuildNetwork}
                        </Button>
                        <Button variant="outline" className="gap-2" onClick={handleDownloadPerformanceReport}>
                            <Download className="h-4 w-4" /> {ta.generatePerformanceReport}
                        </Button>
                        <Link href="/suppliers">
                            <Button variant="outline" className="gap-2">
                                <Users className="h-4 w-4" /> {ta.openSuppliers}
                            </Button>
                        </Link>
                        <Link href="/admin/risk">
                            <Button className="gap-2">
                                <ShieldAlert className="h-4 w-4" /> {ta.openRiskIntelligence}
                            </Button>
                        </Link>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card className="border-l-4 border-l-primary">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">{ta.partnersMapped}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{ecosystem.nodes.length}</div>
                        <p className="mt-1 text-xs text-muted-foreground">{ta.activeSuppliersLive}</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-sky-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">{ta.backupCoverage}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-sky-700">{backupCoveredIds.size}</div>
                        <p className="mt-1 text-xs text-muted-foreground">{ta.mappedBackupLane}</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-amber-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">{ta.contractsExpiring}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-amber-700">{expiringContracts.length}</div>
                        <p className="mt-1 text-xs text-muted-foreground">{ta.commercialCoverRenewal}</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-red-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">{ta.criticalHotspots}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-red-700">{ecosystem.riskHotspots.length}</div>
                        <p className="mt-1 text-xs text-muted-foreground">{ta.exposurePoints}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr_1fr]">
                <Card className="border-slate-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Handshake className="h-5 w-5 text-emerald-600" />
                            {ta.supplierPartnershipRoutes}
                        </CardTitle>
                        <CardDescription>
                            {ta.supplierCollaborationPresent}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border bg-muted/20 p-4">
                                <p className="text-sm font-bold text-foreground">{ta.selfServiceOnboarding}</p>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    {ta.selfServiceOnboardingBody}
                                </p>
                            </div>
                            <div className="rounded-2xl border bg-muted/20 p-4">
                                <p className="text-sm font-bold text-foreground">{ta.bidOrderCollaboration}</p>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    {ta.bidOrderCollaborationBody}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2 rounded-2xl border border-dashed p-4">
                            <p className="text-sm font-bold text-foreground">{ta.currentReadinessBoundary}</p>
                            <p className="text-sm leading-6 text-muted-foreground">
                                {ta.readinessBoundaryBody}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Link href="/suppliers">
                                <Button variant="outline" className="gap-2">
                                    <Building2 className="h-4 w-4" /> {ta.reviewSupplierRecords}
                                </Button>
                            </Link>
                            <Link href="/admin/compliance">
                                <Button variant="outline" className="gap-2">
                                    <ShieldCheck className="h-4 w-4" /> {ta.openCompliance}
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileBarChart2 className="h-5 w-5 text-sky-600" />
                            {ta.performanceWatch}
                        </CardTitle>
                        <CardDescription>
                            {ta.performanceWatchBody}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {performanceWatch.length > 0 ? performanceWatch.map((node) => (
                            <div key={node.id} className="rounded-2xl border p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-bold text-foreground">{node.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {node.category || "General"} · {node.orderVolume} orders · {formatMoney(node.orderValue)}
                                        </p>
                                    </div>
                                    <Badge variant="outline" className={getRiskTone(node.riskScore)}>
                                        Risk {node.riskScore}
                                    </Badge>
                                </div>
                                <div className="mt-3 flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Performance</span>
                                    <span className="font-bold">{node.performanceScore}/100</span>
                                </div>
                            </div>
                        )) : (
                                <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                                    {ta.noPerformanceWatch}
                                </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Layers className="h-5 w-5 text-amber-600" />
                            {ta.dependencyPressure}
                        </CardTitle>
                        <CardDescription>
                            {ta.dependencyPressureBody}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-2xl border bg-muted/20 p-4">
                            <p className="text-sm font-bold text-foreground">{ta.singleSourceWatchlist}</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {ta.singleSourceWatchlistBody.replace("{count}", String(singleSourcePartners.length))}
                            </p>
                        </div>
                        <div className="space-y-2">
                            {singleSourcePartners.slice(0, 4).map((node) => (
                                <div key={node.id} className="flex items-center justify-between rounded-xl border px-3 py-2">
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">{node.name}</p>
                                        <p className="text-xs text-muted-foreground">{node.category || "General"}</p>
                                    </div>
                                    <span className="text-xs font-bold text-muted-foreground">{formatMoney(node.orderValue)}</span>
                                </div>
                            ))}
                            {singleSourcePartners.length === 0 ? (
                                    <div className="rounded-xl border border-dashed px-3 py-4 text-sm text-muted-foreground">
                                        {ta.noSingleSource}
                                    </div>
                            ) : null}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Link href="/admin/scenarios">
                                <Button variant="outline" className="gap-2">
                                    <Sparkles className="h-4 w-4" /> {ta.scenarioLab}
                                </Button>
                            </Link>
                            <Link href="/admin/risk">
                                <Button variant="outline" className="gap-2">
                                    <ShieldAlert className="h-4 w-4" /> {ta.riskRoutes}
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid min-w-0 gap-6 lg:grid-cols-2">
                <Card className="min-w-0">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-red-600" />
                            {ta.hotspotFeed}
                        </CardTitle>
                        <CardDescription>
                            {ta.hotspotFeedBody}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {ecosystem.riskHotspots.length > 0 ? ecosystem.riskHotspots.slice(0, 5).map((hotspot, index) => (
                            <div key={`${hotspot.sourceSupplier}-${index}`} className="rounded-2xl border p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-bold text-foreground">{hotspot.sourceSupplier}</p>
                                        <p className="mt-1 text-sm text-muted-foreground">{formatMoney(hotspot.financialExposure)} exposed</p>
                                    </div>
                                    <Badge variant="outline" className={hotspot.impactSeverity === 'critical'
                                        ? "border-red-200 bg-red-50 text-red-700"
                                        : hotspot.impactSeverity === 'high'
                                            ? "border-amber-200 bg-amber-50 text-amber-700"
                                            : "border-slate-200 bg-slate-50 text-slate-700"}>
                                        {hotspot.impactSeverity}
                                    </Badge>
                                </div>
                                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                    {hotspot.mitigationOptions[0] || "Build a recovery route before the next release cycle."}
                                </p>
                            </div>
                        )) : (
                                <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                                    {ta.noActiveHotspots}
                                </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="min-w-0">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe2 className="h-5 w-5 text-primary" />
                            {ta.networkShape}
                        </CardTitle>
                        <CardDescription>
                            {ta.networkShapeBody}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid min-w-0 gap-6 lg:grid-cols-2">
                        <div className="h-[260px] min-w-0">
                                <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">{ta.clusterDensity}</p>
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={260}>
                                <BarChart data={clusterChartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                                    <Bar dataKey="partners" fill="#0f766e" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="h-[260px] min-w-0">
                                <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">{ta.hotspotExposure}</p>
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={260}>
                                <BarChart data={hotspotExposureData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(value: number | string | undefined) => formatMoney(Number(value || 0))} />
                                    <Bar dataKey="exposure" fill="#dc2626" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                        <CardTitle>{ta.strategicRecommendations}</CardTitle>
                        <CardDescription>
                            {ta.strategicRecommendationsBody}
                        </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {ecosystem.recommendations.length > 0 ? ecosystem.recommendations.map((recommendation, index) => (
                        <div key={`${recommendation}-${index}`} className="rounded-2xl border p-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 rounded-full bg-primary/10 p-2 text-primary">
                                    <ArrowUpRight className="h-4 w-4" />
                                </div>
                                <p className="text-sm leading-6 text-foreground">{recommendation}</p>
                            </div>
                        </div>
                    )) : (
                            <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                                {ta.noLiveRecommendation}
                            </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
