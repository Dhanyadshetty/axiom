'use client'

import React, { useCallback, useEffect, useState, useTransition } from "react";
import { flushAuthCache, getSettings, updateSettings } from "@/app/actions/settings";
import { ClearInventoryButton } from "@/components/admin/clear-inventory-button";
import { ResetDatabaseButton } from "@/components/admin/reset-database-button";
import { SeedDemoDataButton } from "@/components/admin/seed-demo-data-button";
import { TwoFactorSetup } from "@/components/admin/two-factor-setup";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { getSuggestedBookRateCurrencies, parseFinanceSettings, type FinanceSettings } from "@/lib/finance";
import { useLanguage } from "@/components/i18n/language-provider";
import { t } from "@/lib/i18n";
import {
    AlertTriangle,
    Cpu,
    Landmark,
    Loader2,
    Lock,
    Shield,
    ShieldCheck,
    Unlock,
} from "lucide-react";
import { toast } from "sonner";

type SettingsState = {
    role?: string;
    platformName?: string;
    defaultCurrency?: string;
    isSettingsLocked?: string;
    updatedAt?: string | Date;
    isTwoFactorEnabled?: boolean;
    finance?: FinanceSettings;
    aiCredentialState?: {
        hasCredentials: boolean;
        databaseKeyCount: number;
        environmentKeyCount: number;
        totalKeyCount: number;
        source: string;
    };
    financeReadiness?: {
        activeCurrencies: string[];
        triCurrencyBreathingRoom: boolean;
        bookRateCoverage: string[];
    };
};

export default function AdminSettingsPage() {
    const { language } = useLanguage();
    const ta = t(language, "admin");
    const [isPending, startTransition] = useTransition();
    const [settings, setSettings] = useState<SettingsState | null>(null);
    const [isLocked, setIsLocked] = useState(true);
    const [accessDenied, setAccessDenied] = useState(false);

    const loadSettings = useCallback(async () => {
        const data = await getSettings();
        if (data.role !== 'admin') {
            setAccessDenied(true);
            return;
        }

        setSettings(data);
        setIsLocked(data.isSettingsLocked === 'yes');
        setAccessDenied(false);
    }, []);

    useEffect(() => {
        queueMicrotask(() => {
            void loadSettings();
        });
    }, [loadSettings]);

    async function handleSubmit(formData: FormData) {
        startTransition(async () => {
            const result = await updateSettings(formData);
            if (result.success) {
                toast.success("Admin settings updated successfully.");
                await loadSettings();
            } else {
                toast.error(result.error || "Failed to update settings");
            }
        });
    }

    if (accessDenied) {
        return (
            <div className="p-4 lg:p-8 flex items-center justify-center h-screen">
                <div className="text-center space-y-2">
                    <Shield className="h-10 w-10 text-red-500 mx-auto" />
                    <p className="font-bold text-red-600 uppercase text-sm">{ta.adminAccessRequired}</p>
                    <p className="text-muted-foreground text-xs">{ta.onlyAdminsSettings}</p>
                </div>
            </div>
        );
    }

    if (!settings) {
        return (
            <div className="p-4 lg:p-8 flex items-center justify-center h-screen">
                <Loader2 className="animate-spin" />
            </div>
        );
    }

    const aiCredentialState = settings.aiCredentialState ?? {
        hasCredentials: false,
        databaseKeyCount: 0,
        environmentKeyCount: 0,
        totalKeyCount: 0,
        source: "Not configured",
    };
    const financeReadiness = settings.financeReadiness ?? {
        activeCurrencies: [],
        triCurrencyBreathingRoom: false,
        bookRateCoverage: [],
    };
    const finance = settings.finance ?? parseFinanceSettings(null, settings.defaultCurrency || 'INR');
    const bookRateCurrencies = getSuggestedBookRateCurrencies(settings.defaultCurrency || 'INR', finance.reportingCurrency);
    const formKey = `${settings.updatedAt ?? 'settings'}:${settings.defaultCurrency ?? 'INR'}:${finance.reportingCurrency}`;

    return (
        <div className="flex min-h-full flex-col bg-muted/40 p-4 lg:p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">{ta.adminSettings}</h1>
                    <p className="text-muted-foreground mt-1">{ta.secureConfiguration}</p>
                </div>
            </div>

            <form key={formKey} action={handleSubmit} className="grid gap-6">
                <input type="hidden" name="platformName" value={settings.platformName || "Axiom Procurement Intelligence"} />

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-amber-600" />
                                <CardTitle>{ta.configurationGuardrail}</CardTitle>
                            </div>
                            <CardDescription>{ta.preventAccidentalChanges}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg border">
                            <Label htmlFor="isSettingsLocked" className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                {isLocked ? <Lock size={14} className="text-red-500" /> : <Unlock size={14} className="text-green-500" />}
                                {ta.settingsLock}
                            </Label>
                            <input
                                type="checkbox"
                                id="isSettingsLocked"
                                name="isSettingsLocked"
                                checked={isLocked}
                                onChange={(event) => setIsLocked(event.target.checked)}
                                className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            {ta.lockEnabledNote}
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-red-500" />
                            <CardTitle>{ta.securityAccess}</CardTitle>
                        </div>
                        <CardDescription>{ta.authenticationPolicy}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="rounded-xl border bg-background/80 p-4">
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{ta.sessionPolicy}</p>
                            <p className="mt-2 text-sm font-semibold text-foreground">{ta.serverSessionWindow}</p>
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                {ta.sessionDurationEnforced}
                            </p>
                            </div>
                            <div className="rounded-xl border bg-background/80 p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{ta.twoFactorAuthentication}</p>
                                <div className="mt-3">
                                    <TwoFactorSetup
                                        isEnabled={!!settings.isTwoFactorEnabled}
                                        onStatusChange={(enabled) =>
                                            setSettings((previous) => previous ? { ...previous, isTwoFactorEnabled: enabled } : previous)
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                {ta.flushAuthCache}
                            </Label>
                            <p className="text-[11px] text-muted-foreground leading-relaxed bg-muted/40 rounded-md p-3 border">
                                {ta.flushAuthCacheNote}
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full text-red-500 hover:text-red-600 hover:bg-red-50/50 border-red-100"
                                onClick={async () => {
                                    const result = await flushAuthCache();
                                    if (result.success) {
                                        toast.success(ta.authorizationCacheFlushed);
                                    } else {
                                        toast.error(result.error);
                                    }
                                }}
                            >
                                {ta.flushAuthCache}
                            </Button>
                        </div>

                        <div className="rounded-xl border bg-background/80 p-4">
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{ta.deploymentBoundary}</p>
                            <p className="mt-2 text-sm font-semibold text-foreground">{ta.identitySessionControls}</p>
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                {ta.deploymentBoundaryBody}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Landmark className="h-5 w-5 text-blue-600" />
                            <CardTitle>{ta.financeConsole}</CardTitle>
                        </div>
                        <CardDescription>{ta.financeConsoleDesc}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                            <div className="grid gap-2">
                                <Label htmlFor="defaultCurrency">{ta.functionalCurrency}</Label>
                                <select
                                    id="defaultCurrency"
                                    name="defaultCurrency"
                                    defaultValue={settings.defaultCurrency || 'INR'}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    {['INR', 'USD', 'EUR', 'GBP', 'HUF', 'CNY', 'JPY', 'MXN'].map((currency) => (
                                        <option key={currency} value={currency}>{currency}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="reportingCurrency">{ta.reportingCurrency}</Label>
                                <select
                                    id="reportingCurrency"
                                    name="reportingCurrency"
                                    defaultValue={finance.reportingCurrency}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    {['USD', 'EUR', 'GBP', 'INR', 'HUF', 'CNY', 'JPY', 'MXN'].map((currency) => (
                                        <option key={currency} value={currency}>{currency}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="bookRatePeriod">{ta.bookRateCadence}</Label>
                                <select
                                    id="bookRatePeriod"
                                    name="bookRatePeriod"
                                    defaultValue={finance.bookRatePeriod}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="monthly">{ta.bookRatePeriodMonthly}</option>
                                    <option value="quarterly">{ta.bookRatePeriodQuarterly}</option>
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="bookRateEffectiveDate">{ta.effectiveFrom}</Label>
                                <input
                                    id="bookRateEffectiveDate"
                                    name="bookRateEffectiveDate"
                                    type="date"
                                    defaultValue={finance.bookRateEffectiveDate}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {bookRateCurrencies.map((currency) => (
                                <div key={currency} className="rounded-xl border bg-background/80 p-4">
                                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                                        {currency} book rate
                                    </p>
                                    <Label htmlFor={`bookRate_${currency}`} className="mt-3 block text-sm font-medium">
                                        1 {currency} in {finance.reportingCurrency}
                                    </Label>
                                    <input
                                        id={`bookRate_${currency}`}
                                        name={`bookRate_${currency}`}
                                        type="number"
                                        step="0.000001"
                                        min="0"
                                        disabled={currency === finance.reportingCurrency}
                                        defaultValue={currency === finance.reportingCurrency ? 1 : finance.bookRates[currency] ?? ''}
                                        className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-muted"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-xl border bg-background/80 p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Reporting Formula</p>
                                <p className="mt-2 text-sm font-semibold text-foreground">Local spend x fixed book rate = {finance.reportingCurrency} reporting view</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Use fixed period rates so savings do not drift with daily FX noise during audit review.
                                </p>
                            </div>
                            <div className="rounded-xl border bg-background/80 p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Live FX Snapshot</p>
                                <p className="mt-2 text-sm font-semibold text-foreground">
                                    {finance.liveRates?.date || "No live rates captured yet"}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Daily ECB feed stays intact and now coexists with the CFO book-rate layer instead of overwriting it.
                                </p>
                            </div>
                            <div className="rounded-xl border bg-background/80 p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">App Lens</p>
                                <p className="mt-2 text-sm font-semibold text-foreground">Header toggle switches between local and reporting currency views</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Internal users can flip from user-local currency conversion to fixed reporting-book rates without changing source data.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-xl border bg-background/80 p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Active Ledger Currencies</p>
                                <p className="mt-2 text-sm font-semibold text-foreground">
                                    {financeReadiness.activeCurrencies.length > 0 ? financeReadiness.activeCurrencies.join(", ") : "No posted invoice currencies yet"}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Original invoice currencies stay intact instead of being flattened into one regional book.
                                </p>
                            </div>
                            <div className="rounded-xl border bg-background/80 p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">USD / EUR / GBP Coverage</p>
                                <p className="mt-2 text-sm font-semibold text-foreground">
                                    {financeReadiness.bookRateCoverage.length > 0 ? financeReadiness.bookRateCoverage.join(", ") : "Book rates missing"}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Book-rate coverage for the main global reporting currencies used in executive rollups.
                                </p>
                            </div>
                            <div className="rounded-xl border bg-background/80 p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Global Breath Test</p>
                                <p className="mt-2 text-sm font-semibold text-foreground">
                                    {financeReadiness.triCurrencyBreathingRoom ? "USD, EUR, and GBP pathways are covered" : "Global tri-currency coverage is still incomplete"}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    This is the quickest check for whether finance is behaving like a global system rather than a single-currency shell.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-4 xl:grid-cols-4">
                            <div className="rounded-xl border bg-background/80 p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Source of Truth</p>
                                <p className="mt-2 text-sm font-semibold text-foreground">Posted invoices keep their original currency.</p>
                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                    Switching the app lens never rewrites invoice, order, or contract records. It only changes how the numbers are displayed and rolled up.
                                </p>
                            </div>
                            <div className="rounded-xl border bg-background/80 p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">User-Local FX Lens</p>
                                <p className="mt-2 text-sm font-semibold text-foreground">Best for buyers, plant users, and regional operators.</p>
                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                    The header toggle converts display values into the user&apos;s operating currency using the local view. This helps day-to-day review without flattening source records.
                                </p>
                            </div>
                            <div className="rounded-xl border bg-background/80 p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Reporting-Book Lens</p>
                                <p className="mt-2 text-sm font-semibold text-foreground">Best for finance, controllers, and executive rollups.</p>
                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                    Book view uses fixed {finance.bookRatePeriod} rates into {finance.reportingCurrency}. It keeps savings and spend reporting stable across the accounting period.
                                </p>
                            </div>
                            <div className="rounded-xl border bg-background/80 p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Operational Bottleneck</p>
                                <p className="mt-2 text-sm font-semibold text-foreground">
                                    {financeReadiness.bookRateCoverage.length > 0 ? "Keep book rates fresh before using global totals." : "Do not trust global totals until book rates are loaded."}
                                </p>
                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                    If book rates are stale or missing, the safest fallback is to stay in source-currency or local views for operational decisions and refresh finance settings before executive reporting.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Cpu className="h-5 w-5 text-amber-600" />
                            <CardTitle>{ta.aiCredentialStatus}</CardTitle>
                        </div>
                        <CardDescription>{ta.aiCredentialVisible}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className={aiCredentialState.hasCredentials ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}>
                                {aiCredentialState.hasCredentials ? ta.aiReady : ta.aiCredentialsMissing}
                            </Badge>
                            <Badge variant="outline" className="border-stone-200 bg-stone-50 text-stone-700">
                                {aiCredentialState.totalKeyCount} {aiCredentialState.totalKeyCount === 1 ? ta.credentialSourcesDetected : ta.credentialSourcesDetectedPlural}
                            </Badge>
                            <Badge variant="outline" className="border-stone-200 bg-white text-stone-600">
                                {aiCredentialState.source}
                            </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="rounded-xl border bg-background/80 p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{ta.secureStorage}</p>
                                <p className="mt-2 text-2xl font-black text-foreground">{aiCredentialState.databaseKeyCount}</p>
                                <p className="mt-1 text-xs text-muted-foreground">{ta.credentialRecordsStored}</p>
                            </div>
                            <div className="rounded-xl border bg-background/80 p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{ta.environmentSources}</p>
                                <p className="mt-2 text-2xl font-black text-foreground">{aiCredentialState.environmentKeyCount}</p>
                                <p className="mt-1 text-xs text-muted-foreground">{ta.serverEnvVars}</p>
                            </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            {ta.sensitiveValuesHidden}
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow border-red-500/20 bg-red-50/5">
                    <CardHeader>
                        <div className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            <CardTitle className="font-black uppercase tracking-tighter">{ta.systemMaintenance}</CardTitle>
                        </div>
                        <CardDescription>{ta.resetDemoData}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <h4 className="text-sm font-bold text-red-700 uppercase tracking-tight">{ta.workspaceCleanup}</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {ta.stripDemoData}
                                </p>
                            </div>
                            <div className="grid gap-3">
                                <SeedDemoDataButton />
                                <ClearInventoryButton />
                                <ResetDatabaseButton />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-3 mt-4">
                    <Button type="button" variant="ghost" onClick={loadSettings}>{ta.reset}</Button>
                    <Button type="submit" disabled={isPending} className="min-w-[160px] bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-100 disabled:opacity-50">
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {ta.applying}
                            </>
                        ) : (
                            ta.applyChanges
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
