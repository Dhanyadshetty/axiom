'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
    ChevronRight,
    ChevronDown,
    Calendar,
    Bookmark,
    Plus,
    X,
    Filter,
    ArrowLeft,
    Check,
    Download,
    Share2,
    BarChart3,
    TrendingUp,
    Truck,
    Coins,
    Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { AnalyticsReportType, AnalyticsTabType, OtherEntityType } from './types';
import { saveCustomView } from '@/app/actions/analytics';

interface ReportShellProps {
    reportType: AnalyticsReportType;
    activeTab: AnalyticsTabType;
    onTabChange?: (tab: AnalyticsTabType) => void;
    otherEntity?: OtherEntityType;
    onOtherEntityChange?: (entity: OtherEntityType) => void;
    children: React.ReactNode;
}

const REPORT_NAV_ITEMS = [
    { id: 'kpi-analysis', label: 'KPI Analysis', href: '/analytics/kpi-analysis', icon: BarChart3 },
    { id: 'price-development', label: 'Price Development', href: '/analytics/price-development', icon: TrendingUp },
    { id: 'delivery-reports', label: 'Delivery Reports', href: '/analytics/delivery-reports', icon: Truck },
    { id: 'currency-reports', label: 'Currency Reports', href: '/analytics/currency-reports', icon: Coins },
];

export function ReportShell({
    reportType,
    activeTab,
    onTabChange,
    otherEntity = 'incoterms',
    onOtherEntityChange,
    children,
}: ReportShellProps) {
    const router = useRouter();
    const pathname = usePathname();

    // Controls state
    const [currency, setCurrency] = useState<'EUR' | 'USD' | 'INR' | 'GBP' | 'CHF'>('EUR');
    const [metricBasis, setMetricBasis] = useState<'Invoices' | 'Purchase Orders' | 'Goods Receipts'>('Invoices');
    const [dateRange, setDateRange] = useState('2026 - 2022');
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [viewName, setViewName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Active Filter Pills
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [supplierFilter, setSupplierFilter] = useState('all');
    const [articleFilter, setArticleFilter] = useState('all');
    const [extraFilters, setExtraFilters] = useState<Array<{ key: string; label: string; value: string }>>([]);

    const getReportTitle = (type: AnalyticsReportType) => {
        switch (type) {
            case 'kpi-analysis': return 'KPI Analysis';
            case 'price-development': return 'Price Development';
            case 'delivery-reports': return 'Delivery Reports';
            case 'currency-reports': return 'Currency Reports';
            default: return 'KPI Analysis';
        }
    };

    const handleSaveCustomView = async () => {
        if (!viewName.trim()) {
            toast.error('Please enter a view name');
            return;
        }
        setIsSaving(true);
        try {
            await saveCustomView({
                name: viewName.trim(),
                reportType,
                filters: {
                    currency,
                    metricBasis,
                    dateRange,
                    category: categoryFilter,
                    supplier: supplierFilter,
                    article: articleFilter,
                },
            });
            toast.success('Custom view saved successfully');
            setSaveDialogOpen(false);
            setViewName('');
        } catch {
            toast.error('Failed to save custom view');
        }
        setIsSaving(false);
    };

    const addExtraFilter = (key: string, label: string, value: string) => {
        if (!extraFilters.some(f => f.key === key)) {
            setExtraFilters([...extraFilters, { key, label, value }]);
            toast.success(`Filter added: ${label}`);
        }
    };

    const removeExtraFilter = (key: string) => {
        setExtraFilters(extraFilters.filter(f => f.key !== key));
    };

    return (
        <div className="flex flex-col min-h-full bg-[#f8fafc] dark:bg-background text-foreground">
            {/* ── Top Bar / Header ── */}
            <header className="sticky top-0 z-20 border-b border-border/80 bg-background/95 backdrop-blur px-4 lg:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm">
                    <Link
                        href="/analytics"
                        className="text-muted-foreground hover:text-foreground font-medium transition-colors flex items-center gap-1.5"
                    >
                        Analytics
                    </Link>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                    <span className="font-semibold text-foreground">{getReportTitle(reportType)}</span>
                </div>

                {/* Top Right Controls */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Currency Selector */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 text-xs font-semibold gap-1.5 rounded-md border-border/80 bg-background hover:bg-muted/60">
                                <span className="text-muted-foreground font-normal">Currency:</span>
                                <span>{currency}</span>
                                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                            {(['EUR', 'USD', 'INR', 'GBP', 'CHF'] as const).map((curr) => (
                                <DropdownMenuItem
                                    key={curr}
                                    onClick={() => setCurrency(curr)}
                                    className="text-xs justify-between font-medium cursor-pointer"
                                >
                                    {curr}
                                    {currency === curr && <Check className="h-3.5 w-3.5 text-primary" />}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Metric / Basis Selector */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 text-xs font-semibold gap-1.5 rounded-md border-border/80 bg-background hover:bg-muted/60">
                                <span>{metricBasis}</span>
                                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                            {(['Invoices', 'Purchase Orders', 'Goods Receipts'] as const).map((metric) => (
                                <DropdownMenuItem
                                    key={metric}
                                    onClick={() => setMetricBasis(metric)}
                                    className="text-xs justify-between font-medium cursor-pointer"
                                >
                                    {metric}
                                    {metricBasis === metric && <Check className="h-3.5 w-3.5 text-primary" />}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Date Range Selector */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 text-xs font-semibold gap-1.5 rounded-md border-border/80 bg-background hover:bg-muted/60">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>{dateRange}</span>
                                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel className="text-[11px] text-muted-foreground">Select Timeframe</DropdownMenuLabel>
                            {['2026 - 2022', '2026 YTD', '2025 Full Year', '2024 Full Year', 'Last 12 Months', 'Last 3 Years'].map((r) => (
                                <DropdownMenuItem
                                    key={r}
                                    onClick={() => setDateRange(r)}
                                    className="text-xs justify-between font-medium cursor-pointer"
                                >
                                    {r}
                                    {dateRange === r && <Check className="h-3.5 w-3.5 text-primary" />}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Save Custom View Button */}
                    <Button
                        size="sm"
                        onClick={() => setSaveDialogOpen(true)}
                        className="h-8 text-xs font-semibold gap-1.5 bg-foreground text-background hover:bg-foreground/90 rounded-md shadow-sm px-3"
                    >
                        Save
                    </Button>
                </div>
            </header>

            {/* ── Filter Bar ── */}
            <div className="border-b border-border/70 bg-background px-4 lg:px-8 py-2.5 flex flex-wrap items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Category Filter Pill */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/80 bg-muted/30 hover:bg-muted/60 text-xs font-medium text-foreground transition-colors cursor-pointer">
                                <span className="text-muted-foreground">Category</span>
                                <span className="text-muted-foreground font-normal">is one of</span>
                                <span className="font-semibold">{categoryFilter}</span>
                                <ChevronDown className="h-3 w-3 opacity-60" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                            <DropdownMenuItem onClick={() => setCategoryFilter('all')} className="text-xs">
                                All Categories {categoryFilter === 'all' && '✓'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {['Electronic Components & ICs', 'Raw Materials & Metals', 'Mechanical Fasteners', 'Plastics & Polymers', 'Wiring & Connectors'].map(cat => (
                                <DropdownMenuItem key={cat} onClick={() => setCategoryFilter(cat)} className="text-xs">
                                    {cat} {categoryFilter === cat && '✓'}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <span className="text-xs text-muted-foreground/70 font-medium px-0.5">and</span>

                    {/* Supplier Filter Pill */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/80 bg-muted/30 hover:bg-muted/60 text-xs font-medium text-foreground transition-colors cursor-pointer">
                                <span className="text-muted-foreground">Supplier</span>
                                <span className="text-muted-foreground font-normal">is one of</span>
                                <span className="font-semibold">{supplierFilter}</span>
                                <ChevronDown className="h-3 w-3 opacity-60" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                            <DropdownMenuItem onClick={() => setSupplierFilter('all')} className="text-xs">
                                All Suppliers {supplierFilter === 'all' && '✓'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {['Bosch Sensortec GmbH', 'TE Connectivity Ltd', 'Infineon Technologies AG', 'Würth Elektronik', 'Phoenix Contact'].map(s => (
                                <DropdownMenuItem key={s} onClick={() => setSupplierFilter(s)} className="text-xs">
                                    {s} {supplierFilter === s && '✓'}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <span className="text-xs text-muted-foreground/70 font-medium px-0.5">and</span>

                    {/* Article Filter Pill */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/80 bg-muted/30 hover:bg-muted/60 text-xs font-medium text-foreground transition-colors cursor-pointer">
                                <span className="text-muted-foreground">Article</span>
                                <span className="text-muted-foreground font-normal">is one of</span>
                                <span className="font-semibold">{articleFilter}</span>
                                <ChevronDown className="h-3 w-3 opacity-60" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-64">
                            <DropdownMenuItem onClick={() => setArticleFilter('all')} className="text-xs">
                                All Articles {articleFilter === 'all' && '✓'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {['ART-994821 - Microcontroller MCU', 'ART-883920 - Wire Harness', 'ART-772810 - CNC Aluminum Housing', 'ART-661701 - Capacitor SMD'].map(art => (
                                <DropdownMenuItem key={art} onClick={() => setArticleFilter(art.split(' - ')[0])} className="text-xs">
                                    {art} {articleFilter === art.split(' - ')[0] && '✓'}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Extra active filters */}
                    {extraFilters.map(filter => (
                        <span key={filter.key} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-xs font-medium text-foreground">
                            <span className="text-muted-foreground">{filter.label}</span>
                            <span className="font-semibold">{filter.value}</span>
                            <button onClick={() => removeExtraFilter(filter.key)} className="hover:text-red-500 transition-colors ml-0.5">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}

                    {/* Add Filter Button */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-dashed border-border/90 hover:border-foreground/60 text-xs font-semibold text-foreground transition-colors cursor-pointer">
                                <Plus className="h-3.5 w-3.5" />
                                Add filter
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-52">
                            <DropdownMenuLabel className="text-[11px] text-muted-foreground">Add Dimension Filter</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => addExtraFilter('plant', 'Plant', 'Plant 01 - Pfullingen')} className="text-xs">
                                Plant / Facility
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => addExtraFilter('incoterm', 'Incoterm', 'DDP (Duty Paid)')} className="text-xs">
                                Incoterms
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => addExtraFilter('paymentTerm', 'Payment Term', '60 Days Net')} className="text-xs">
                                Payment Terms
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => addExtraFilter('country', 'Country', 'Germany (DE)')} className="text-xs">
                                Country / Region
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => addExtraFilter('status', 'Status', 'Active Only')} className="text-xs">
                                Status
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* ── Entity Sub-Navigation Tabs ── */}
            <div className="border-b border-border/70 bg-background px-4 lg:px-8 flex items-center gap-2 overflow-x-auto">
                <button
                    type="button"
                    onClick={() => onTabChange?.('overview')}
                    className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                        activeTab === 'overview'
                            ? 'border-primary text-primary font-bold bg-primary/5'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                >
                    <BarChart3 className="h-3.5 w-3.5" />
                    Overview
                </button>
                <button
                    type="button"
                    onClick={() => onTabChange?.('categories')}
                    className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                        activeTab === 'categories'
                            ? 'border-primary text-primary font-bold bg-primary/5'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                >
                    Categories
                </button>
                <button
                    type="button"
                    onClick={() => onTabChange?.('suppliers')}
                    className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                        activeTab === 'suppliers'
                            ? 'border-primary text-primary font-bold bg-primary/5'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                >
                    Suppliers
                </button>
                <button
                    type="button"
                    onClick={() => onTabChange?.('articles')}
                    className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                        activeTab === 'articles'
                            ? 'border-primary text-primary font-bold bg-primary/5'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                >
                    Articles
                </button>

                {/* Other entities Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                                activeTab === 'other'
                                    ? 'border-primary text-primary font-bold bg-primary/5'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <span>Other entities</span>
                            {activeTab === 'other' && <span className="capitalize font-bold text-primary">({otherEntity.replace('-', ' ')})</span>}
                            <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                        <DropdownMenuItem
                            onClick={() => {
                                onTabChange?.('other');
                                onOtherEntityChange?.('incoterms');
                            }}
                            className="text-xs font-medium cursor-pointer"
                        >
                            Incoterms
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => {
                                onTabChange?.('other');
                                onOtherEntityChange?.('payment-terms');
                            }}
                            className="text-xs font-medium cursor-pointer"
                        >
                            Payment Terms
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => {
                                onTabChange?.('other');
                                onOtherEntityChange?.('plants');
                            }}
                            className="text-xs font-medium cursor-pointer"
                        >
                            Plants & Facilities
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => {
                                onTabChange?.('other');
                                onOtherEntityChange?.('countries');
                            }}
                            className="text-xs font-medium cursor-pointer"
                        >
                            Countries & Regions
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* ── Main Content Area: Left Reports Sub-Sidebar + Right Content ── */}
            <div className="flex-1 flex flex-col md:flex-row min-h-0">
                {/* Sub-Sidebar Reports Navigation */}
                <aside className="w-full md:w-56 lg:w-60 border-b md:border-b-0 md:border-r border-border/80 bg-background/50 p-4 space-y-4 shrink-0">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-2">
                            Reports
                        </p>
                        <nav className="space-y-1">
                            {REPORT_NAV_ITEMS.map((item) => {
                                const isActive = reportType === item.id;
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                                            isActive
                                                ? 'bg-muted text-foreground shadow-sm font-bold border border-border/60'
                                                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                                        }`}
                                    >
                                        <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                {/* Right Content View */}
                <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
                    {children}
                </main>
            </div>

            {/* ── Save Custom View Dialog ── */}
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Save Custom View</DialogTitle>
                        <DialogDescription className="text-xs">
                            Save current report configuration, timeframe, and filter set for quick one-click access.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-foreground">View Name</label>
                            <Input
                                placeholder="e.g. Q1 2026 Strategic Supplier Spend"
                                value={viewName}
                                onChange={(e) => setViewName(e.target.value)}
                                className="text-xs"
                                autoFocus
                            />
                        </div>
                        <div className="rounded-lg bg-muted/50 p-3 text-xs space-y-1 text-muted-foreground">
                            <p className="font-semibold text-foreground">Applied Settings:</p>
                            <p>• Report: <span className="font-medium text-foreground">{getReportTitle(reportType)}</span></p>
                            <p>• Currency: <span className="font-medium text-foreground">{currency}</span> ({metricBasis})</p>
                            <p>• Timeframe: <span className="font-medium text-foreground">{dateRange}</span></p>
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" size="sm" onClick={() => setSaveDialogOpen(false)} className="text-xs">
                            Cancel
                        </Button>
                        <Button size="sm" onClick={handleSaveCustomView} disabled={isSaving} className="text-xs">
                            {isSaving ? 'Saving...' : 'Save View'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
