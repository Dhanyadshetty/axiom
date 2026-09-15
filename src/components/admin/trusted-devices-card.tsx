'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Laptop, Smartphone, Monitor, Shield, Trash2, RefreshCw, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import {
    getTrustedDevices,
    revokeTrustedDeviceAction,
    revokeAllTrustedDevicesAction,
} from '@/app/actions/auth';
import type { UserTrustedDeviceSummary } from '@/lib/trusted-device';
import { useLanguage } from '@/components/i18n/language-provider';
import { t } from '@/lib/i18n';

interface TrustedDevicesCardProps {
    className?: string;
}

export function TrustedDevicesCard({ className }: TrustedDevicesCardProps) {
    const { language } = useLanguage();
    const tp = t(language, 'admin');

    const [devices, setDevices] = useState<UserTrustedDeviceSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [revokingId, setRevokingId] = useState<string | null>(null);
    const [isRevokingAll, setIsRevokingAll] = useState(false);

    const loadDevices = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await getTrustedDevices();
            if (res.success && res.devices) {
                setDevices(res.devices);
            }
        } catch (err) {
            console.error('Failed to load trusted devices:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDevices();
    }, [loadDevices]);

    const handleRevoke = async (deviceId: string) => {
        setRevokingId(deviceId);
        try {
            const res = await revokeTrustedDeviceAction(deviceId);
            if (res.success) {
                toast.success(tp.deviceRevokedSuccess || 'Device revoked successfully');
                setDevices((prev) => prev.filter((d) => d.id !== deviceId));
            } else {
                toast.error(res.error || 'Failed to revoke device');
            }
        } catch (err) {
            toast.error('An unexpected error occurred');
        } finally {
            setRevokingId(null);
        }
    };

    const handleRevokeAll = async () => {
        if (!confirm('Are you sure you want to revoke all trusted devices? You will be prompted for 2FA on your next login from all browsers.')) {
            return;
        }

        setIsRevokingAll(true);
        try {
            const res = await revokeAllTrustedDevicesAction();
            if (res.success) {
                toast.success(tp.allDevicesRevokedSuccess || 'All trusted devices revoked');
                setDevices([]);
            } else {
                toast.error(res.error || 'Failed to revoke all devices');
            }
        } catch (err) {
            toast.error('An unexpected error occurred');
        } finally {
            setIsRevokingAll(false);
        }
    };

    const getDeviceIcon = (deviceName: string) => {
        if (/iOS|Android/i.test(deviceName)) return Smartphone;
        if (/macOS|Windows|Linux/i.test(deviceName)) return Laptop;
        return Monitor;
    };

    const formatDate = (date: Date | string | null) => {
        if (!date) return 'N/A';
        const d = new Date(date);
        return d.toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Shield className="h-4 w-4 text-emerald-600" />
                        {tp.trustedDevicesTitle || 'Trusted Devices'}
                    </CardTitle>
                    <CardDescription className="text-xs">
                        {tp.trustedDevicesDesc || 'Devices remembered for 30-day two-factor authentication bypass.'}
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={loadDevices}
                        disabled={isLoading}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        title="Refresh"
                    >
                        <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                    </Button>
                    {devices.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRevokeAll}
                            disabled={isRevokingAll || isLoading}
                            className="h-8 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40"
                        >
                            <Trash2 size={12} className="mr-1.5" />
                            {tp.revokeAllDevicesButton || 'Revoke All'}
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {isLoading && devices.length === 0 ? (
                    <div className="flex items-center justify-center py-6 text-xs text-muted-foreground">
                        <RefreshCw size={16} className="animate-spin mr-2" />
                        Loading trusted devices...
                    </div>
                ) : devices.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">
                        <Shield className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                        <p className="text-xs font-medium">{tp.noTrustedDevices || 'No trusted devices registered yet.'}</p>
                        <p className="text-[11px] text-muted-foreground/80 mt-1">
                            When logging in with 2FA, check &quot;Remember this device&quot; to skip verification for 30 days.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-border/60 rounded-xl border bg-card/60">
                        {devices.map((device) => {
                            const Icon = getDeviceIcon(device.deviceName);
                            const isCurrent = device.isCurrentDevice;

                            return (
                                <div
                                    key={device.id}
                                    className="flex items-center justify-between p-3.5 transition-colors hover:bg-muted/30"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                                            isCurrent
                                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                                : 'border-border bg-muted/50 text-muted-foreground'
                                        }`}>
                                            <Icon size={18} />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-semibold text-foreground">
                                                    {device.deviceName}
                                                </p>
                                                {isCurrent && (
                                                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                                        <CheckCircle2 size={10} />
                                                        {tp.currentDeviceBadge || 'Current Device'}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Clock size={11} />
                                                    {tp.deviceLastUsed || 'Last active'}: {formatDate(device.lastUsedAt)}
                                                </span>
                                                <span>•</span>
                                                <span>
                                                    {tp.deviceExpires || 'Expires'}: {formatDate(device.expiresAt)}
                                                </span>
                                                {device.ipAddress && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="font-mono text-[10px]">{device.ipAddress}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRevoke(device.id)}
                                        disabled={revokingId === device.id}
                                        className="h-8 text-xs text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                                    >
                                        {revokingId === device.id ? (
                                            <RefreshCw size={12} className="animate-spin" />
                                        ) : (
                                            tp.revokeDeviceButton || 'Revoke'
                                        )}
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
