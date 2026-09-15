import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getArticle } from '@/app/actions/articles';
import {
    ArrowLeft,
    Package,
    Tag,
    Calendar,
    Weight,
    DollarSign,
    Building2,
    FileText,
    ExternalLink,
    Clock,
    Hash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ArticleDetailPage({ params }: PageProps) {
    const { id } = await params;
    const decodedId = decodeURIComponent(id);
    const res = await getArticle(decodedId);

    if (!res.success || !res.data) {
        return (
            <div className="flex h-full min-h-[60vh] flex-col items-center justify-center p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                    <Package className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-semibold text-slate-800">Article not found</h2>
                <p className="text-sm text-slate-500 mt-1 max-w-sm">
                    The requested article ({decodedId}) could not be located in the database.
                </p>
                <Link href="/articles" className="mt-4">
                    <Button variant="outline" className="gap-2 text-xs">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to Articles
                    </Button>
                </Link>
            </div>
        );
    }

    const article = res.data;

    return (
        <div className="flex flex-col h-full bg-slate-50/50 min-h-screen">
            {/* Top Navigation & Breadcrumb */}
            <div className="px-6 py-4 bg-white border-b border-slate-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/articles"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Articles</span>
                        </Link>
                        <span className="text-slate-300">/</span>
                        <span className="text-xs font-semibold text-slate-800">
                            {article.articleNumber}
                        </span>
                    </div>

                    <Link href="/articles">
                        <Button variant="ghost" size="sm" className="text-xs text-slate-600 hover:text-slate-900">
                            View all articles
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Main Content Body */}
            <div className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-6">
                {/* Header Banner */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                {article.articleNumber}
                            </h1>
                            {article.category && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                                    <Tag className="h-3 w-3 text-rose-500 fill-rose-100" />
                                    <span>{article.category}</span>
                                </span>
                            )}
                        </div>
                        <p className="text-sm font-medium text-slate-700">
                            {article.description || 'No description available'}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href="/articles">
                            <Button variant="outline" size="sm" className="text-xs gap-1.5 text-slate-700">
                                <ArrowLeft className="h-3.5 w-3.5" />
                                Back to list
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* General Specs */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <Package className="h-4 w-4 text-slate-500" />
                            <h2 className="text-sm font-semibold text-slate-800">Article Details</h2>
                        </div>

                        <dl className="grid grid-cols-2 gap-y-3.5 text-xs">
                            <div>
                                <dt className="text-slate-400 font-medium">Article Number</dt>
                                <dd className="text-slate-800 font-semibold mt-0.5">{article.articleNumber}</dd>
                            </div>

                            <div>
                                <dt className="text-slate-400 font-medium">CN Code (Customs)</dt>
                                <dd className="text-slate-800 font-medium mt-0.5">{article.cnCode || '—'}</dd>
                            </div>

                            <div className="col-span-2">
                                <dt className="text-slate-400 font-medium">Short Description</dt>
                                <dd className="text-slate-800 font-medium mt-0.5">{article.description || '—'}</dd>
                            </div>

                            <div className="col-span-2">
                                <dt className="text-slate-400 font-medium">Long Text</dt>
                                <dd className="text-slate-700 font-normal mt-0.5 whitespace-pre-wrap bg-slate-50 p-3 rounded-lg border border-slate-100 text-[11px] leading-relaxed">
                                    {article.longText || article.description || '—'}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* Commercial & Physical Attributes */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <DollarSign className="h-4 w-4 text-slate-500" />
                            <h2 className="text-sm font-semibold text-slate-800">Pricing & Logistics</h2>
                        </div>

                        <dl className="grid grid-cols-2 gap-y-3.5 text-xs">
                            <div>
                                <dt className="text-slate-400 font-medium">Budget Price</dt>
                                <dd className="text-slate-900 font-semibold text-sm mt-0.5">
                                    {article.budgetPrice != null ? `€${article.budgetPrice.toFixed(2)}` : '—'}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-slate-400 font-medium">Cost Model</dt>
                                <dd className="text-slate-800 font-medium mt-0.5">{article.costModel || 'Standard'}</dd>
                            </div>

                            <div>
                                <dt className="text-slate-400 font-medium">Net Weight</dt>
                                <dd className="text-slate-800 font-medium mt-0.5">
                                    {article.netWeight != null ? `${article.netWeight} ${article.netWeightUnit || ''}`.trim() : '—'}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-slate-400 font-medium">Supplier</dt>
                                <dd className="text-slate-800 font-medium mt-0.5">
                                    {article.supplierName || '—'}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-slate-400 font-medium">Created Date</dt>
                                <dd className="text-slate-600 font-normal mt-0.5">{article.createdAt || '—'}</dd>
                            </div>

                            <div>
                                <dt className="text-slate-400 font-medium">Last Updated</dt>
                                <dd className="text-slate-600 font-normal mt-0.5">{article.lastUpdated || '—'}</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
}
