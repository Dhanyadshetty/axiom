'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    BarChart3,
    TrendingUp,
    Truck,
    Search,
    MoreVertical,
    Sparkles,
    Users,
    FileText,
    ExternalLink,
    Copy,
    Trash2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { getSavedCustomViews, deleteCustomView } from '@/app/actions/analytics';
import { SavedCustomView } from '@/components/analytics/types';

export function AnalyticsHubView() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [views, setViews] = useState<SavedCustomView[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortAsc, setSortAsc] = useState(true);

    useEffect(() => {
        getSavedCustomViews().then((res) => {
            setViews((res || []) as unknown as SavedCustomView[]);
            setLoading(false);
        });
    }, []);

    const filteredViews = useMemo(() => {
        return views
            .filter((v) =>
                v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                v.access.toLowerCase().includes(searchQuery.toLowerCase()) ||
                v.createdBy.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .sort((a, b) => (sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
    }, [views, searchQuery, sortAsc]);

    const handleDelete = async (id: string, name: string) => {
        try {
            await deleteCustomView(id);
            setViews(views.filter((v) => v.id !== id));
            toast.success(`Deleted view "${name}"`);
        } catch {
            toast.error('Failed to delete view');
        }
    };

    const handleCopyLink = (v: SavedCustomView) => {
        const url = `${window.location.origin}/analytics/${v.reportType}`;
        navigator.clipboard.writeText(url);
        toast.success('Report link copied to clipboard');
    };

    return (
        <div className="flex flex-col min-h-full bg-background p-6 lg:p-10 max-w-7xl mx-auto space-y-10">
            {/* ── Page Title ── */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Analytics</h1>
            </div>

            {/* ── Section 1: Reports ── */}
            <section className="space-y-4">
                <div>
                    <h2 className="text-base font-bold text-foreground">Reports</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Explore your organization's data from different angles.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Card 1: KPI Analysis */}
                    <Link
                        href="/analytics/kpi-analysis"
                        className="group block"
                    >
                        <Card className="rounded-xl border border-border/80 bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer h-full">
                            <CardContent className="p-5 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                    <BarChart3 className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                                        KPI Analysis
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                        Follow core procurement metrics
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Card 2: Price Development */}
                    <Link
                        href="/analytics/price-development"
                        className="group block"
                    >
                        <Card className="rounded-xl border border-border/80 bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer h-full">
                            <CardContent className="p-5 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                    <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">€</span>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                                        Price Development
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                        Track price changes
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Card 3: Delivery Reports */}
                    <Link
                        href="/analytics/delivery-reports"
                        className="group block"
                    >
                        <Card className="rounded-xl border border-border/80 bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer h-full">
                            <CardContent className="p-5 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-orange-50 dark:bg-orange-950/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                    <Truck className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                                        Delivery Reports
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                        Track delivery performance and relia...
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </section>

            {/* ── Section 2: Custom Views ── */}
            <section className="space-y-4 pt-2">
                <div>
                    <h2 className="text-base font-bold text-foreground">Custom Views</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Quick access to saved report filters.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 text-xs rounded-lg border-border/80 bg-background"
                    />
                </div>

                {/* Custom Views Table */}
                <Card className="rounded-xl border border-border/70 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-muted/30 border-b border-border text-muted-foreground font-semibold text-[11px]">
                                <tr>
                                    <th
                                        onClick={() => setSortAsc(!sortAsc)}
                                        className="px-6 py-3.5 cursor-pointer select-none hover:text-foreground transition-colors"
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <span>Name</span>
                                            <span className="text-[10px] text-muted-foreground">{sortAsc ? '↑' : '↓'}</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-3.5">Access</th>
                                    <th className="px-6 py-3.5">
                                        <div className="flex items-center gap-1.5">
                                            <Users className="h-3.5 w-3.5 text-muted-foreground/70" />
                                            <span>Created by</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-3.5">Last updated</th>
                                    <th className="px-4 py-3.5 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60 font-medium">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                            Loading saved views...
                                        </td>
                                    </tr>
                                ) : filteredViews.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                            No custom views found matching your search.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredViews.map((view) => (
                                        <tr
                                            key={view.id}
                                            onClick={() => router.push(`/analytics/${view.reportType}`)}
                                            className="hover:bg-muted/40 transition-colors cursor-pointer group"
                                        >
                                            <td className="px-6 py-3.5 font-medium text-foreground group-hover:text-primary transition-colors">
                                                {view.name}
                                            </td>
                                            <td className="px-6 py-3.5 text-muted-foreground">
                                                <div className="flex items-center gap-1.5">
                                                    <FileText className="h-3.5 w-3.5 opacity-60" />
                                                    <span>{view.access}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3.5 text-muted-foreground">
                                                <div className="flex items-center gap-1.5">
                                                    <Sparkles className="h-3.5 w-3.5 text-orange-500 fill-orange-500" />
                                                    <span className="font-semibold text-foreground/80">{view.createdBy}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3.5 text-muted-foreground">
                                                {view.lastUpdated}
                                            </td>
                                            <td
                                                className="px-4 py-3.5 text-right"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-muted-foreground hover:text-foreground opacity-60 group-hover:opacity-100"
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-40">
                                                        <DropdownMenuItem
                                                            onClick={() => router.push(`/analytics/${view.reportType}`)}
                                                            className="text-xs cursor-pointer gap-2"
                                                        >
                                                            <ExternalLink className="h-3.5 w-3.5" />
                                                            Open View
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleCopyLink(view)}
                                                            className="text-xs cursor-pointer gap-2"
                                                        >
                                                            <Copy className="h-3.5 w-3.5" />
                                                            Copy Link
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(view.id, view.name)}
                                                            className="text-xs cursor-pointer gap-2 text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                            Delete View
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </section>
        </div>
    );
}
