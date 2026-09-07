'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { TrendingDown, DollarSign, Target, Award, Download, PiggyBank, ArrowDownRight } from "lucide-react";
import { getSavingsData } from "@/app/actions/savings";
import { toast } from "sonner";
import { formatCurrencyByCode } from "@/lib/utils/currency";
import { downloadCsvFile } from "@/lib/client/download";
import { useLanguage } from "@/components/i18n/language-provider";
import { t } from "@/lib/i18n";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function SavingsPage() {
    const { language } = useLanguage();
    const tc = t(language, "misc");
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getSavingsData().then(d => { setData(d); setLoading(false); });
    }, []);

    const fmt = (val: number) => formatCurrencyByCode(val, 'INR');
    const fmtCompact = (val: number) => {
        if (Math.abs(val) >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
        if (Math.abs(val) >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
        if (Math.abs(val) >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
        return `₹${val.toFixed(0)}`;
    };
    const shortSupplierLabel = (value: string) => value.length > 16 ? `${value.slice(0, 16)}…` : value;

    const exportCSV = () => {
        if (!data) return;
        downloadCsvFile(`axiom_savings_${new Date().toISOString().split('T')[0]}.csv`, [
            ['Metric', 'Value'],
            ['Total Negotiated Savings', data.totalNegotiatedSavings],
            ['Total Actual Spend', data.totalActualSpend],
            ['Savings Rate (%)', data.savingsRate],
            ['Orders with Savings', data.ordersWithSavings],
            [],
            ['Savings by Supplier'],
            ['Supplier', 'Spend', 'Savings'],
            ...(data.savingsBySupplier || []).map((row: any) => [row.supplierName, row.spend, row.savings]),
            [],
            ['Savings Trend'],
            ['Month', 'Spend', 'Savings'],
            ...(data.savingsTrend || []).map((row: any) => [row.month, row.spend, row.savings]),
        ]);
            toast.success(tc.savingsReportExported);
    };

    if (loading) return (
        <div className="flex h-[80vh] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
    );

    if (!data) return         <div className="p-8 text-muted-foreground">{tc.failedToLoadSavings}</div>;

    return (
        <div className="flex min-h-full flex-col bg-muted/40 p-4 lg:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                            <PiggyBank className="h-8 w-8 text-emerald-600" /> {tc.savingsTitle}
                        </h1>
                        <p className="text-muted-foreground mt-1 font-medium">
                            {tc.savingsSubtitle}
                        </p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Button variant="outline" onClick={exportCSV} className="gap-2"><Download className="h-4 w-4" /> {tc.export}</Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-emerald-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">{tc.totalSavings}</CardTitle>
                        <TrendingDown className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-emerald-700">{fmt(data.totalNegotiatedSavings)}</div>
                        <p className="text-xs text-muted-foreground mt-1">{tc.negotiatedBelowQuote}</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">{tc.actualSpend}</CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">{fmt(data.totalActualSpend)}</div>
                        <p className="text-xs text-muted-foreground mt-1">{tc.totalProcurementSpend}</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-amber-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">{tc.savingsRate}</CardTitle>
                        <Target className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-amber-700">{data.savingsRate}%</div>
                        <p className="text-xs text-muted-foreground mt-1">{tc.ofTotalProcurementValue}</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-violet-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">{tc.ordersWithSavings}</CardTitle>
                        <Award className="h-4 w-4 text-violet-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">{data.ordersWithSavings}</div>
                        <p className="text-xs text-muted-foreground mt-1">{tc.ordersWithNegotiatedSavings}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                {/* Savings by Supplier */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">{tc.topSavingsBySupplier}</CardTitle>
                        <CardDescription>{tc.spendVsSavings}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.savingsBySupplier?.slice(0, 10) || []} margin={{ top: 34, right: 20, bottom: 72, left: 18 }} barGap={8}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis
                                    dataKey="supplierName"
                                    angle={-28}
                                    height={68}
                                    interval={0}
                                    textAnchor="end"
                                    tickMargin={12}
                                    tick={{ fontSize: 12, fontWeight: 600 }}
                                    tickFormatter={shortSupplierLabel}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    width={84}
                                    tick={{ fontSize: 12, fontWeight: 600 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v) => fmtCompact(Number(v))}
                                />
                                <Tooltip formatter={(v: any) => fmt(Number(v))} />
                                <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 13, fontWeight: 600, paddingBottom: 8 }} />
                                {data.savingsBySupplier?.[0]?.spend !== undefined && (
                                    <Bar dataKey="spend" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="Spend" />
                                )}
                                <Bar dataKey="savings" fill="#10b981" radius={[4, 4, 0, 0]} name="Savings" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Savings Trend */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">{tc.monthlySavingsTrend}</CardTitle>
                        <CardDescription>{tc.savingsTrajectory}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={data.savingsTrend || []} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
                                <defs>
                                    <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fontWeight: 600 }} tickMargin={10} axisLine={false} tickLine={false} />
                                <YAxis width={84} tick={{ fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={(v) => fmtCompact(Number(v))} />
                                <Tooltip formatter={(v: any) => fmt(Number(v))} />
                                <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 13, fontWeight: 600, paddingBottom: 8 }} />
                                <Area type="monotone" dataKey="savings" stroke="#10b981" fill="url(#savingsGrad)" strokeWidth={2.5} name="Savings" dot={{ r: 3, fill: '#10b981' }} />
                                {data.savingsTrend?.[0]?.spend !== undefined && (
                                    <Area type="monotone" dataKey="spend" stroke="#3b82f6" fill="url(#spendGrad)" strokeWidth={1.5} strokeDasharray="5 5" name="Spend" />
                                )}
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Savings by Type */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">{tc.savingsByType}</CardTitle>
                        <CardDescription>{tc.negotiationVolumeStrategic}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={data.savingsByType || []} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" nameKey="type" label={(entry: any) => `${entry?.type || 'Type'} ${((entry?.percent || 0) * 100).toFixed(0)}%`} labelLine={false}>
                                    {(data.savingsByType || []).map((_: any, i: number) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v: any) => fmt(Number(v))} />
                                <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 13, fontWeight: 600, paddingTop: 8 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Top Savings Orders Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">{tc.topSavingsTransactions}</CardTitle>
                        <CardDescription>{tc.highestNegotiatedSavings}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 max-h-[260px] overflow-y-auto">
                            {(data.topSavingsOrders || []).slice(0, 10).map((order: any, i: number) => (
                                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-black text-muted-foreground w-6">#{i + 1}</span>
                                        <div>
                                            <p className="text-sm font-bold">{order.supplierName || 'N/A'}</p>
                                            <p className="text-xs text-muted-foreground">{order.savingsType || 'negotiation'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-emerald-700">{fmt(Number(order.savingsAmount || 0))}</p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                                            <ArrowDownRight className="h-3 w-3 text-emerald-600" />
                                            {order.savingsRate?.toFixed(1) || '0'}% saved
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {(!data.topSavingsOrders || data.topSavingsOrders.length === 0) && (
                                <p className="text-center text-muted-foreground italic py-8">{tc.noSavingsData}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
