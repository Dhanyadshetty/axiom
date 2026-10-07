'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import * as XLSX from 'xlsx';
import {
    ArrowLeft,
    MoreVertical,
    Trash2,
    Tag,
    Type,
    Scale,
    Ruler,
    AlignLeft,
    ExternalLink,
    ChevronDown,
    Search,
    Plus,
    Filter,
    Columns,
    Check,
    Loader2,
    CheckCircle2,
    XCircle,
    Layers,
    Building2,
    FileText,
    ArrowLeftRight,
    BadgePercent,
    Receipt,
    Maximize2,
    X,
    Lightbulb,
    Coins,
    Download,
    ShoppingCart,
    Truck,
    ReceiptText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import type { ArticleItem } from './articles-schema';
import {
    deleteArticle,
    updateArticleLongText,
    getArticleSuppliers,
    getArticleSavingsFindings,
    getArticleSavingsOpportunities,
    type ArticleSupplierItem,
    type SavingsFindingItem,
    type SavingsOpportunityItem,
} from '@/app/actions/articles';
import { toast } from 'sonner';
import {
    ResponsiveContainer,
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from 'recharts';

interface ArticleDetailViewProps {
    article: ArticleItem;
}

type TabType = 'overview' | 'suppliers' | 'rfqs' | 'requests' | 'transactions' | 'savings';
type SavingsSubTab = 'findings' | 'opportunities';
type FindingsStatus = 'open' | 'accepted' | 'dismissed';

const SUPPLIER_COLUMNS: Array<{ key: string; label: string }> = [
    { key: 'supplier', label: 'Supplier' },
    { key: 'originCountry', label: 'Origin country' },
    { key: 'lastOrder', label: 'Last Order' },
    { key: 'lastDelivery', label: 'Last Delivery' },
    { key: 'lastUpdatedAt', label: 'Last updated at' },
    { key: 'erpCreatedAt', label: 'ERP created at' },
    { key: 'supplierArticleNo', label: 'Supplier article no' },
    { key: 'erpReferenceNo', label: 'ERP reference no' },
    { key: 'createdAt', label: 'Created at' },
    { key: 'complianceNotes', label: 'Compliance notes' },
    { key: 'casNumber', label: 'CAS Number' },
    { key: 'scipNumber', label: 'SCIP Number' },
    { key: 'svhcIncluded', label: 'SVHC included' },
    { key: 'pfasAffected', label: 'PFAS affected' },
    { key: 'rohsAffected', label: 'RoHS affected' },
    { key: 'annexXIV', label: 'Annex XIV' },
    { key: 'popsAffected', label: 'POPs affected' },
    { key: 'reachAffected', label: 'REACH affected' },
    { key: 'annexXVII', label: 'Annex XVII' },
];

const FINDINGS_COLUMNS: Array<{ key: string; label: string }> = [
    { key: 'type', label: 'Type' },
    { key: 'createdAt', label: 'Created at' },
    { key: 'potential', label: 'Potential' },
    { key: 'opportunities', label: 'Opportunities' },
    { key: 'articles', label: 'Articles' },
    { key: 'categories', label: 'Categories' },
    { key: 'suppliers', label: 'Suppliers' },
    { key: 'buyers', label: 'Buyers' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'note', label: 'Note' },
    { key: 'analysisDate', label: 'Analysis date' },
];

const OPPORTUNITY_COLUMNS: Array<{ key: string; label: string }> = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    { key: 'status', label: 'Status' },
    { key: 'startDate', label: 'Start date' },
    { key: 'endDate', label: 'End date' },
    { key: 'effect', label: 'Effect' },
    { key: 'savingAmount', label: 'Saving amount' },
];

export function ArticleDetailView({ article: initialArticle }: ArticleDetailViewProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeTabFromUrl = (searchParams.get('tab') as TabType) || 'overview';
    const activeViewFromUrl = (searchParams.get('view') as SavingsSubTab) || 'findings';

    const [article, setArticle] = React.useState<ArticleItem>(initialArticle);
    const [activeTab, setActiveTab] = React.useState<TabType>(activeTabFromUrl);
    const [savingsSubTab, setSavingsSubTab] = React.useState<SavingsSubTab>(activeViewFromUrl);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);

    // Long text inline edit state
    const [isEditingLongText, setIsEditingLongText] = React.useState(false);
    const [longTextValue, setLongTextValue] = React.useState(article.longText || '');
    const [isSavingLongText, setIsSavingLongText] = React.useState(false);

    // Suppliers Tab State
    const [suppliersList, setSuppliersList] = React.useState<ArticleSupplierItem[]>([]);
    const [loadingSuppliers, setLoadingSuppliers] = React.useState(false);
    const [supplierSearch, setSupplierSearch] = React.useState('');
    const [selectedSupplierIds, setSelectedSupplierIds] = React.useState<Set<string>>(new Set());
    const [visibleSupplierCols, setVisibleSupplierCols] = React.useState<Set<string>>(
        () => new Set(SUPPLIER_COLUMNS.map((c) => c.key))
    );
    const [colSearchQuery, setColSearchQuery] = React.useState('');

    // Savings: Findings Tab State
    const [findingsList, setFindingsList] = React.useState<SavingsFindingItem[]>([]);
    const [loadingFindings, setLoadingFindings] = React.useState(false);
    const [findingsStatus, setFindingsStatus] = React.useState<FindingsStatus>('open');
    const [findingsSearch, setFindingsSearch] = React.useState('');
    const [selectedFindingIds, setSelectedFindingIds] = React.useState<Set<string>>(new Set());
    const [visibleFindingsCols, setVisibleFindingsCols] = React.useState<Set<string>>(
        () => new Set(FINDINGS_COLUMNS.map((c) => c.key))
    );
    const [findingsColSearchQuery, setFindingsColSearchQuery] = React.useState('');

    // Savings: Opportunities Tab State
    const [opportunitiesList, setOpportunitiesList] = React.useState<SavingsOpportunityItem[]>([]);
    const [loadingOpportunities, setLoadingOpportunities] = React.useState(false);
    const [opportunitySearch, setOpportunitySearch] = React.useState('');
    const [selectedOpportunityIds, setSelectedOpportunityIds] = React.useState<Set<string>>(new Set());
    const [visibleOpportunityCols, setVisibleOpportunityCols] = React.useState<Set<string>>(
        () => new Set(OPPORTUNITY_COLUMNS.map((c) => c.key))
    );
    const [opportunityColSearchQuery, setOpportunityColSearchQuery] = React.useState('');

    // Sync tab with URL
    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        const baseUrl = `/articles/${encodeURIComponent(article.articleNumber || article.id)}`;
        if (tab === 'overview') {
            router.replace(baseUrl, { scroll: false });
        } else if (tab === 'savings') {
            router.replace(`${baseUrl}?tab=savings&view=${savingsSubTab}`, { scroll: false });
        } else {
            router.replace(`${baseUrl}?tab=${tab}`, { scroll: false });
        }
    };

    const handleSavingsSubTabChange = (subTab: SavingsSubTab) => {
        setActiveTab('savings');
        setSavingsSubTab(subTab);
        const baseUrl = `/articles/${encodeURIComponent(article.articleNumber || article.id)}`;
        router.replace(`${baseUrl}?tab=savings&view=${subTab}`, { scroll: false });
    };

    // Load Suppliers for Article
    React.useEffect(() => {
        let isMounted = true;
        async function fetchSuppliers() {
            setLoadingSuppliers(true);
            try {
                const res = await getArticleSuppliers(article.articleNumber || article.id);
                if (isMounted && res.success) {
                    setSuppliersList(res.rows);
                }
            } catch (err) {
                console.error(err);
            } finally {
                if (isMounted) setLoadingSuppliers(false);
            }
        }
        fetchSuppliers();
        return () => {
            isMounted = false;
        };
    }, [article.id, article.articleNumber]);

    // Load Savings Findings
    React.useEffect(() => {
        let isMounted = true;
        async function fetchFindings() {
            if (activeTab !== 'savings' || savingsSubTab !== 'findings') return;
            setLoadingFindings(true);
            try {
                const res = await getArticleSavingsFindings(
                    article.articleNumber || article.id,
                    findingsStatus
                );
                if (isMounted && res.success) {
                    setFindingsList(res.rows);
                }
            } catch (err) {
                console.error(err);
            } finally {
                if (isMounted) setLoadingFindings(false);
            }
        }
        fetchFindings();
        return () => {
            isMounted = false;
        };
    }, [article.id, article.articleNumber, activeTab, savingsSubTab, findingsStatus]);

    // Load Savings Opportunities
    React.useEffect(() => {
        let isMounted = true;
        async function fetchOpportunities() {
            if (activeTab !== 'savings' || savingsSubTab !== 'opportunities') return;
            setLoadingOpportunities(true);
            try {
                const res = await getArticleSavingsOpportunities(
                    article.articleNumber || article.id
                );
                if (isMounted && res.success) {
                    setOpportunitiesList(res.rows);
                }
            } catch (err) {
                console.error(err);
            } finally {
                if (isMounted) setLoadingOpportunities(false);
            }
        }
        fetchOpportunities();
        return () => {
            isMounted = false;
        };
    }, [article.id, article.articleNumber, activeTab, savingsSubTab]);

    // Handle Article Delete
    const handleDeleteArticle = async () => {
        setIsDeleting(true);
        try {
            const res = await deleteArticle(article.id || article.articleNumber);
            if (res.success) {
                toast.success(`Article ${article.articleNumber} successfully deleted`);
                setIsDeleteDialogOpen(false);
                router.push('/articles');
            } else {
                toast.error(res.error || 'Failed to delete article');
            }
        } catch {
            toast.error('Unexpected error while deleting article');
        } finally {
            setIsDeleting(false);
        }
    };

    // Handle Save Long Text
    const handleSaveLongText = async () => {
        setIsSavingLongText(true);
        try {
            const res = await updateArticleLongText(article.id || article.articleNumber, longTextValue);
            if (res.success) {
                setArticle((prev) => ({ ...prev, longText: longTextValue || null }));
                setIsEditingLongText(false);
                toast.success('Long text updated');
            } else {
                toast.error(res.error || 'Failed to update long text');
            }
        } catch {
            toast.error('Failed to update long text');
        } finally {
            setIsSavingLongText(false);
        }
    };

    // Price Development Chart Data (reflecting Screenshot 2 with magenta/purple theme)
    const priceChartData = [
        { quarter: "Q1 '24", price: 144.5, quantity: 24000, date: '15.02.2024' },
        { quarter: "Q2 '24", price: 133.0, quantity: 18000, date: '28.05.2024' },
        { quarter: "Q3 '24", price: 133.0, quantity: 19000, date: '14.08.2024' },
        { quarter: "Q4 '24", price: 133.0, quantity: 33000, date: '11.11.2024' },
        { quarter: "Q1 '25", price: 129.92, quantity: 16000, date: '31.01.2025' },
        { quarter: "Q2 '25", price: 129.92, quantity: 16000, date: '15.05.2025' },
        { quarter: "Q3 '25", price: 129.92, quantity: 16000, date: '20.08.2025' },
        { quarter: "Q4 '25", price: 129.92, quantity: 12000, date: '10.11.2025' },
        { quarter: "Q1 '26", price: 129.92, quantity: 12000, date: '18.02.2026' },
        { quarter: "Q2 '26", price: 129.92, quantity: 14000, date: '22.05.2026' },
        { quarter: "Q3 '26", price: 129.92, quantity: 15000, date: '19.08.2026' },
    ];

    // Filtered Suppliers
    const filteredSuppliers = suppliersList.filter((s) => {
        if (!supplierSearch.trim()) return true;
        const q = supplierSearch.toLowerCase().trim();
        return (
            s.name.toLowerCase().includes(q) ||
            s.supplierNumber.toLowerCase().includes(q) ||
            (s.erpReferenceNo && s.erpReferenceNo.toLowerCase().includes(q))
        );
    });

    const toggleSupplierSelection = (id: string, checked: boolean) => {
        setSelectedSupplierIds((prev) => {
            const next = new Set(prev);
            if (checked) next.add(id);
            else next.delete(id);
            return next;
        });
    };

    const toggleAllSuppliers = (checked: boolean) => {
        if (checked) {
            setSelectedSupplierIds(new Set(filteredSuppliers.map((s) => s.id)));
        } else {
            setSelectedSupplierIds(new Set());
        }
    };

    // Filtered Findings
    const filteredFindings = findingsList.filter((f) => {
        if (!findingsSearch.trim()) return true;
        const q = findingsSearch.toLowerCase().trim();
        return (
            f.type.toLowerCase().includes(q) ||
            f.potential.toLowerCase().includes(q) ||
            (f.category && f.category.toLowerCase().includes(q)) ||
            (f.supplierName && f.supplierName.toLowerCase().includes(q)) ||
            (f.note && f.note.toLowerCase().includes(q))
        );
    });

    const toggleFindingSelection = (id: string, checked: boolean) => {
        setSelectedFindingIds((prev) => {
            const next = new Set(prev);
            if (checked) next.add(id);
            else next.delete(id);
            return next;
        });
    };

    const toggleAllFindings = (checked: boolean) => {
        if (checked) {
            setSelectedFindingIds(new Set(filteredFindings.map((f) => f.id)));
        } else {
            setSelectedFindingIds(new Set());
        }
    };

    // Export Findings as XLSX or CSV
    const handleExportFindings = (format: 'xlsx' | 'csv') => {
        try {
            const exportData = filteredFindings.map((f) => ({
                Type: f.type,
                'Created at': f.createdAt,
                Potential: f.potential,
                Opportunities: f.opportunities,
                Articles: `${f.articleNumber || article.articleNumber || ''} ${f.articleName || article.description || ''}`.trim(),
                Categories: f.category || article.category || '',
                Suppliers: f.supplierName || '',
                Buyers: f.buyer || 'Direct Sourcing',
                Assigned: f.assignedTo || 'Unassigned',
                Note: f.note || '',
                'Analysis date': f.analysisDate || f.createdAt,
            }));

            if (exportData.length === 0) {
                exportData.push({
                    Type: 'Price outlier',
                    'Created at': new Date().toLocaleDateString('de-DE'),
                    Potential: '€ 0.00',
                    Opportunities: '0',
                    Articles: `${article.articleNumber} ${article.description || ''}`.trim(),
                    Categories: article.category || '',
                    Suppliers: '',
                    Buyers: 'Direct Sourcing',
                    Assigned: 'Unassigned',
                    Note: 'No open findings',
                    'Analysis date': new Date().toLocaleDateString('de-DE'),
                });
            }

            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Findings');

            const fileName = `savings-findings-${article.articleNumber || 'export'}.${format}`;
            XLSX.writeFile(workbook, fileName, { bookType: format });
            toast.success(`Exported findings as ${format.toUpperCase()}`);
        } catch (err) {
            console.error(err);
            toast.error('Failed to export findings');
        }
    };

    // Filtered Opportunities
    const filteredOpportunities = opportunitiesList.filter((o) => {
        if (!opportunitySearch.trim()) return true;
        const q = opportunitySearch.toLowerCase().trim();
        return (
            o.title.toLowerCase().includes(q) ||
            o.id.toLowerCase().includes(q) ||
            o.status.toLowerCase().includes(q) ||
            o.effect.toLowerCase().includes(q)
        );
    });

    const toggleOpportunitySelection = (id: string, checked: boolean) => {
        setSelectedOpportunityIds((prev) => {
            const next = new Set(prev);
            if (checked) next.add(id);
            else next.delete(id);
            return next;
        });
    };

    const toggleAllOpportunities = (checked: boolean) => {
        if (checked) {
            setSelectedOpportunityIds(new Set(filteredOpportunities.map((o) => o.id)));
        } else {
            setSelectedOpportunityIds(new Set());
        }
    };

    // Custom Tooltip component exactly matching Screenshot 2
    const CustomChartTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const item = payload[0].payload;
            const priceVal = item.price || 129.92;
            const qtyVal = item.quantity || 16000;
            const invoiceVol = ((priceVal * qtyVal) / 100).toFixed(0);

            return (
                <div className="bg-white rounded-xl shadow-2xl border border-slate-200/90 p-4 w-72 text-xs text-slate-800 space-y-3 z-50 pointer-events-auto">
                    {/* Top Row */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>{article.articleNumber} • Article</span>
                        <span>{item.date || '31.01.2025'}</span>
                    </div>

                    {/* Article Description */}
                    <div className="font-bold text-slate-900 text-sm tracking-tight">
                        {article.description || article.articleNumber}
                    </div>

                    <div className="h-px bg-slate-100" />

                    {/* Metric Rows */}
                    <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-500">1 Supplier</span>
                            <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[11px] font-medium max-w-[155px] truncate">
                                <Building2 className="h-3 w-3 text-blue-600 shrink-0" />
                                <span className="truncate">700653 Elring...</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-slate-500">Price</span>
                            <span className="font-semibold text-slate-900">€{priceVal.toFixed(2)}/100 M</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-slate-500">Quantity</span>
                            <span className="font-semibold text-slate-900">{qtyVal.toLocaleString('de-DE')}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-slate-500">Invoice volume</span>
                            <span className="font-semibold text-slate-900">€{Number(invoiceVol || 20787).toLocaleString('de-DE')}</span>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100" />

                    {/* Bottom Open Link */}
                    <div className="flex items-center justify-between pt-0.5">
                        <span className="text-slate-500">Invoice</span>
                        <button
                            type="button"
                            onClick={() => router.push('/transactions/invoices')}
                            className="text-xs font-semibold text-slate-900 hover:underline cursor-pointer"
                        >
                            Open
                        </button>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex flex-col h-full bg-white min-h-screen text-slate-800">
            {/* Top Navigation & Breadcrumb with Delete Action */}
            <div className="px-6 py-3 border-b border-slate-200 bg-white flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                    <Link
                        href="/articles"
                        className="font-normal text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        Articles
                    </Link>
                    <span className="text-slate-400">&gt;</span>

                    {/* Article breadcrumb without green icon */}
                    <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                        <span>
                            {article.articleNumber} {article.description || ''}
                        </span>
                    </div>

                    {/* 3-Dots Dropdown Menu containing Delete Article */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="h-6 w-6 ml-1 flex items-center justify-center rounded-md border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer focus:outline-none"
                                aria-label="Article menu options"
                            >
                                <span className="text-xs font-bold leading-none mb-1">...</span>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="start"
                            side="bottom"
                            className="w-44 p-1 rounded-xl shadow-xl border border-slate-200 bg-white text-slate-800 z-50 animate-in fade-in zoom-in-95 duration-100"
                        >
                            <DropdownMenuItem
                                onClick={() => setIsDeleteDialogOpen(true)}
                                className="flex items-center gap-2.5 px-3 py-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer transition-colors font-medium"
                            >
                                <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                <span>Delete Article</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => router.push('/articles')}
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
                        title="Back to articles"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="px-6 border-b border-slate-200 bg-white flex items-center gap-6 text-xs font-medium text-slate-600">
                {/* 1. Overview */}
                <button
                    type="button"
                    onClick={() => handleTabChange('overview')}
                    className={cn(
                        'flex items-center gap-2 py-3 border-b-2 transition-colors cursor-pointer',
                        activeTab === 'overview'
                            ? 'border-slate-900 text-slate-900 font-semibold'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                    )}
                >
                    <Layers className="h-3.5 w-3.5" />
                    <span>Overview</span>
                </button>

                {/* 2. Suppliers */}
                <button
                    type="button"
                    onClick={() => handleTabChange('suppliers')}
                    className={cn(
                        'flex items-center gap-2 py-3 border-b-2 transition-colors cursor-pointer',
                        activeTab === 'suppliers'
                            ? 'border-slate-900 text-slate-900 font-semibold'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                    )}
                >
                    <Building2 className="h-3.5 w-3.5" />
                    <span>Suppliers</span>
                </button>

                {/* 3. RFQs */}
                <button
                    type="button"
                    onClick={() => handleTabChange('rfqs')}
                    className={cn(
                        'flex items-center gap-2 py-3 border-b-2 transition-colors cursor-pointer',
                        activeTab === 'rfqs'
                            ? 'border-slate-900 text-slate-900 font-semibold'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                    )}
                >
                    <FileText className="h-3.5 w-3.5" />
                    <span>RFQs</span>
                </button>

                {/* 4. Requests */}
                <button
                    type="button"
                    onClick={() => handleTabChange('requests')}
                    className={cn(
                        'flex items-center gap-2 py-3 border-b-2 transition-colors cursor-pointer',
                        activeTab === 'requests'
                            ? 'border-slate-900 text-slate-900 font-semibold'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                    )}
                >
                    <ArrowLeftRight className="h-3.5 w-3.5" />
                    <span>Requests</span>
                </button>

                {/* 5. Transactions Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className={cn(
                                'flex items-center gap-1.5 py-3 border-b-2 transition-colors cursor-pointer focus:outline-none',
                                activeTab === 'transactions'
                                    ? 'border-slate-900 text-slate-900 font-semibold'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                            )}
                        >
                            <Receipt className="h-3.5 w-3.5" />
                            <span>Transactions</span>
                            <ChevronDown className="h-3 w-3 text-slate-400" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-52 p-1.5 rounded-xl shadow-lg border border-slate-200 bg-white z-50">
                        <DropdownMenuItem
                            onClick={() => router.push('/sourcing/orders')}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                        >
                            <ShoppingCart className="h-3.5 w-3.5 text-slate-500" />
                            <span>Orders</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => router.push('/sourcing/goods-receipts')}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                        >
                            <Truck className="h-3.5 w-3.5 text-slate-500" />
                            <span>Goods Receipts</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => router.push('/sourcing/invoices')}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                        >
                            <ReceiptText className="h-3.5 w-3.5 text-slate-500" />
                            <span>Invoices</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => router.push('/sourcing/contracts')}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                        >
                            <Scale className="h-3.5 w-3.5 text-slate-500" />
                            <span>Quantity contracts</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* 6. Savings Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className={cn(
                                'flex items-center gap-1.5 py-3 border-b-2 transition-colors cursor-pointer focus:outline-none',
                                activeTab === 'savings'
                                    ? 'border-slate-900 text-slate-900 font-semibold'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                            )}
                        >
                            <BadgePercent className="h-3.5 w-3.5" />
                            <span>Savings</span>
                            <ChevronDown className="h-3 w-3 text-slate-400" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48 p-1 rounded-xl shadow-lg border border-slate-200 bg-white">
                        <DropdownMenuItem
                            onClick={() => handleSavingsSubTabChange('findings')}
                            className={cn(
                                'flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors',
                                activeTab === 'savings' && savingsSubTab === 'findings'
                                    ? 'bg-slate-100 font-semibold text-slate-900'
                                    : 'text-slate-700 hover:bg-slate-50'
                            )}
                        >
                            <Lightbulb className="h-3.5 w-3.5 text-slate-600" />
                            <span>Findings</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => handleSavingsSubTabChange('opportunities')}
                            className={cn(
                                'flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors',
                                activeTab === 'savings' && savingsSubTab === 'opportunities'
                                    ? 'bg-slate-100 font-semibold text-slate-900'
                                    : 'text-slate-700 hover:bg-slate-50'
                            )}
                        >
                            <Coins className="h-3.5 w-3.5 text-slate-600" />
                            <span>Opportunities</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* TAB CONTENT 1: OVERVIEW (Screenshot 2 Match) */}
            {activeTab === 'overview' && (
                <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 bg-white">
                    {/* Left 2 Columns: Title, Key Figures & Price Development Chart */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title (no green icon) */}
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                            {article.description || article.articleNumber}
                        </h1>

                        {/* Key figures Section Heading */}
                        <div className="space-y-3 pt-2">
                            <h2 className="text-sm font-bold text-slate-900">Key figures</h2>

                            {/* Price Development Chart Card */}
                            <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-xs font-semibold text-slate-900">
                                            Price development by day
                                        </h3>
                                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                                            <div className="h-2 w-2 rounded-full bg-fuchsia-600 shrink-0" />
                                            <span className="truncate max-w-[450px]">
                                                Elring-Klinger Kunststofftechnik Gm Werk Mönchengladbach - {article.description || 'ISOLIERSCHLAUCH'} - 100 M
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition-colors"
                                        title="Expand chart"
                                    >
                                        <Maximize2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>

                                <div className="h-72 w-full pt-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={priceChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                                            <XAxis
                                                dataKey="quarter"
                                                stroke="#94a3b8"
                                                fontSize={11}
                                                tickLine={false}
                                                axisLine={{ stroke: '#e2e8f0' }}
                                            />
                                            <YAxis
                                                yAxisId="left"
                                                stroke="#94a3b8"
                                                fontSize={11}
                                                tickLine={false}
                                                axisLine={false}
                                                domain={[126, 146]}
                                                ticks={[126, 132, 138, 144]}
                                                label={{ value: 'Price [€]', angle: -90, position: 'insideLeft', offset: 25, fontSize: 10, fill: '#94a3b8' }}
                                            />
                                            <YAxis
                                                yAxisId="right"
                                                orientation="right"
                                                stroke="#94a3b8"
                                                fontSize={11}
                                                tickLine={false}
                                                axisLine={false}
                                                domain={[0, 36000]}
                                                ticks={[0, 12000, 24000, 36000]}
                                                label={{ value: 'Quantity', angle: 90, position: 'insideRight', offset: 20, fontSize: 10, fill: '#94a3b8' }}
                                            />
                                            <Tooltip content={<CustomChartTooltip />} />
                                            <Bar
                                                yAxisId="right"
                                                dataKey="quantity"
                                                fill="#e9d5ff"
                                                radius={[3, 3, 0, 0]}
                                                maxBarSize={14}
                                            />
                                            <Line
                                                yAxisId="left"
                                                type="stepAfter"
                                                dataKey="price"
                                                stroke="#c026d3"
                                                strokeWidth={2}
                                                dot={{ r: 3.5, fill: '#c026d3' }}
                                            />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Article Information (Screenshot 2 Match) */}
                    <div className="space-y-6">
                        {/* Article Information Card */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-900 cursor-pointer">
                                <span>Article Information</span>
                                <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                            </div>

                            <div className="space-y-3.5 text-xs">
                                {/* Article number */}
                                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                                    <span className="text-slate-500 font-normal">Article number</span>
                                    <div className="flex items-center gap-1.5 font-mono text-slate-800">
                                        <span className="text-[11px] font-serif font-bold text-slate-400">T</span>
                                        <span>{article.articleNumber}</span>
                                    </div>
                                </div>

                                {/* CN Code */}
                                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                                    <span className="text-slate-500 font-normal">CN code</span>
                                    <div className="flex items-center gap-1.5 font-mono text-slate-800">
                                        <span className="text-[11px] font-serif font-bold text-slate-400">T</span>
                                        <span>{article.cnCode || '39173200'}</span>
                                    </div>
                                </div>

                                {/* Category */}
                                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                                    <span className="text-slate-500 font-normal">Category</span>
                                    <div className="flex items-center gap-1.5 text-slate-800 bg-rose-50/60 border border-rose-100 px-2 py-0.5 rounded-full text-[11px]">
                                        <Tag className="h-3 w-3 text-red-500 shrink-0" />
                                        <span className="truncate max-w-[140px]">{article.category || '0340 Tube, Sleeve,...'}</span>
                                    </div>
                                </div>

                                {/* Net weight */}
                                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                                    <span className="text-slate-500 font-normal">Net weight</span>
                                    <div className="flex items-center gap-1.5 text-slate-800">
                                        <Scale className="h-3.5 w-3.5 text-slate-400" />
                                        <span>{article.netWeight ? `${article.netWeight} ${article.netWeightUnit || 'G'}` : '3.5 G'}</span>
                                    </div>
                                </div>

                                {/* Dimensions */}
                                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                                    <span className="text-slate-500 font-normal">Dimensions (L ...</span>
                                    <div className="flex items-center gap-1.5 text-slate-400">
                                        <Ruler className="h-3.5 w-3.5 text-slate-400" />
                                        <span>-</span>
                                    </div>
                                </div>

                                {/* Long text */}
                                <div className="flex items-center justify-between py-1">
                                    <span className="text-slate-500 font-normal">Long text</span>
                                    {!isEditingLongText ? (
                                        <button
                                            type="button"
                                            onClick={() => setIsEditingLongText(true)}
                                            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors text-[11px]"
                                        >
                                            <AlignLeft className="h-3.5 w-3.5 text-slate-400" />
                                            <span>
                                                {article.longText
                                                    ? article.longText.length > 15
                                                        ? `${article.longText.slice(0, 15)}...`
                                                        : article.longText
                                                    : 'Enter text'}
                                            </span>
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-1">
                                            <Input
                                                value={longTextValue}
                                                onChange={(e) => setLongTextValue(e.target.value)}
                                                className="h-6 text-[11px] px-1.5 w-28"
                                                autoFocus
                                            />
                                            <button
                                                type="button"
                                                onClick={handleSaveLongText}
                                                className="text-[10px] font-bold text-emerald-600 hover:underline"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT 2: SUPPLIERS */}
            {activeTab === 'suppliers' && (
                <div className="flex-1 flex flex-col bg-white">
                    {/* Toolbar */}
                    <div className="px-6 py-3 border-b border-slate-200 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs font-semibold text-slate-700 border-slate-200 rounded-lg hover:bg-slate-50"
                            >
                                <Plus className="h-3.5 w-3.5 mr-1" />
                                Add filter
                            </Button>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative w-64">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                <Input
                                    placeholder="Search suppliers..."
                                    value={supplierSearch}
                                    onChange={(e) => setSupplierSearch(e.target.value)}
                                    className="h-8 pl-8 text-xs bg-white border-slate-200 rounded-lg focus-visible:ring-1"
                                />
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className="h-8 px-2.5 flex items-center gap-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs text-slate-700 font-medium transition-colors focus:outline-none"
                                    >
                                        <Columns className="h-3.5 w-3.5 text-slate-500" />
                                        <span>Columns {visibleSupplierCols.size}/{SUPPLIER_COLUMNS.length}</span>
                                        <ChevronDown className="h-3 w-3 text-slate-400" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-64 p-2 rounded-xl shadow-xl border border-slate-200 bg-white z-50">
                                    <div className="px-2 py-1.5 border-b border-slate-100">
                                        <div className="relative">
                                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                                            <Input
                                                placeholder="Search columns..."
                                                value={colSearchQuery}
                                                onChange={(e) => setColSearchQuery(e.target.value)}
                                                className="h-7 pl-7 text-xs border-slate-200 focus-visible:ring-1"
                                            />
                                        </div>
                                    </div>
                                    <div className="py-1">
                                        <div
                                            className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 rounded cursor-pointer"
                                            onClick={() => {
                                                const allSelected = visibleSupplierCols.size === SUPPLIER_COLUMNS.length;
                                                if (allSelected) setVisibleSupplierCols(new Set());
                                                else setVisibleSupplierCols(new Set(SUPPLIER_COLUMNS.map((c) => c.key)));
                                            }}
                                        >
                                            <Checkbox
                                                checked={visibleSupplierCols.size === SUPPLIER_COLUMNS.length}
                                                onCheckedChange={(c) => {
                                                    if (c) setVisibleSupplierCols(new Set(SUPPLIER_COLUMNS.map((col) => col.key)));
                                                    else setVisibleSupplierCols(new Set());
                                                }}
                                                className="rounded border-slate-300"
                                            />
                                            <span>Select all</span>
                                        </div>
                                        <div className="max-h-60 overflow-y-auto space-y-0.5 mt-1 divide-y-0">
                                            {SUPPLIER_COLUMNS.filter((col) =>
                                                col.label.toLowerCase().includes(colSearchQuery.toLowerCase().trim())
                                            ).map((col) => (
                                                <div
                                                    key={col.key}
                                                    className="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-800 hover:bg-slate-50 rounded cursor-pointer"
                                                    onClick={() => {
                                                        setVisibleSupplierCols((prev) => {
                                                            const next = new Set(prev);
                                                            if (next.has(col.key)) next.delete(col.key);
                                                            else next.add(col.key);
                                                            return next;
                                                        });
                                                    }}
                                                >
                                                    <Checkbox
                                                        checked={visibleSupplierCols.has(col.key)}
                                                        onCheckedChange={(c) => {
                                                            setVisibleSupplierCols((prev) => {
                                                                const next = new Set(prev);
                                                                if (c) next.add(col.key);
                                                                else next.delete(col.key);
                                                                return next;
                                                            });
                                                        }}
                                                        className="rounded border-slate-300"
                                                    />
                                                    <span className="font-normal text-slate-800">{col.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="flex-1 overflow-auto">
                        <table className="w-full border-collapse text-xs text-left">
                            <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-600 border-b border-slate-200 sticky top-0 z-10">
                                <tr>
                                    <th className="w-10 px-3 py-2.5 text-center">
                                        <Checkbox
                                            checked={selectedSupplierIds.size > 0 && selectedSupplierIds.size === filteredSuppliers.length}
                                            onCheckedChange={(c) => toggleAllSuppliers(!!c)}
                                            className="rounded border-slate-300"
                                        />
                                    </th>
                                    {visibleSupplierCols.has('supplier') && <th className="px-4 py-2.5 whitespace-nowrap min-w-[280px]">Supplier</th>}
                                    {visibleSupplierCols.has('originCountry') && <th className="px-4 py-2.5 whitespace-nowrap min-w-[130px]">Origin country</th>}
                                    {visibleSupplierCols.has('lastOrder') && <th className="px-4 py-2.5 whitespace-nowrap min-w-[110px]">Last Order</th>}
                                    {visibleSupplierCols.has('lastDelivery') && <th className="px-4 py-2.5 whitespace-nowrap min-w-[110px]">Last Delivery</th>}
                                    {visibleSupplierCols.has('lastUpdatedAt') && <th className="px-4 py-2.5 whitespace-nowrap min-w-[120px]">Last updated at</th>}
                                    {visibleSupplierCols.has('erpCreatedAt') && <th className="px-4 py-2.5 whitespace-nowrap min-w-[120px]">ERP created at</th>}
                                    {visibleSupplierCols.has('supplierArticleNo') && <th className="px-4 py-2.5 whitespace-nowrap min-w-[150px]">Supplier article no</th>}
                                    {visibleSupplierCols.has('erpReferenceNo') && <th className="px-4 py-2.5 whitespace-nowrap min-w-[140px]">ERP reference no</th>}
                                    {visibleSupplierCols.has('createdAt') && <th className="px-4 py-2.5 whitespace-nowrap min-w-[110px]">Created at</th>}
                                    {visibleSupplierCols.has('complianceNotes') && <th className="px-4 py-2.5 whitespace-nowrap min-w-[140px]">Compliance notes</th>}
                                    {visibleSupplierCols.has('casNumber') && <th className="px-4 py-2.5 whitespace-nowrap min-w-[110px]">CAS Number</th>}
                                    {visibleSupplierCols.has('scipNumber') && <th className="px-4 py-2.5 whitespace-nowrap min-w-[110px]">SCIP Number</th>}
                                    {visibleSupplierCols.has('svhcIncluded') && <th className="px-4 py-2.5 whitespace-nowrap min-w-[110px]">SVHC included</th>}
                                    {visibleSupplierCols.has('pfasAffected') && <th className="px-4 py-2.5 whitespace-nowrap min-w-[110px]">PFAS affected</th>}
                                    {visibleSupplierCols.has('rohsAffected') && <th className="px-4 py-2.5 whitespace-nowrap min-w-[110px]">RoHS affected</th>}
                                    {visibleSupplierCols.has('annexXIV') && <th className="px-4 py-2.5 whitespace-nowrap min-w-[100px]">Annex XIV</th>}
                                    {visibleSupplierCols.has('popsAffected') && <th className="px-4 py-2.5 whitespace-nowrap min-w-[110px]">POPs affected</th>}
                                    {visibleSupplierCols.has('reachAffected') && <th className="px-4 py-2.5 whitespace-nowrap min-w-[110px]">REACH affected</th>}
                                    {visibleSupplierCols.has('annexXVII') && <th className="px-4 py-2.5 whitespace-nowrap min-w-[100px]">Annex XVII</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {loadingSuppliers ? (
                                    <tr>
                                        <td colSpan={visibleSupplierCols.size + 1} className="py-12 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                                                <Loader2 className="h-5 w-5 animate-spin text-slate-600" />
                                                <span>Loading suppliers...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredSuppliers.length === 0 ? (
                                    <tr>
                                        <td colSpan={visibleSupplierCols.size + 1} className="py-12 text-center text-slate-400">
                                            No linked suppliers found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSuppliers.map((s) => {
                                        const isChecked = selectedSupplierIds.has(s.id);
                                        return (
                                            <tr key={s.id} className={cn('hover:bg-slate-50/70 transition-colors', isChecked && 'bg-slate-50')}>
                                                <td className="w-10 px-3 py-3 text-center">
                                                    <Checkbox
                                                        checked={isChecked}
                                                        onCheckedChange={(checked) => toggleSupplierSelection(s.id, !!checked)}
                                                        className="rounded border-slate-300"
                                                    />
                                                </td>
                                                {visibleSupplierCols.has('supplier') && (
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="flex items-center gap-6">
                                                            <span className="font-mono text-slate-600 font-medium">{s.supplierNumber}</span>
                                                            <span className="font-semibold text-slate-900 max-w-[240px] truncate">{s.name}</span>
                                                        </div>
                                                    </td>
                                                )}
                                                {visibleSupplierCols.has('originCountry') && (
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="flex items-center gap-1.5 text-slate-800">
                                                            <span className="text-sm">🇩🇪</span>
                                                            <span>{s.originCountry}</span>
                                                        </div>
                                                    </td>
                                                )}
                                                {visibleSupplierCols.has('lastOrder') && <td className="px-4 py-3 whitespace-nowrap text-slate-700">{s.lastOrder || '—'}</td>}
                                                {visibleSupplierCols.has('lastDelivery') && <td className="px-4 py-3 whitespace-nowrap text-slate-700">{s.lastDelivery || '—'}</td>}
                                                {visibleSupplierCols.has('lastUpdatedAt') && <td className="px-4 py-3 whitespace-nowrap text-slate-600">{s.lastUpdatedAt || '—'}</td>}
                                                {visibleSupplierCols.has('erpCreatedAt') && <td className="px-4 py-3 whitespace-nowrap text-slate-600">{s.erpCreatedAt || '—'}</td>}
                                                {visibleSupplierCols.has('supplierArticleNo') && <td className="px-4 py-3 whitespace-nowrap font-mono text-slate-700">{s.supplierArticleNo || '—'}</td>}
                                                {visibleSupplierCols.has('erpReferenceNo') && <td className="px-4 py-3 whitespace-nowrap font-mono text-slate-700">{s.erpReferenceNo || '—'}</td>}
                                                {visibleSupplierCols.has('createdAt') && <td className="px-4 py-3 whitespace-nowrap text-slate-600">{s.createdAt || '—'}</td>}
                                                {visibleSupplierCols.has('complianceNotes') && <td className="px-4 py-3 whitespace-nowrap text-slate-400">{s.complianceNotes || '—'}</td>}
                                                {visibleSupplierCols.has('casNumber') && <td className="px-4 py-3 whitespace-nowrap text-slate-400">{s.casNumber || '—'}</td>}
                                                {visibleSupplierCols.has('scipNumber') && <td className="px-4 py-3 whitespace-nowrap text-slate-400">{s.scipNumber || '—'}</td>}
                                                {visibleSupplierCols.has('svhcIncluded') && <td className="px-4 py-3 whitespace-nowrap text-slate-400">{s.svhcIncluded || '—'}</td>}
                                                {visibleSupplierCols.has('pfasAffected') && <td className="px-4 py-3 whitespace-nowrap text-slate-400">{s.pfasAffected || '—'}</td>}
                                                {visibleSupplierCols.has('rohsAffected') && <td className="px-4 py-3 whitespace-nowrap text-slate-400">{s.rohsAffected || '—'}</td>}
                                                {visibleSupplierCols.has('annexXIV') && <td className="px-4 py-3 whitespace-nowrap text-slate-400">{s.annexXIV || '—'}</td>}
                                                {visibleSupplierCols.has('popsAffected') && <td className="px-4 py-3 whitespace-nowrap text-slate-400">{s.popsAffected || '—'}</td>}
                                                {visibleSupplierCols.has('reachAffected') && <td className="px-4 py-3 whitespace-nowrap text-slate-400">{s.reachAffected || '—'}</td>}
                                                {visibleSupplierCols.has('annexXVII') && <td className="px-4 py-3 whitespace-nowrap text-slate-400">{s.annexXVII || '—'}</td>}
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 font-medium flex items-center justify-between">
                        <span>Rows: {filteredSuppliers.length}</span>
                    </div>
                </div>
            )}

            {/* TAB CONTENT 3: RFQs */}
            {activeTab === 'rfqs' && (
                <div className="flex-1 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-bold text-slate-900">RFQs for Article {article.articleNumber}</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Sourcing events and quotations referencing this article.</p>
                        </div>
                        <Button
                            size="sm"
                            onClick={() => router.push('/sourcing/rfqs')}
                            className="text-xs font-semibold bg-slate-900 text-white rounded-xl"
                        >
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            Create RFQ
                        </Button>
                    </div>
                    <div className="border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs">
                        No active RFQs for this article yet. Click "Create RFQ" to launch a request for quotation.
                    </div>
                </div>
            )}

            {/* TAB CONTENT 4: REQUESTS */}
            {activeTab === 'requests' && (
                <div className="flex-1 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-bold text-slate-900">Requests for Article {article.articleNumber}</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Compliance, labor rights, and supplier assessment requests.</p>
                        </div>
                        <Button
                            size="sm"
                            onClick={() => router.push('/sourcing/requisitions')}
                            className="text-xs font-semibold bg-slate-900 text-white rounded-xl"
                        >
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            Create Request
                        </Button>
                    </div>
                    <div className="border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs">
                        No active requests for this article.
                    </div>
                </div>
            )}

            {/* TAB CONTENT 5: TRANSACTIONS */}
            {activeTab === 'transactions' && (
                <div className="flex-1 p-6 space-y-6">
                    <div>
                        <h2 className="text-sm font-bold text-slate-900">Transactions for Article {article.articleNumber}</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Select a transaction category to view and manage recorded documents.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button
                            type="button"
                            onClick={() => router.push('/sourcing/orders')}
                            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-400 hover:shadow-sm text-left transition-all group cursor-pointer"
                        >
                            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-colors mb-3">
                                <ShoppingCart className="h-4 w-4" />
                            </div>
                            <h3 className="text-xs font-bold text-slate-900 mb-1">Orders</h3>
                            <p className="text-[11px] text-slate-500">Purchase orders and procurement commitments</p>
                        </button>

                        <button
                            type="button"
                            onClick={() => router.push('/sourcing/goods-receipts')}
                            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-400 hover:shadow-sm text-left transition-all group cursor-pointer"
                        >
                            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-colors mb-3">
                                <Truck className="h-4 w-4" />
                            </div>
                            <h3 className="text-xs font-bold text-slate-900 mb-1">Goods Receipts</h3>
                            <p className="text-[11px] text-slate-500">Inbound deliveries and delivery notes</p>
                        </button>

                        <button
                            type="button"
                            onClick={() => router.push('/sourcing/invoices')}
                            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-400 hover:shadow-sm text-left transition-all group cursor-pointer"
                        >
                            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-colors mb-3">
                                <ReceiptText className="h-4 w-4" />
                            </div>
                            <h3 className="text-xs font-bold text-slate-900 mb-1">Invoices</h3>
                            <p className="text-[11px] text-slate-500">Supplier invoices and 3-way matching records</p>
                        </button>

                        <button
                            type="button"
                            onClick={() => router.push('/sourcing/contracts')}
                            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-400 hover:shadow-sm text-left transition-all group cursor-pointer"
                        >
                            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-colors mb-3">
                                <Scale className="h-4 w-4" />
                            </div>
                            <h3 className="text-xs font-bold text-slate-900 mb-1">Quantity Contracts</h3>
                            <p className="text-[11px] text-slate-500">Frame agreements and volume rebates</p>
                        </button>
                    </div>
                </div>
            )}

            {/* TAB CONTENT 6: SAVINGS (FINDINGS & OPPORTUNITIES) */}
            {activeTab === 'savings' && (
                <div className="flex-1 flex flex-col bg-white">
                    {savingsSubTab === 'findings' ? (
                        /* FINDINGS VIEW (Screenshots 2, 3, 4, 5) */
                        <div className="flex-1 flex flex-col">
                            {/* Toolbar: Status Pills + Add Filter + Search + Columns + 3-Dots */}
                            <div className="px-6 py-3 border-b border-slate-200 flex items-center justify-between gap-4 flex-wrap">
                                {/* Status Filter Pills */}
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setFindingsStatus('open')}
                                        className={cn(
                                            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border cursor-pointer',
                                            findingsStatus === 'open'
                                                ? 'bg-slate-100 border-slate-300 text-slate-900 font-semibold shadow-xs'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        )}
                                    >
                                        <Lightbulb className="h-3.5 w-3.5 text-slate-700" />
                                        <span>Open</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setFindingsStatus('accepted')}
                                        className={cn(
                                            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border cursor-pointer',
                                            findingsStatus === 'accepted'
                                                ? 'bg-slate-100 border-slate-300 text-slate-900 font-semibold shadow-xs'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        )}
                                    >
                                        <CheckCircle2 className="h-3.5 w-3.5 text-slate-700" />
                                        <span>Accepted</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setFindingsStatus('dismissed')}
                                        className={cn(
                                            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border cursor-pointer',
                                            findingsStatus === 'dismissed'
                                                ? 'bg-slate-100 border-slate-300 text-slate-900 font-semibold shadow-xs'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        )}
                                    >
                                        <XCircle className="h-3.5 w-3.5 text-slate-700" />
                                        <span>Dismissed</span>
                                    </button>

                                    <button
                                        type="button"
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        <span>Add filter</span>
                                    </button>
                                </div>

                                {/* Right Toolbar: Search + Column Toggle + 3-Dots Export */}
                                <div className="flex items-center gap-2">
                                    <div className="relative w-64">
                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                        <Input
                                            placeholder="Search for Findings"
                                            value={findingsSearch}
                                            onChange={(e) => setFindingsSearch(e.target.value)}
                                            className="h-8 pl-8 text-xs bg-white border-slate-200 rounded-lg focus-visible:ring-1"
                                        />
                                    </div>

                                    {/* Column Visibility Dropdown */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                type="button"
                                                className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer focus:outline-none"
                                                title="Columns"
                                            >
                                                <Columns className="h-3.5 w-3.5" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-xl border border-slate-200 bg-white z-50">
                                            <div className="px-2 py-1.5 border-b border-slate-100">
                                                <div className="relative">
                                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                                                    <Input
                                                        placeholder="Search..."
                                                        value={findingsColSearchQuery}
                                                        onChange={(e) => setFindingsColSearchQuery(e.target.value)}
                                                        className="h-7 pl-7 text-xs border-slate-200 focus-visible:ring-1"
                                                    />
                                                </div>
                                            </div>
                                            <div className="py-1">
                                                <div
                                                    className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-slate-900 hover:bg-slate-50 rounded-lg cursor-pointer select-none"
                                                    onClick={() => {
                                                        const allSelected = visibleFindingsCols.size === FINDINGS_COLUMNS.length;
                                                        if (allSelected) {
                                                            setVisibleFindingsCols(new Set());
                                                        } else {
                                                            setVisibleFindingsCols(new Set(FINDINGS_COLUMNS.map((c) => c.key)));
                                                        }
                                                    }}
                                                >
                                                    <Checkbox
                                                        checked={visibleFindingsCols.size === FINDINGS_COLUMNS.length}
                                                        onCheckedChange={(c) => {
                                                            if (c) setVisibleFindingsCols(new Set(FINDINGS_COLUMNS.map((col) => col.key)));
                                                            else setVisibleFindingsCols(new Set());
                                                        }}
                                                        className="rounded border-slate-300"
                                                    />
                                                    <span>Select all</span>
                                                </div>
                                                <div className="max-h-60 overflow-y-auto space-y-0.5 mt-1 divide-y-0">
                                                    {FINDINGS_COLUMNS.filter((col) =>
                                                        col.label.toLowerCase().includes(findingsColSearchQuery.toLowerCase().trim())
                                                    ).map((col) => {
                                                        const isChecked = visibleFindingsCols.has(col.key);
                                                        return (
                                                            <div
                                                                key={col.key}
                                                                className="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-800 hover:bg-slate-50 rounded-lg cursor-pointer select-none transition-colors"
                                                                onClick={() => {
                                                                    setVisibleFindingsCols((prev) => {
                                                                        const next = new Set(prev);
                                                                        if (next.has(col.key)) {
                                                                            next.delete(col.key);
                                                                        } else {
                                                                            next.add(col.key);
                                                                        }
                                                                        return next;
                                                                    });
                                                                }}
                                                            >
                                                                <Checkbox
                                                                    checked={isChecked}
                                                                    onCheckedChange={(c) => {
                                                                        setVisibleFindingsCols((prev) => {
                                                                            const next = new Set(prev);
                                                                            if (c) next.add(col.key);
                                                                            else next.delete(col.key);
                                                                            return next;
                                                                        });
                                                                    }}
                                                                    className="rounded border-slate-300"
                                                                />
                                                                <span className="font-normal text-slate-800">{col.label}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    {/* 3-Dots Export Menu */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                type="button"
                                                className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer focus:outline-none"
                                                title="Export options"
                                            >
                                                <MoreVertical className="h-3.5 w-3.5" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-60 p-1.5 rounded-xl shadow-xl border border-slate-200 bg-white z-50">
                                            <DropdownMenuItem
                                                onClick={() => handleExportFindings('xlsx')}
                                                className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-800 hover:bg-slate-50 rounded-lg cursor-pointer font-medium"
                                            >
                                                <div className="h-4 w-4 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center text-[8px] font-bold tracking-tighter">
                                                    XLSX
                                                </div>
                                                <span>Export as Excel file (.xlsx)</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleExportFindings('csv')}
                                                className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-800 hover:bg-slate-50 rounded-lg cursor-pointer font-medium"
                                            >
                                                <div className="h-4 w-4 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center text-[8px] font-bold tracking-tighter">
                                                    CSV
                                                </div>
                                                <span>Export as CSV file (.csv)</span>
                                            </DropdownMenuItem>
                                            <div className="h-px bg-slate-100 my-1" />
                                            <div className="px-3 py-1.5 text-[11px] text-slate-400 font-normal leading-tight">
                                                Only the first 10,000 rows will be exported
                                            </div>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Findings Table Area */}
                            <div className="flex-1 overflow-auto flex flex-col">
                                <table className="w-full border-collapse text-xs text-left">
                                    <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-600 border-b border-slate-200 sticky top-0 z-10">
                                        <tr>
                                            <th className="w-10 px-3 py-2.5 text-center">
                                                <Checkbox
                                                    checked={selectedFindingIds.size > 0 && selectedFindingIds.size === filteredFindings.length}
                                                    onCheckedChange={(c) => toggleAllFindings(!!c)}
                                                    className="rounded border-slate-300"
                                                />
                                            </th>
                                            {visibleFindingsCols.has('type') && <th className="px-4 py-2.5 whitespace-nowrap min-w-[120px]">Type</th>}
                                            {visibleFindingsCols.has('createdAt') && <th className="px-4 py-2.5 whitespace-nowrap min-w-[120px]">Created at</th>}
                                            {visibleFindingsCols.has('potential') && <th className="px-4 py-2.5 whitespace-nowrap min-w-[120px]">Potential</th>}
                                            {visibleFindingsCols.has('opportunities') && <th className="px-4 py-2.5 whitespace-nowrap min-w-[120px]">Opportunities</th>}
                                            {visibleFindingsCols.has('articles') && <th className="px-4 py-2.5 whitespace-nowrap min-w-[160px]">Articles</th>}
                                            {visibleFindingsCols.has('categories') && (
                                                <th className="px-4 py-2.5 whitespace-nowrap min-w-[140px]">
                                                    <div className="flex items-center gap-1.5">
                                                        <Tag className="h-3 w-3 text-red-500" />
                                                        <span>Categories</span>
                                                    </div>
                                                </th>
                                            )}
                                            {visibleFindingsCols.has('suppliers') && (
                                                <th className="px-4 py-2.5 whitespace-nowrap min-w-[160px]">
                                                    <div className="flex items-center gap-1.5">
                                                        <Building2 className="h-3 w-3 text-blue-600" />
                                                        <span>Suppliers</span>
                                                    </div>
                                                </th>
                                            )}
                                            {visibleFindingsCols.has('buyers') && <th className="px-4 py-2.5 whitespace-nowrap min-w-[120px]">Buyers</th>}
                                            {visibleFindingsCols.has('assigned') && <th className="px-4 py-2.5 whitespace-nowrap min-w-[120px]">Assigned</th>}
                                            {visibleFindingsCols.has('note') && <th className="px-4 py-2.5 whitespace-nowrap min-w-[160px]">Note</th>}
                                            {visibleFindingsCols.has('analysisDate') && <th className="px-4 py-2.5 whitespace-nowrap min-w-[120px]">Analysis date</th>}
                                        </tr>
                                    </thead>

                                    {/* Table Body */}
                                    {filteredFindings.length > 0 && (
                                        <tbody className="divide-y divide-slate-100 text-slate-700">
                                            {filteredFindings.map((f) => {
                                                const isChecked = selectedFindingIds.has(f.id);
                                                return (
                                                    <tr key={f.id} className={cn('hover:bg-slate-50/70 transition-colors', isChecked && 'bg-slate-50')}>
                                                        <td className="w-10 px-3 py-3 text-center">
                                                            <Checkbox
                                                                checked={isChecked}
                                                                onCheckedChange={(c) => toggleFindingSelection(f.id, !!c)}
                                                                className="rounded border-slate-300"
                                                            />
                                                        </td>
                                                        {visibleFindingsCols.has('type') && <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-900">{f.type}</td>}
                                                        {visibleFindingsCols.has('createdAt') && <td className="px-4 py-3 whitespace-nowrap text-slate-600">{f.createdAt}</td>}
                                                        {visibleFindingsCols.has('potential') && <td className="px-4 py-3 whitespace-nowrap font-semibold text-slate-900">{f.potential}</td>}
                                                        {visibleFindingsCols.has('opportunities') && <td className="px-4 py-3 whitespace-nowrap text-slate-700">{f.opportunities}</td>}
                                                        {visibleFindingsCols.has('articles') && (
                                                            <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-900">
                                                                {f.articleNumber || article.articleNumber} {f.articleName || article.description || ''}
                                                            </td>
                                                        )}
                                                        {visibleFindingsCols.has('categories') && (
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                <div className="flex items-center gap-1.5 text-slate-800">
                                                                    <Tag className="h-3.5 w-3.5 text-red-500" />
                                                                    <span>{f.category || article.category || 'Direct Material'}</span>
                                                                </div>
                                                            </td>
                                                        )}
                                                        {visibleFindingsCols.has('suppliers') && (
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                <div className="flex items-center gap-1.5 text-slate-800">
                                                                    <Building2 className="h-3.5 w-3.5 text-blue-600" />
                                                                    <span>{f.supplierName || 'Polytetra GmbH'}</span>
                                                                </div>
                                                            </td>
                                                        )}
                                                        {visibleFindingsCols.has('buyers') && <td className="px-4 py-3 whitespace-nowrap text-slate-700">{f.buyer || 'Direct Sourcing'}</td>}
                                                        {visibleFindingsCols.has('assigned') && <td className="px-4 py-3 whitespace-nowrap text-slate-700">{f.assignedTo || 'Unassigned'}</td>}
                                                        {visibleFindingsCols.has('note') && <td className="px-4 py-3 whitespace-nowrap text-slate-500 max-w-[200px] truncate">{f.note || '—'}</td>}
                                                        {visibleFindingsCols.has('analysisDate') && <td className="px-4 py-3 whitespace-nowrap text-slate-600">{f.analysisDate || f.createdAt}</td>}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    )}
                                </table>

                                {/* Empty State: Everything is on track! (Screenshot 2) */}
                                {filteredFindings.length === 0 && (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 min-h-[320px]">
                                        <div className="w-12 h-12 mb-3 text-slate-800 flex items-center justify-center">
                                            {/* Binoculars icon */}
                                            <svg className="w-10 h-10 text-slate-800 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M10 10h4" />
                                                <path d="M19 7V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3" />
                                                <path d="M7 7V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v3" />
                                                <circle cx="6" cy="14" r="4" />
                                                <circle cx="18" cy="14" r="4" />
                                                <path d="M10 14h4" />
                                            </svg>
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                                            Everything is on track!
                                        </h3>
                                        <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                                            There are currently no {findingsStatus} findings. We continuously monitor your data and will promptly inform you as soon as new savings findings are identified.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Bottom Status Bar */}
                            <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 font-medium flex items-center justify-between">
                                <span>Findings: {filteredFindings.length}</span>
                            </div>
                        </div>
                    ) : (
                        /* OPPORTUNITIES VIEW (Screenshot 1) */
                        <div className="flex-1 flex flex-col">
                            {/* Toolbar: + Add filter, Search, Columns 9/16 */}
                            <div className="px-6 py-3 border-b border-slate-200 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs font-semibold text-slate-700 border-slate-200 rounded-lg hover:bg-slate-50"
                                    >
                                        <Plus className="h-3.5 w-3.5 mr-1" />
                                        Add filter
                                    </Button>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="relative w-64">
                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                        <Input
                                            placeholder="Search..."
                                            value={opportunitySearch}
                                            onChange={(e) => setOpportunitySearch(e.target.value)}
                                            className="h-8 pl-8 text-xs bg-white border-slate-200 rounded-lg focus-visible:ring-1"
                                        />
                                    </div>

                                    {/* Column selector */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                type="button"
                                                className="h-8 px-2.5 flex items-center gap-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs text-slate-700 font-medium transition-colors focus:outline-none"
                                            >
                                                <Columns className="h-3.5 w-3.5 text-slate-500" />
                                                <span>Columns {visibleOpportunityCols.size}/{OPPORTUNITY_COLUMNS.length}</span>
                                                <ChevronDown className="h-3 w-3 text-slate-400" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-xl border border-slate-200 bg-white z-50">
                                            <div className="px-2 py-1.5 border-b border-slate-100">
                                                <div className="relative">
                                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                                                    <Input
                                                        placeholder="Search..."
                                                        value={opportunityColSearchQuery}
                                                        onChange={(e) => setOpportunityColSearchQuery(e.target.value)}
                                                        className="h-7 pl-7 text-xs border-slate-200 focus-visible:ring-1"
                                                    />
                                                </div>
                                            </div>
                                            <div className="py-1">
                                                <div
                                                    className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-slate-900 hover:bg-slate-50 rounded-lg cursor-pointer select-none"
                                                    onClick={() => {
                                                        const allSelected = visibleOpportunityCols.size === OPPORTUNITY_COLUMNS.length;
                                                        if (allSelected) setVisibleOpportunityCols(new Set());
                                                        else setVisibleOpportunityCols(new Set(OPPORTUNITY_COLUMNS.map((c) => c.key)));
                                                    }}
                                                >
                                                    <Checkbox
                                                        checked={visibleOpportunityCols.size === OPPORTUNITY_COLUMNS.length}
                                                        onCheckedChange={(c) => {
                                                            if (c) setVisibleOpportunityCols(new Set(OPPORTUNITY_COLUMNS.map((col) => col.key)));
                                                            else setVisibleOpportunityCols(new Set());
                                                        }}
                                                        className="rounded border-slate-300"
                                                    />
                                                    <span>Select all</span>
                                                </div>
                                                <div className="max-h-60 overflow-y-auto space-y-0.5 mt-1 divide-y-0">
                                                    {OPPORTUNITY_COLUMNS.filter((col) =>
                                                        col.label.toLowerCase().includes(opportunityColSearchQuery.toLowerCase().trim())
                                                    ).map((col) => (
                                                        <div
                                                            key={col.key}
                                                            className="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-800 hover:bg-slate-50 rounded-lg cursor-pointer select-none transition-colors"
                                                            onClick={() => {
                                                                setVisibleOpportunityCols((prev) => {
                                                                    const next = new Set(prev);
                                                                    if (next.has(col.key)) next.delete(col.key);
                                                                    else next.add(col.key);
                                                                    return next;
                                                                });
                                                            }}
                                                        >
                                                            <Checkbox
                                                                checked={visibleOpportunityCols.has(col.key)}
                                                                onCheckedChange={(c) => {
                                                                    setVisibleOpportunityCols((prev) => {
                                                                        const next = new Set(prev);
                                                                        if (c) next.add(col.key);
                                                                        else next.delete(col.key);
                                                                        return next;
                                                                    });
                                                                }}
                                                                className="rounded border-slate-300"
                                                            />
                                                            <span className="font-normal text-slate-800">{col.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Opportunities Table */}
                            <div className="flex-1 overflow-auto flex flex-col">
                                <table className="w-full border-collapse text-xs text-left">
                                    <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-600 border-b border-slate-200 sticky top-0 z-10">
                                        <tr>
                                            <th className="w-10 px-3 py-2.5 text-center">
                                                <Checkbox
                                                    checked={selectedOpportunityIds.size > 0 && selectedOpportunityIds.size === filteredOpportunities.length}
                                                    onCheckedChange={(c) => toggleAllOpportunities(!!c)}
                                                    className="rounded border-slate-300"
                                                />
                                            </th>
                                            {visibleOpportunityCols.has('id') && <th className="px-4 py-2.5 whitespace-nowrap min-w-[100px]">ID</th>}
                                            {visibleOpportunityCols.has('title') && <th className="px-4 py-2.5 whitespace-nowrap min-w-[200px]">Title</th>}
                                            {visibleOpportunityCols.has('status') && <th className="px-4 py-2.5 whitespace-nowrap min-w-[120px]">Status</th>}
                                            {visibleOpportunityCols.has('startDate') && <th className="px-4 py-2.5 whitespace-nowrap min-w-[120px]">Start date</th>}
                                            {visibleOpportunityCols.has('endDate') && <th className="px-4 py-2.5 whitespace-nowrap min-w-[120px]">End date</th>}
                                            {visibleOpportunityCols.has('effect') && <th className="px-4 py-2.5 whitespace-nowrap min-w-[120px]">Effect</th>}
                                            {visibleOpportunityCols.has('savingAmount') && <th className="px-4 py-2.5 whitespace-nowrap min-w-[140px]">Saving amount</th>}
                                        </tr>
                                    </thead>

                                    {filteredOpportunities.length > 0 && (
                                        <tbody className="divide-y divide-slate-100 text-slate-700">
                                            {filteredOpportunities.map((o) => {
                                                const isChecked = selectedOpportunityIds.has(o.id);
                                                return (
                                                    <tr key={o.id} className={cn('hover:bg-slate-50/70 transition-colors', isChecked && 'bg-slate-50')}>
                                                        <td className="w-10 px-3 py-3 text-center">
                                                            <Checkbox
                                                                checked={isChecked}
                                                                onCheckedChange={(c) => toggleOpportunitySelection(o.id, !!c)}
                                                                className="rounded border-slate-300"
                                                            />
                                                        </td>
                                                        {visibleOpportunityCols.has('id') && <td className="px-4 py-3 whitespace-nowrap font-mono text-slate-600">{o.id}</td>}
                                                        {visibleOpportunityCols.has('title') && <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-900">{o.title}</td>}
                                                        {visibleOpportunityCols.has('status') && (
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                <Badge variant="outline" className="text-[10px] font-semibold bg-slate-50 text-slate-700 border-slate-200">
                                                                    {o.status}
                                                                </Badge>
                                                            </td>
                                                        )}
                                                        {visibleOpportunityCols.has('startDate') && <td className="px-4 py-3 whitespace-nowrap text-slate-600">{o.startDate}</td>}
                                                        {visibleOpportunityCols.has('endDate') && <td className="px-4 py-3 whitespace-nowrap text-slate-600">{o.endDate}</td>}
                                                        {visibleOpportunityCols.has('effect') && <td className="px-4 py-3 whitespace-nowrap text-slate-700">{o.effect}</td>}
                                                        {visibleOpportunityCols.has('savingAmount') && <td className="px-4 py-3 whitespace-nowrap font-semibold text-emerald-700">{o.savingAmount}</td>}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    )}
                                </table>

                                {/* Empty State: No rows (Screenshot 1) */}
                                {filteredOpportunities.length === 0 && (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 min-h-[320px]">
                                        <div className="w-12 h-12 mb-3 text-slate-400 flex items-center justify-center">
                                            {/* Grid layout icon with an x */}
                                            <svg className="w-10 h-10 text-slate-700 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                <rect width="18" height="18" x="3" y="3" rx="2" />
                                                <path d="M3 9h18" />
                                                <path d="M9 21V9" />
                                                <path d="m14 14 4 4" />
                                                <path d="m18 14-4 4" />
                                            </svg>
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-900 mb-1">
                                            No rows
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            There are no rows matching your filter.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Bottom Status Bar */}
                            <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 font-medium flex items-center justify-between">
                                <span>Opportunities: {filteredOpportunities.length}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Delete Article Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="rounded-2xl bg-white border border-slate-200 shadow-xl max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-slate-900 text-base font-bold">
                            Delete Article
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-slate-500">
                            Are you sure you want to delete article{' '}
                            <span className="font-semibold text-slate-800">
                                {article.articleNumber} ({article.description || 'Unnamed'})
                            </span>
                            ? This will remove the article from the database and cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 pt-2">
                        <AlertDialogCancel className="text-xs rounded-xl border-slate-200" disabled={isDeleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteArticle}
                            disabled={isDeleting}
                            className="text-xs rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Article'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
