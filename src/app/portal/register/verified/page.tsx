'use client'

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/i18n/language-provider";
import { t } from "@/lib/i18n";

export default function VerifiedPage() {
    const { language } = useLanguage();
    const tp = t(language, "portal");
    const router = useRouter();
    const searchParams = useSearchParams();
    const error = searchParams.get('error');
    const status: 'success' | 'error' = error ? 'error' : 'success';
    const message = error || tp.verifiedSuccessTitle;

    if (status === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-background to-primary/5">
                <Card className="w-full max-w-lg border-red-500/30 bg-red-500/5">
                    <CardContent className="p-12 text-center space-y-6">
                        <div className="mx-auto w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
                            <AlertCircle className="h-10 w-10 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold">{tp.verifiedFailedTitle}</h2>
                        <p className="text-muted-foreground">{message}</p>
                        <Link href="/portal/register">
                            <Button className="w-full">{tp.tryAgain}</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-background to-primary/5">
            <Card className="w-full max-w-lg border-green-500/30 bg-green-500/5">
                <CardContent className="p-12 text-center space-y-6">
                    <div className="mx-auto w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                        <CheckCircle2 className="h-10 w-10 text-green-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold mb-2">{tp.verifiedSuccessTitle}</h2>
                        <p className="text-muted-foreground mb-4">
                            {tp.verifiedSuccessBody}
                        </p>
                        <p className="text-xs text-muted-foreground/60">
                            {tp.verifiedReviewTime}
                        </p>
                    </div>
                    <Link href="/portal/register">
                        <Button variant="outline" className="w-full">{tp.backToRegistration}</Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}
