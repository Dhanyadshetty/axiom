import Link from 'next/link';
import { getArticle } from '@/app/actions/articles';
import { ArticleDetailView } from '@/components/articles/article-detail-view';
import { ArrowLeft, Package } from 'lucide-react';
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
            <div className="flex h-full min-h-[60vh] flex-col items-center justify-center p-6 text-center bg-white">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                    <Package className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-semibold text-slate-800">Article not found</h2>
                <p className="text-sm text-slate-500 mt-1 max-w-sm">
                    The requested article ({decodedId}) could not be located in the database.
                </p>
                <Link href="/articles" className="mt-4">
                    <Button variant="outline" className="gap-2 text-xs rounded-xl">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to Articles
                    </Button>
                </Link>
            </div>
        );
    }

    return <ArticleDetailView article={res.data} />;
}
