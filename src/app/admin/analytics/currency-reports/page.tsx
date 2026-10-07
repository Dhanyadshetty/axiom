'use client';

import React, { useState, useEffect } from 'react';
import { ReportShell } from '@/components/analytics/report-shell';
import { CurrencyReportsView } from '@/components/analytics/currency-reports-view';
import { AnalyticsTabType, OtherEntityType, CurrencyReportsData } from '@/components/analytics/types';
import { getCurrencyReportsData } from '@/app/actions/analytics';
import { Loader2 } from 'lucide-react';

export default function CurrencyReportsPage() {
    const [activeTab, setActiveTab] = useState<AnalyticsTabType>('overview');
    const [otherEntity, setOtherEntity] = useState<OtherEntityType>('incoterms');
    const [data, setData] = useState<CurrencyReportsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCurrencyReportsData().then((res) => {
            if (res) setData(res);
            setLoading(false);
        });
    }, []);

    return (
        <ReportShell
            reportType="currency-reports"
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
                <CurrencyReportsView data={data} />
            ) : (
                <div className="text-center py-12 text-muted-foreground text-xs">
                    Failed to load currency reports data.
                </div>
            )}
        </ReportShell>
    );
}
