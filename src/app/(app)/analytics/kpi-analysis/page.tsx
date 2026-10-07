'use client';

import React, { useState, useEffect } from 'react';
import { ReportShell } from '@/components/analytics/report-shell';
import { KPIAnalysisView } from '@/components/analytics/kpi-analysis-view';
import { AnalyticsTabType, OtherEntityType, VolumeKPIOverview } from '@/components/analytics/types';
import { getVolumeKPIOverview } from '@/app/actions/analytics';
import { Loader2 } from 'lucide-react';

export default function KPIAnalysisPage() {
    const [activeTab, setActiveTab] = useState<AnalyticsTabType>('overview');
    const [otherEntity, setOtherEntity] = useState<OtherEntityType>('incoterms');
    const [data, setData] = useState<VolumeKPIOverview | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getVolumeKPIOverview().then((res) => {
            if (res) setData(res);
            setLoading(false);
        });
    }, []);

    return (
        <ReportShell
            reportType="kpi-analysis"
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
                <KPIAnalysisView
                    data={data}
                    activeTab={activeTab}
                    otherEntity={otherEntity}
                />
            ) : (
                <div className="text-center py-12 text-muted-foreground text-xs">
                    Failed to load KPI Analysis data. Please try again.
                </div>
            )}
        </ReportShell>
    );
}
