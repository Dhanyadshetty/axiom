'use client';

import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Truck, CheckCircle2, AlertTriangle, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { DeliveryReportsData } from './types';
import { downloadCsvFile } from '@/lib/client/download';
import { toast } from 'sonner';

interface DeliveryReportsViewProps {
    data: DeliveryReportsData;
}

export function DeliveryReportsView({ data }: DeliveryReportsViewProps) {
    const handleDownloadCSV = () => {
        const rows = [
            ['Supplier', 'OTIF Rate (%)', 'Avg Delay (Days)', 'Orders Delivered', 'Risk Level', 'Status'],
            ...data.supplierDeliveryPerformance.map(s => [s.name, s.otifRate, s.avgDelayDays, s.ordersDelivered, s.riskLevel, s.status]),
        ];
        downloadCsvFile('delivery_performance_report.csv', rows);
        toast.success('Delivery performance report downloaded');
    };

    return (
        <div className="space-y-6">
            {/* ── 4 KPI Metrics for Delivery ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="rounded-xl border border-border/70 p-4">
                    <div className="text-xs text-muted-foreground font-semibold mb-1">On-Time In-Full (OTIF) Rate</div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-foreground">{data.otifRate}%</span>
                        <span className="inline-flex items-center text-xs font-bold text-emerald-600">
                            +{data.otifChange}%
                        </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1">vs {data.priorOtifRate}% prior period</div>
                </Card>

                <Card className="rounded-xl border border-border/70 p-4">
                    <div className="text-xs text-muted-foreground font-semibold mb-1">Average Delay</div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-foreground">{data.averageDelayDays} Days</span>
                        <span className="inline-flex items-center text-xs font-bold text-emerald-600">
                            {data.delayChange}%
                        </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1">Down from {data.priorAverageDelayDays} days</div>
                </Card>

                <Card className="rounded-xl border border-border/70 p-4">
                    <div className="text-xs text-muted-foreground font-semibold mb-1">Delivered Orders</div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-foreground">{data.deliveredOrdersCount.toLocaleString()}</span>
                        <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30 text-[10px]">Active</Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1">Fulfilled across all plants</div>
                </Card>

                <Card className="rounded-xl border border-border/70 p-4">
                    <div className="text-xs text-muted-foreground font-semibold mb-1">Quantity Discrepancy Rate</div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-foreground">{data.discrepancyRate}%</span>
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">Low Risk</Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1">Goods receipt vs invoice matching</div>
                </Card>
            </div>

            {/* ── Delivery Performance Over Time Chart ── */}
            <Card className="rounded-xl border border-border/70 p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-bold text-foreground">OTIF Fulfillment Rate Trajectory (%)</h3>
                        <p className="text-xs text-muted-foreground">Monthly adherence to agreed delivery windows</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleDownloadCSV} className="text-xs gap-1.5">
                        <Download className="h-3.5 w-3.5" /> Export Data
                    </Button>
                </div>

                <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
                        <AreaChart data={data.deliveryTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="otifGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.6)" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                            <YAxis domain={[85, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 11 }} unit="%" />
                            <Tooltip />
                            <Area type="monotone" dataKey="otifRate" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#otifGradient)" name="OTIF Rate (%)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* ── Supplier Delivery Performance Table ── */}
            <Card className="rounded-xl border border-border/70 overflow-hidden">
                <div className="p-4 border-b border-border/70 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-foreground">Supplier Fulfillment Performance</h3>
                        <p className="text-xs text-muted-foreground">Detailed delivery reliability ranking by vendor</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold text-[10px] tracking-wider">
                            <tr>
                                <th className="px-4 py-3">Supplier</th>
                                <th className="px-4 py-3 text-right">OTIF Rate</th>
                                <th className="px-4 py-3 text-right">Avg Delay</th>
                                <th className="px-4 py-3 text-center">Orders Delivered</th>
                                <th className="px-4 py-3 text-center">Risk Level</th>
                                <th className="px-4 py-3 text-center">Operational Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60 font-medium">
                            {data.supplierDeliveryPerformance.map((s) => (
                                <tr key={s.id} className="hover:bg-muted/40 transition-colors">
                                    <td className="px-4 py-3 font-semibold text-foreground">{s.name}</td>
                                    <td className="px-4 py-3 text-right font-bold text-foreground">{s.otifRate}%</td>
                                    <td className="px-4 py-3 text-right text-muted-foreground">{s.avgDelayDays} days</td>
                                    <td className="px-4 py-3 text-center text-muted-foreground">{s.ordersDelivered}</td>
                                    <td className="px-4 py-3 text-center">
                                        <Badge
                                            className={`text-[10px] ${
                                                s.riskLevel === 'low'
                                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                                                    : s.riskLevel === 'medium'
                                                    ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                                                    : 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                                            }`}
                                        >
                                            {s.riskLevel.toUpperCase()}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-center font-medium text-foreground">{s.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
