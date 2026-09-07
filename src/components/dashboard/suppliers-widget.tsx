"use client";

import * as React from "react";
import Link from "next/link";
import { Settings, Users, ArrowUpRight, Loader } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SuppliersWidgetProps {
    totalSuppliers: number;
    byStatus: Array<{ label: string; value: number; color: string }>;
    byAbc: Array<{ label: string; value: number; color: string }>;
    byCountry: Array<{ label: string; value: number }>;
    canManage: boolean;
}

export function SuppliersWidget({
    totalSuppliers,
    byStatus,
    byAbc,
    byCountry,
    canManage,
}: SuppliersWidgetProps) {
    const maxCountry = byCountry.reduce((m, c) => Math.max(m, c.value), 0);

    return (
        <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
                <div>
                    <CardTitle className="flex items-center gap-2 text-base font-black tracking-tight">
                        <Users className="h-4 w-4 text-primary" />
                        Suppliers
                    </CardTitle>
                    <CardDescription>
                        Network overview across {totalSuppliers.toLocaleString("en-US")}{" "}
                        suppliers
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
                        {totalSuppliers.toLocaleString("en-US")}
                    </Badge>
                    {canManage ? (
                        <Link
                            href="/suppliers/views/classification/settings"
                            aria-label="Manage Suppliers"
                            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                            <Settings className="h-4 w-4" />
                        </Link>
                    ) : null}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-3xl font-black text-slate-950">
                    {totalSuppliers.toLocaleString("en-US")}
                    <span className="ml-2 text-sm font-medium text-slate-500">total</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                            ABC classification
                        </p>
                        <div className="space-y-1">
                            {byAbc.map((row) => (
                                <div
                                    key={row.label}
                                    className="flex items-center justify-between text-sm"
                                >
                                    <span className="flex items-center gap-2">
                                        <span
                                            className={cn(
                                                "inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-black",
                                                row.color,
                                            )}
                                        >
                                            {row.label}
                                        </span>
                                        <span className="text-slate-700">{row.label}</span>
                                    </span>
                                    <span className="font-semibold tabular-nums text-slate-900">
                                        {row.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                            Status
                        </p>
                        <div className="space-y-1">
                            {byStatus.slice(0, 4).map((row) => (
                                <div
                                    key={row.label}
                                    className="flex items-center justify-between text-sm"
                                >
                                    <span className="text-slate-700">{row.label}</span>
                                    <span className="font-semibold tabular-nums text-slate-900">
                                        {row.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {byCountry.length > 0 ? (
                    <div>
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                            Top countries
                        </p>
                        <div className="space-y-1">
                            {byCountry.slice(0, 4).map((row) => (
                                <div
                                    key={row.label}
                                    className="flex items-center gap-2 text-sm"
                                >
                                    <span className="w-20 truncate text-slate-700">
                                        {row.label}
                                    </span>
                                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className="h-full bg-primary"
                                            style={{
                                                width: `${Math.max(2, (row.value / maxCountry) * 100)}%`,
                                            }}
                                        />
                                    </div>
                                    <span className="w-10 text-right font-semibold tabular-nums text-slate-900">
                                        {row.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}

                <div className="flex gap-2 border-t border-slate-100 pt-3">
                    <Link href="/suppliers" className="flex-1">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-between"
                        >
                            View all
                            <ArrowUpRight className="h-4 w-4" />
                        </Button>
                    </Link>
                    {canManage ? (
                        <Link href="/suppliers/views/classification/settings">
                            <Button size="sm" className="gap-2">
                                <Settings className="h-4 w-4" />
                                Manage
                            </Button>
                        </Link>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
}

export function SuppliersWidgetSkeleton() {
    return (
        <Card className="border-slate-200 shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Loader className="h-4 w-4 animate-spin text-slate-400" />
                    Suppliers
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-slate-400">Loading supplier overview…</p>
            </CardContent>
        </Card>
    );
}