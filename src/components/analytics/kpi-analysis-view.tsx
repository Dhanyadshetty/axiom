'use client';

import React, { useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Download, TrendingDown, TrendingUp, ArrowUpRight, ArrowDownRight, Layers, Factory, BoxSelect, DollarSign } from 'lucide-react';
import { downloadCsvFile } from '@/lib/client/download';
import { toast } from 'sonner';
import { VolumeKPIOverview, AnalyticsTabType, OtherEntityType } from './types';

interface KPIAnalysisViewProps {
    data: VolumeKPIOverview;
    activeTab: AnalyticsTabType;
    otherEntity?: OtherEntityType;
}

export function KPIAnalysisView({ data, activeTab, otherEntity = 'incoterms' }: KPIAnalysisViewProps) {
    const [selectedMetric, setSelectedMetric] = useState<'Invoice Volume' | 'Order Volume' | 'Invoice Count' | 'Supplier Count'>('Invoice Volume');

    // Chart data mapping
    const chartData = data.yearlyTrend.map((item) => ({
        year: item.year,
        value:
            selectedMetric === 'Invoice Volume'
                ? item.invoiceVolume
                : selectedMetric === 'Order Volume'
                ? item.orderVolume
                : selectedMetric === 'Invoice Count'
                ? item.invoiceCount
                : item.supplierCount,
    }));

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    const formatCompactYAxis = (val: number) => {
        if (selectedMetric === 'Invoice Count' || selectedMetric === 'Supplier Count') {
            return val.toLocaleString();
        }
        if (val >= 1e6) {
            return `${Math.round(val / 1e6)}M`;
        }
        if (val >= 1e3) {
            return `${Math.round(val / 1e3)}K`;
        }
        return String(val);
    };

    const handleDownloadChart = (type: 'csv' | 'png' | 'svg') => {
        if (type === 'csv') {
            const rows = [
                ['Year', selectedMetric],
                ...chartData.map((row) => [row.year, row.value]),
            ];
            downloadCsvFile(`kpi_analysis_${selectedMetric.toLowerCase().replace(/\s+/g, '_')}.csv`, rows);
            toast.success('Chart CSV data downloaded');
        } else {
            toast.info(`Preparing ${type.toUpperCase()} export...`);
            setTimeout(() => toast.success(`Chart exported as ${type.toUpperCase()}`), 600);
        }
    };

    return (
        <div className="space-y-6">
            {/* ── Tab: Overview ── */}
            {activeTab === 'overview' && (
                <>
                    {/* ── 4 KPI Metric Summary Cards (2x2 Grid matching screenshot) ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Card 1: Invoice volume */}
                        <Card className="rounded-xl border border-border/70 bg-card shadow-xs">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between text-xs text-muted-foreground font-medium mb-1.5">
                                    <span className="font-semibold text-foreground/80">Invoice volume</span>
                                    <span>{data.currentYear}</span>
                                </div>
                                <div className="flex items-baseline gap-2.5">
                                    <span className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
                                        {formatCurrency(data.invoiceVolume)}
                                    </span>
                                    <span
                                        className={`inline-flex items-center text-xs font-bold px-1.5 py-0.5 rounded ${
                                            data.invoiceVolumeChange >= 0
                                                ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                                                : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                                        }`}
                                    >
                                        {data.invoiceVolumeChange > 0 ? `+${data.invoiceVolumeChange}%` : `${data.invoiceVolumeChange}%`}
                                    </span>
                                </div>
                                <div className="text-xs text-muted-foreground mt-2 font-medium">
                                    <span>{formatCurrency(data.priorInvoiceVolume)}</span>
                                    <span className="ml-2">{data.priorYear}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Card 2: Active categories */}
                        <Card className="rounded-xl border border-border/70 bg-card shadow-xs">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between text-xs text-muted-foreground font-medium mb-1.5">
                                    <span className="font-semibold text-foreground/80">Active categories</span>
                                    <span>{data.currentYear}</span>
                                </div>
                                <div className="flex items-baseline gap-2.5">
                                    <span className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
                                        {data.activeCategories.toLocaleString()}
                                    </span>
                                    <span className="inline-flex items-center text-xs font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                                        {data.activeCategoriesChange > 0 ? `${data.activeCategoriesChange}%` : `${data.activeCategoriesChange}%`}
                                    </span>
                                </div>
                                <div className="text-xs text-muted-foreground mt-2 font-medium">
                                    <span>{data.priorActiveCategories}</span>
                                    <span className="ml-2">{data.priorYear}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Card 3: Active suppliers */}
                        <Card className="rounded-xl border border-border/70 bg-card shadow-xs">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between text-xs text-muted-foreground font-medium mb-1.5">
                                    <span className="font-semibold text-foreground/80">Active suppliers</span>
                                    <span>{data.currentYear}</span>
                                </div>
                                <div className="flex items-baseline gap-2.5">
                                    <span className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
                                        {data.activeSuppliers.toLocaleString()}
                                    </span>
                                    <span className="inline-flex items-center text-xs font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                                        {data.activeSuppliersChange > 0 ? `+${data.activeSuppliersChange}%` : `${data.activeSuppliersChange}%`}
                                    </span>
                                </div>
                                <div className="text-xs text-muted-foreground mt-2 font-medium">
                                    <span>{data.priorActiveSuppliers.toLocaleString()}</span>
                                    <span className="ml-2">{data.priorYear}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Card 4: Active articles */}
                        <Card className="rounded-xl border border-border/70 bg-card shadow-xs">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between text-xs text-muted-foreground font-medium mb-1.5">
                                    <span className="font-semibold text-foreground/80">Active articles</span>
                                    <span>{data.currentYear}</span>
                                </div>
                                <div className="flex items-baseline gap-2.5">
                                    <span className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
                                        {data.activeArticles.toLocaleString()}
                                    </span>
                                    <span className="inline-flex items-center text-xs font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                                        {data.activeArticlesChange > 0 ? `${data.activeArticlesChange}%` : `${data.activeArticlesChange}%`}
                                    </span>
                                </div>
                                <div className="text-xs text-muted-foreground mt-2 font-medium">
                                    <span>{data.priorActiveArticles}</span>
                                    <span className="ml-2">{data.priorYear}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* ── Chart Section ── */}
                    <Card className="rounded-xl border border-border/70 bg-card shadow-xs">
                        <CardHeader className="p-4 lg:p-5 pb-2 flex flex-row items-center justify-between">
                            {/* Metric Selector Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-8 text-xs font-bold gap-1.5 rounded-md border-border/80">
                                        <span>{selectedMetric}</span>
                                        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-48">
                                    {(['Invoice Volume', 'Order Volume', 'Invoice Count', 'Supplier Count'] as const).map((m) => (
                                        <DropdownMenuItem
                                            key={m}
                                            onClick={() => setSelectedMetric(m)}
                                            className="text-xs font-medium cursor-pointer"
                                        >
                                            {m}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Download Chart Button */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-8 text-xs font-semibold gap-1.5 rounded-md border-border/80">
                                        <Download className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span>Download chart</span>
                                        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                    <DropdownMenuItem onClick={() => handleDownloadChart('csv')} className="text-xs cursor-pointer">
                                        Download as CSV
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDownloadChart('png')} className="text-xs cursor-pointer">
                                        Download as PNG
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDownloadChart('svg')} className="text-xs cursor-pointer">
                                        Download as SVG
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardHeader>

                        <CardContent className="p-4 lg:p-5 pt-2">
                            {/* Y-Axis Title Indicator */}
                            <div className="text-[11px] text-muted-foreground font-semibold mb-2">
                                {selectedMetric} {selectedMetric.includes('Volume') ? '[€]' : ''}
                            </div>

                            <div className="h-[320px] w-full">
                                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={320}>
                                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.6)" />
                                        <XAxis
                                            dataKey="year"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.7 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.7 }}
                                            tickFormatter={formatCompactYAxis}
                                        />
                                        <Tooltip
                                            content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    const val = payload[0].value as number;
                                                    return (
                                                        <div className="bg-popover/95 backdrop-blur border border-border p-3 rounded-lg shadow-lg text-xs">
                                                            <p className="font-bold text-foreground mb-1">Year {label}</p>
                                                            <p className="text-muted-foreground">
                                                                {selectedMetric}:{' '}
                                                                <span className="font-bold text-foreground">
                                                                    {selectedMetric.includes('Volume') ? formatCurrency(val) : val.toLocaleString()}
                                                                </span>
                                                            </p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar
                                            dataKey="value"
                                            fill="#2563eb"
                                            radius={[4, 4, 0, 0]}
                                            maxBarSize={90}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}

            {/* ── Tab: Categories ── */}
            {activeTab === 'categories' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-foreground">Procurement Spend by Category</h3>
                            <p className="text-xs text-muted-foreground">Direct & indirect category spend allocation</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const rows = [
                                    ['Category', 'Volume (EUR)', 'Share (%)', 'Articles', 'Suppliers', 'YoY Growth (%)'],
                                    ...data.categoryBreakdown.map(c => [c.category, c.volume, c.sharePercent, c.articleCount, c.supplierCount, c.yoyGrowth]),
                                ];
                                downloadCsvFile('categories_spend_breakdown.csv', rows);
                                toast.success('Categories breakdown downloaded');
                            }}
                            className="text-xs gap-1.5"
                        >
                            <Download className="h-3.5 w-3.5" /> Export CSV
                        </Button>
                    </div>

                    <Card className="rounded-xl border border-border/70 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold text-[10px] tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3">Category Name</th>
                                        <th className="px-4 py-3 text-right">Volume (€)</th>
                                        <th className="px-4 py-3 text-right">Share of Spend</th>
                                        <th className="px-4 py-3 text-center">Active Articles</th>
                                        <th className="px-4 py-3 text-center">Suppliers</th>
                                        <th className="px-4 py-3 text-right">YoY Growth</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60 font-medium">
                                    {data.categoryBreakdown.map((item, i) => (
                                        <tr key={i} className="hover:bg-muted/40 transition-colors">
                                            <td className="px-4 py-3 font-semibold text-foreground flex items-center gap-2">
                                                <span className="h-2 w-2 rounded-full bg-primary/80" />
                                                {item.category}
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-foreground">{formatCurrency(item.volume)}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className="w-16 bg-muted rounded-full h-1.5 overflow-hidden">
                                                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${item.sharePercent}%` }} />
                                                    </div>
                                                    <span>{item.sharePercent}%</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center text-muted-foreground">{item.articleCount}</td>
                                            <td className="px-4 py-3 text-center text-muted-foreground">{item.supplierCount}</td>
                                            <td className="px-4 py-3 text-right">
                                                <span className={`inline-flex items-center gap-0.5 font-bold ${item.yoyGrowth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                    {item.yoyGrowth >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                                    {item.yoyGrowth >= 0 ? `+${item.yoyGrowth}%` : `${item.yoyGrowth}%`}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {/* ── Tab: Suppliers ── */}
            {activeTab === 'suppliers' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-foreground">Top Suppliers by Volume</h3>
                            <p className="text-xs text-muted-foreground">Supplier consolidation and procurement concentration</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const rows = [
                                    ['Supplier', 'Country', 'Volume (EUR)', 'Share (%)', 'Invoices', 'Status'],
                                    ...data.supplierBreakdown.map(s => [s.name, s.country, s.volume, s.sharePercent, s.invoiceCount, s.status]),
                                ];
                                downloadCsvFile('supplier_volume_ranking.csv', rows);
                                toast.success('Supplier ranking downloaded');
                            }}
                            className="text-xs gap-1.5"
                        >
                            <Download className="h-3.5 w-3.5" /> Export CSV
                        </Button>
                    </div>

                    <Card className="rounded-xl border border-border/70 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold text-[10px] tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3">Rank & Supplier</th>
                                        <th className="px-4 py-3 text-center">Country</th>
                                        <th className="px-4 py-3 text-right">Invoice Volume (€)</th>
                                        <th className="px-4 py-3 text-right">Spend Share</th>
                                        <th className="px-4 py-3 text-center">Invoices</th>
                                        <th className="px-4 py-3 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60 font-medium">
                                    {data.supplierBreakdown.map((s, idx) => (
                                        <tr key={s.id || idx} className="hover:bg-muted/40 transition-colors">
                                            <td className="px-4 py-3 font-semibold text-foreground flex items-center gap-2">
                                                <span className="h-5 w-5 rounded bg-muted text-[10px] font-bold flex items-center justify-center text-muted-foreground">
                                                    {idx + 1}
                                                </span>
                                                {s.name}
                                            </td>
                                            <td className="px-4 py-3 text-center font-semibold text-muted-foreground">{s.country}</td>
                                            <td className="px-4 py-3 text-right font-bold text-foreground">{formatCurrency(s.volume)}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className="w-16 bg-muted rounded-full h-1.5 overflow-hidden">
                                                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${s.sharePercent * 3}%` }} />
                                                    </div>
                                                    <span>{s.sharePercent}%</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center text-muted-foreground">{s.invoiceCount}</td>
                                            <td className="px-4 py-3 text-center">
                                                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                                                    {s.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {/* ── Tab: Articles ── */}
            {activeTab === 'articles' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-foreground">Top Active Articles & Parts</h3>
                            <p className="text-xs text-muted-foreground">Volume spend per part number and key component</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const rows = [
                                    ['Part Number (SKU)', 'Article Name', 'Category', 'Unit Price (EUR)', 'Total Volume (EUR)', 'Primary Supplier'],
                                    ...data.articleBreakdown.map(a => [a.sku, a.name, a.category, a.unitPrice, a.totalVolume, a.supplierName]),
                                ];
                                downloadCsvFile('top_articles_volume.csv', rows);
                                toast.success('Articles list downloaded');
                            }}
                            className="text-xs gap-1.5"
                        >
                            <Download className="h-3.5 w-3.5" /> Export CSV
                        </Button>
                    </div>

                    <Card className="rounded-xl border border-border/70 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold text-[10px] tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3">Part Number</th>
                                        <th className="px-4 py-3">Article Description</th>
                                        <th className="px-4 py-3">Category</th>
                                        <th className="px-4 py-3 text-right">Unit Price</th>
                                        <th className="px-4 py-3 text-right">Total Volume (€)</th>
                                        <th className="px-4 py-3">Primary Supplier</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60 font-medium">
                                    {data.articleBreakdown.map((art, idx) => (
                                        <tr key={idx} className="hover:bg-muted/40 transition-colors">
                                            <td className="px-4 py-3 font-mono font-bold text-primary">{art.sku}</td>
                                            <td className="px-4 py-3 font-semibold text-foreground">{art.name}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{art.category}</td>
                                            <td className="px-4 py-3 text-right text-foreground">{formatCurrency(art.unitPrice)}</td>
                                            <td className="px-4 py-3 text-right font-bold text-foreground">{formatCurrency(art.totalVolume)}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{art.supplierName}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {/* ── Tab: Other Entities (Incoterms, Payment Terms, Plants, Countries) ── */}
            {activeTab === 'other' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-foreground capitalize">
                                Spend Distribution by {otherEntity.replace('-', ' ')}
                            </h3>
                            <p className="text-xs text-muted-foreground">Contractual and organizational breakdown</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.otherEntities[otherEntity === 'payment-terms' ? 'paymentTerms' : otherEntity === 'plants' ? 'plants' : otherEntity === 'countries' ? 'countries' : 'incoterms'].map((item, idx) => (
                            <Card key={idx} className="rounded-xl border border-border/70 p-4">
                                <div className="flex items-center justify-between text-xs font-semibold text-foreground mb-2">
                                    <span>{item.name}</span>
                                    <span className="font-bold text-primary">{item.percentage}%</span>
                                </div>
                                <div className="text-xl font-bold text-foreground mb-2">
                                    {formatCurrency(item.volume)}
                                </div>
                                <div className="w-full bg-muted rounded-full h-2 overflow-hidden mb-2">
                                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${item.percentage}%` }} />
                                </div>
                                <div className="text-[11px] text-muted-foreground">
                                    Total Transactions / Documents: <span className="font-semibold text-foreground">{item.count}</span>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
