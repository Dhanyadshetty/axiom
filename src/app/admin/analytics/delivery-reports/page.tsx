'use client';

import React, { useState, useEffect } from 'react';
import { ReportShell } from '@/components/analytics/report-shell';
import { DeliveryReportsView } from '@/components/analytics/delivery-reports-view';
import { AnalyticsTabType, OtherEntityType, DeliveryReportsData } from '@/components/analytics/types';
import { getDeliveryReportsData } from '@/app/actions/analytics';
import { Loader2 } from 'lucide-react';

export default function DeliveryReportsPage() {
    const [activeTab, setActiveTab] = useState<AnalyticsTabType>('overview');
    const [otherEntity, setOtherEntity] = useState<OtherEntityType>('incoterms');
    const [data, setData] = useState<DeliveryReportsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDeliveryReportsData().then((res) => {
            if (res) setData(res);
            setLoading(false);
        });
    }, []);

    return (
        <ReportShell
            reportType="delivery-reports"
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
                <DeliveryReportsView data={data} />
            ) : (
                <div className="text-center py-12 text-muted-foreground text-xs">
                    Failed to load delivery reports data.
                </div>
            )}
        </ReportShell>
    );
}
