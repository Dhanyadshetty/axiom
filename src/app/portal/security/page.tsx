'use client'

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { useLanguage } from "@/components/i18n/language-provider";
import { t } from "@/lib/i18n";

export default function PortalSecurityStatus() {
    const { data: session, status } = useSession();
    const { language } = useLanguage();
    const tp = t(language, "portal");

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    if (status === 'unauthenticated') {
        redirect('/login');
    }

    if (session?.user?.role !== 'supplier') {
        redirect('/');
    }

    const isTwoFactorEnabled = session?.user?.isTwoFactorEnabled ?? false;

    return (
        <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{tp.securityTitle}</h1>
                <p className="text-muted-foreground mt-2">{tp.securitySubtitle}</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <ShieldCheck className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle>{tp.twoFactorTitle}</CardTitle>
                                <CardDescription>{tp.twoFactorSubtitle}</CardDescription>
                            </div>
                        </div>
                        <Badge variant={isTwoFactorEnabled ? 'default' : 'secondary'}>
                            {isTwoFactorEnabled ? tp.enabled : tp.disabled}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isTwoFactorEnabled ? (
                        <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/30">
                            <p className="text-sm text-green-700">
                                {tp.twoFactorEnabledBody}
                            </p>
                        </div>
                    ) : (
                        <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/30">
                            <div className="flex gap-3">
                                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-amber-700">
                                    {tp.twoFactorRequiredBody}
                                </p>
                            </div>
                        </div>
                    )}
                        <p className="text-sm text-muted-foreground">
                            {tp.twoFactorExtraLayer}
                        </p>
                </CardContent>
            </Card>
        </div>
    );
}
