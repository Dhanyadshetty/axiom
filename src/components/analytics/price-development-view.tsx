'use client';

import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, TrendingDown, TrendingUp, ArrowDownRight, ArrowUpRight, DollarSign } from 'lucide-react';
import { PriceDevelopmentData } from './types';
import { downloadCsvFile } from '@/lib/client/download';
import { toast } from 'sonner';

interface PriceDevelopmentViewProps {
    data: PriceDevelopmentData;
}

export function PriceDevelopmentView({ data }: PriceDevelopmentViewProps) {
    const handleDownloadCSV = () => {
        const rows = [
            ['SKU', 'Article', 'Category', 'Current Price (EUR)', 'Prior Price (EUR)', 'Variance (%)', 'Supplier'],
            ...data.articlePriceMovements.map(a => [a.sku, a.name, a.category, a.currentPrice, a.priorPrice, a.variancePercent, a.supplierName]),
        ];
        downloadCsvFile('price_development_report.csv', rows);
        toast.success('Price development report downloaded');
    };

    return (
        <div className="space-y-6">
            {/* ── 4 KPI Metrics for Price Development ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="rounded-xl border border-border/70 p-4">
                    <div className="text-xs text-muted-foreground font-semibold mb-1">Index Price Change</div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-foreground">{data.priceIndexChange}%</span>
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">Deflationary</Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1">Weighted purchase basket YoY</div>
                </Card>

                <Card className="rounded-xl border border-border/70 p-4">
                    <div className="text-xs text-muted-foreground font-semibold mb-1">Raw Material Inflation</div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-foreground">+{data.materialInflationRate}%</span>
                        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px]">Moderate</Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1">Copper, Aluminum, Polymers</div>
                </Card>

                <Card className="rounded-xl border border-border/70 p-4">
                    <div className="text-xs text-muted-foreground font-semibold mb-1">Negotiated Price Reductions</div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-foreground">{data.topReductionsCount}</span>
                        <span className="text-xs text-emerald-600 font-bold">Articles</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1">Active vendor price agreements</div>
                </Card>

                <Card className="rounded-xl border border-border/70 p-4">
                    <div className="text-xs text-muted-foreground font-semibold mb-1">Price Volatility Index</div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-foreground">{data.priceVolatilityIndex}%</span>
                        <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30 text-[10px]">Controlled</Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1">Quarterly variance standard deviation</div>
                </Card>
            </div>

            {/* ── Price Trend Chart ── */}
            <Card className="rounded-xl border border-border/70 p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-bold text-foreground">Procurement Price Index Trajectory</h3>
                        <p className="text-xs text-muted-foreground">Baseline 100 = 2024 Q1 reference basket</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleDownloadCSV} className="text-xs gap-1.5">
                        <Download className="h-3.5 w-3.5" /> Export Data
                    </Button>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={300}>
                        <LineChart data={data.priceTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.6)" />
                            <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                            <YAxis domain={[90, 110]} axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                            <Line type="monotone" dataKey="indexValue" stroke="#2563eb" strokeWidth={3} name="Overall Price Index" dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="electronics" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" name="Electronics" />
                            <Line type="monotone" dataKey="rawMaterials" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" name="Raw Materials" />
                            <Line type="monotone" dataKey="mechanical" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="4 4" name="Mechanical" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* ── Key Article Price Changes Table ── */}
            <Card className="rounded-xl border border-border/70 overflow-hidden">
                <div className="p-4 border-b border-border/70 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-foreground">Top Article Price Movements</h3>
                        <p className="text-xs text-muted-foreground">Highest price variance against contracted baseline</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold text-[10px] tracking-wider">
                            <tr>
                                <th className="px-4 py-3">Part SKU</th>
                                <th className="px-4 py-3">Article Name</th>
                                <th className="px-4 py-3">Category</th>
                                <th className="px-4 py-3 text-right">Current Price (€)</th>
                                <th className="px-4 py-3 text-right">Prior Price (€)</th>
                                <th className="px-4 py-3 text-right">Variance</th>
                                <th className="px-4 py-3">Primary Supplier</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60 font-medium">
                            {data.articlePriceMovements.map((item, idx) => (
                                <tr key={idx} className="hover:bg-muted/40 transition-colors">
                                    <td className="px-4 py-3 font-mono font-bold text-primary">{item.sku}</td>
                                    <td className="px-4 py-3 font-semibold text-foreground">{item.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{item.category}</td>
                                    <td className="px-4 py-3 text-right font-bold text-foreground">€{item.currentPrice.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right text-muted-foreground">€{item.priorPrice.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right">
                                        <span className={`inline-flex items-center gap-0.5 font-bold ${item.variancePercent <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                            {item.variancePercent <= 0 ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                                            {item.variancePercent > 0 ? `+${item.variancePercent}%` : `${item.variancePercent}%`}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{item.supplierName}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
