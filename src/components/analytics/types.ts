export type AnalyticsReportType = 'kpi-analysis' | 'price-development' | 'delivery-reports' | 'currency-reports';

export type AnalyticsTabType = 'overview' | 'categories' | 'suppliers' | 'articles' | 'other';

export type OtherEntityType = 'incoterms' | 'payment-terms' | 'plants' | 'countries';

export interface SavedCustomView {
    id: string;
    name: string;
    access: string;
    createdBy: string;
    lastUpdated: string;
    reportType: AnalyticsReportType;
    filters?: Record<string, any>;
}

export interface VolumeKPIOverview {
    invoiceVolume: number;
    priorInvoiceVolume: number;
    invoiceVolumeChange: number;
    activeCategories: number;
    priorActiveCategories: number;
    activeCategoriesChange: number;
    activeSuppliers: number;
    priorActiveSuppliers: number;
    activeSuppliersChange: number;
    activeArticles: number;
    priorActiveArticles: number;
    activeArticlesChange: number;
    currentYear: number;
    priorYear: number;
    yearlyTrend: Array<{
        year: string;
        invoiceVolume: number;
        orderVolume: number;
        invoiceCount: number;
        supplierCount: number;
    }>;
    categoryBreakdown: Array<{
        category: string;
        volume: number;
        sharePercent: number;
        articleCount: number;
        supplierCount: number;
        yoyGrowth: number;
    }>;
    supplierBreakdown: Array<{
        id: string;
        name: string;
        country: string;
        volume: number;
        sharePercent: number;
        invoiceCount: number;
        status: string;
    }>;
    articleBreakdown: Array<{
        sku: string;
        name: string;
        category: string;
        unitPrice: number;
        totalVolume: number;
        supplierName: string;
    }>;
    otherEntities: {
        incoterms: Array<{ name: string; volume: number; percentage: number; count: number }>;
        paymentTerms: Array<{ name: string; volume: number; percentage: number; count: number }>;
        plants: Array<{ name: string; volume: number; percentage: number; count: number }>;
        countries: Array<{ name: string; volume: number; percentage: number; count: number }>;
    };
}

export interface PriceDevelopmentData {
    priceIndexChange: number;
    materialInflationRate: number;
    topReductionsCount: number;
    priceVolatilityIndex: number;
    priceTrend: Array<{
        period: string;
        indexValue: number;
        baseline: number;
        rawMaterials: number;
        electronics: number;
        mechanical: number;
    }>;
    articlePriceMovements: Array<{
        sku: string;
        name: string;
        category: string;
        currentPrice: number;
        priorPrice: number;
        variancePercent: number;
        trend: 'up' | 'down' | 'stable';
        supplierName: string;
    }>;
}

export interface DeliveryReportsData {
    otifRate: number;
    priorOtifRate: number;
    otifChange: number;
    averageDelayDays: number;
    priorAverageDelayDays: number;
    delayChange: number;
    deliveredOrdersCount: number;
    discrepancyRate: number;
    deliveryTrend: Array<{
        month: string;
        otifRate: number;
        onTimeCount: number;
        delayedCount: number;
    }>;
    supplierDeliveryPerformance: Array<{
        id: string;
        name: string;
        otifRate: number;
        avgDelayDays: number;
        ordersDelivered: number;
        riskLevel: 'low' | 'medium' | 'high';
        status: string;
    }>;
}

export interface CurrencyReportsData {
    baseCurrencySpend: number;
    foreignCurrencySpend: number;
    fxExposurePercent: number;
    hedgingCoveragePercent: number;
    currencyBreakdown: Array<{
        currency: string;
        spend: number;
        sharePercent: number;
        orderCount: number;
        volatilityImpact: number;
    }>;
    currencyTrend: Array<{
        month: string;
        EUR: number;
        USD: number;
        INR: number;
        GBP: number;
        CNY: number;
    }>;
}
