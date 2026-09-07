'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { requestPasswordReset } from '@/app/actions/password-reset';
import { useLanguage } from "@/components/i18n/language-provider";
import { t } from "@/lib/i18n";

export default function ForgotPasswordPage() {
    const { language } = useLanguage();
    const ta = t(language, "auth");
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await requestPasswordReset(email);

        setLoading(false);
        if (result.success) {
            setSubmitted(true);
        } else {
            setError(result.error || 'Failed to request password reset');
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-background to-primary/5">
                <Card className="w-full max-w-lg border-blue-500/30 bg-blue-500/5">
                    <CardContent className="p-12 text-center space-y-6">
                        <div className="mx-auto w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <CheckCircle2 className="h-10 w-10 text-blue-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-2">{ta.forgotPasswordCheckEmailTitle}</h2>
                            <p className="text-muted-foreground">
                                {ta.forgotPasswordCheckEmailBody}
                            </p>
                            <p className="text-xs text-muted-foreground/60 mt-4">
                                {ta.forgotPasswordLinkExpiry}
                            </p>
                        </div>
                        <Link href="/login">
                            <Button className="w-full">{ta.backToLogin}</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-background to-primary/5">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-2 pb-6 border-b">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle>{ta.forgotPasswordTitle}</CardTitle>
                            <CardDescription>{ta.forgotPasswordSubtitle}</CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="p-6 space-y-6">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm flex gap-2">
                                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">
                                {ta.forgotPasswordEmailLabel}
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder={ta.forgotPasswordEmailPlaceholder}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                                className="bg-background/50"
                            />
                            <p className="text-xs text-muted-foreground">
                                {ta.forgotPasswordEnterEmail}
                            </p>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading || !email.trim()}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {ta.forgotPasswordSending}
                                </>
                            ) : (
                                ta.forgotPasswordSendLink
                            )}
                        </Button>

                        <div className="pt-2">
                            <Link href="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
                                <ArrowLeft className="h-4 w-4" />
                                {ta.backToLogin}
                            </Link>
                        </div>
                    </CardContent>
                </form>
            </Card>
        </div>
    );
}
