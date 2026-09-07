'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { syncInternalBenchmarks } from "@/app/actions/cost-intelligence";
import { toast } from "sonner";
import { useLanguage } from "@/components/i18n/language-provider";
import { t } from "@/lib/i18n";

export function RefreshBenchmarksButton() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const { language } = useLanguage();
    const ts = t(language, "sourcing");

    const handleRefresh = () => {
        startTransition(async () => {
            try {
                const result = await syncInternalBenchmarks();
                if (result.success) {
                    toast.success(ts.benchmarkRefreshed, {
                        description: `Updated ${result.categoriesUpdated} category benchmarks from internal history.`
                    });
                    router.refresh();
                    return;
                }

                toast.error(result.message || ts.noBenchmarkData);
            } catch {
                toast.error(ts.benchmarkRefreshFailed);
            }
        });
    };

    return (
        <Button
            variant="outline"
            className="gap-2"
            onClick={handleRefresh}
            disabled={isPending}
        >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {isPending ? ts.refreshing : ts.refreshBenchmarks}
        </Button>
    );
}
