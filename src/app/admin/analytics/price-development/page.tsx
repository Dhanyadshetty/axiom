'use client';

import React, { useState, useEffect } from 'react';
import { ReportShell } from '@/components/analytics/report-shell';
import { PriceDevelopmentView } from '@/components/analytics/price-development-view';
import { AnalyticsTabType, OtherEntityType, PriceDevelopmentData } from '@/components/analytics/types';
import { getPriceDevelopmentData } from '@/app/actions/analytics';
import { Loader2 } from 'lucide-react';

export default function PriceDevelopmentPage() {
    const [activeTab, setActiveTab] = useState<AnalyticsTabType>('overview');
    const [otherEntity, setOtherEntity] = useState<OtherEntityType>('incoterms');
    const [data, setData] = useState<PriceDevelopmentData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPriceDevelopmentData().then((res) => {
            if (res) setData(res);
            setLoading(false);
        });
    }, []);

    return (
        <ReportShell
            reportType="price-development"
            activeTab={activeTab}
            onTabChange={setActiveTab}
            otherEntity={otherEntity}
            onOtherEntityChange={setOtherEntity}
        >
            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : data ? (
                <PriceDevelopmentView data={data} />
            ) : (
                <div className="text-center py-12 text-muted-foreground text-xs">
                    Failed to load price development data.
                </div>
            )}
        </ReportShell>
    );
}
