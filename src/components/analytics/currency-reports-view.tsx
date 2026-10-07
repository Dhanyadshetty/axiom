'use client';

import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Coins, Globe, ShieldCheck, ArrowRightLeft } from 'lucide-react';
import { CurrencyReportsData } from './types';
import { downloadCsvFile } from '@/lib/client/download';
import { toast } from 'sonner';

interface CurrencyReportsViewProps {
    data: CurrencyReportsData;
}

const CURRENCY_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

export function CurrencyReportsView({ data }: CurrencyReportsViewProps) {
    const handleDownloadCSV = () => {
        const rows = [
            ['Currency', 'Spend (EUR Equivalent)', 'Share (%)', 'Orders Count', 'Volatility Impact (%)'],
            ...data.currencyBreakdown.map(c => [c.currency, c.spend, c.sharePercent, c.orderCount, c.volatilityImpact]),
        ];
        downloadCsvFile('currency_exposure_report.csv', rows);
        toast.success('Currency exposure report downloaded');
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    return (
        <div className="space-y-6">
            {/* ── 4 KPI Metrics for Currency Exposure ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="rounded-xl border border-border/70 p-4">
                    <div className="text-xs text-muted-foreground font-semibold mb-1">Base Currency Spend (EUR)</div>
                    <div className="text-2xl font-bold text-foreground">{formatCurrency(data.baseCurrencySpend)}</div>
                    <div className="text-[11px] text-muted-foreground mt-1">68.9% of overall procurement value</div>
                </Card>

                <Card className="rounded-xl border border-border/70 p-4">
                    <div className="text-xs text-muted-foreground font-semibold mb-1">Foreign Currency Exposure</div>
                    <div className="text-2xl font-bold text-foreground">{formatCurrency(data.foreignCurrencySpend)}</div>
                    <div className="text-[11px] text-muted-foreground mt-1">USD, INR, CNY, GBP exposure</div>
                </Card>

                <Card className="rounded-xl border border-border/70 p-4">
                    <div className="text-xs text-muted-foreground font-semibold mb-1">FX Exposure Ratio</div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-foreground">{data.fxExposurePercent}%</span>
                        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px]">Monitored</Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1">Unhedged cross-border spend</div>
                </Card>

                <Card className="rounded-xl border border-border/70 p-4">
                    <div className="text-xs text-muted-foreground font-semibold mb-1">Hedging Coverage</div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-foreground">{data.hedgingCoveragePercent}%</span>
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">Protected</Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1">Forward contracts & FX collar</div>
                </Card>
            </div>

            {/* ── Currency Distribution Breakdown ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Pie Chart */}
                <Card className="rounded-xl border border-border/70 p-5">
                    <h3 className="text-sm font-bold text-foreground mb-1">Currency Share Breakdown</h3>
                    <p className="text-xs text-muted-foreground mb-3">Share of procurement invoices by currency</p>
                    <div className="h-[240px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.currencyBreakdown}
                                    dataKey="spend"
                                    nameKey="currency"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={85}
                                    paddingAngle={2}
                                >
                                    {data.currencyBreakdown.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={CURRENCY_COLORS[index % CURRENCY_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(val: any) => formatCurrency(Number(val))} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-3 text-xs mt-2">
                        {data.currencyBreakdown.map((c, i) => (
                            <div key={c.currency} className="flex items-center gap-1.5 font-medium">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CURRENCY_COLORS[i % CURRENCY_COLORS.length] }} />
                                <span>{c.currency} ({c.sharePercent}%)</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Table Breakdown */}
                <Card className="rounded-xl border border-border/70 lg:col-span-2 overflow-hidden">
                    <div className="p-4 border-b border-border/70 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-foreground">Multi-Currency Spend Analysis</h3>
                            <p className="text-xs text-muted-foreground">Currency exposure and volatility assessment</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleDownloadCSV} className="text-xs gap-1.5">
                            <Download className="h-3.5 w-3.5" /> Export CSV
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold text-[10px] tracking-wider">
                                <tr>
                                    <th className="px-4 py-3">Currency</th>
                                    <th className="px-4 py-3 text-right">Spend (€ Eqv.)</th>
                                    <th className="px-4 py-3 text-right">Share of Total</th>
                                    <th className="px-4 py-3 text-center">Orders</th>
                                    <th className="px-4 py-3 text-right">FX Impact</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60 font-medium">
                                {data.currencyBreakdown.map((c, idx) => (
                                    <tr key={idx} className="hover:bg-muted/40 transition-colors">
                                        <td className="px-4 py-3 font-bold text-foreground flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CURRENCY_COLORS[idx % CURRENCY_COLORS.length] }} />
                                            {c.currency}
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-foreground">{formatCurrency(c.spend)}</td>
                                        <td className="px-4 py-3 text-right">{c.sharePercent}%</td>
                                        <td className="px-4 py-3 text-center text-muted-foreground">{c.orderCount}</td>
                                        <td className="px-4 py-3 text-right">
                                            <span className={`font-bold ${c.volatilityImpact <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {c.volatilityImpact === 0 ? '0.0%' : `${c.volatilityImpact > 0 ? '+' : ''}${c.volatilityImpact}%`}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
}
