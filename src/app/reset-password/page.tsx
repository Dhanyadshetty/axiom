'use client'

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { resetPassword } from '@/app/actions/password-reset';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from "@/components/i18n/language-provider";
import { t } from "@/lib/i18n";

function getPasswordStrength(password: string) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;
    return Math.ceil((strength / 6) * 100);
}

function validatePassword(password: string, ta: Record<string, string>) {
    const errors = [];
    if (password.length < 8) errors.push(ta.resetPasswordAtLeast8);
    if (!/[A-Z]/.test(password)) errors.push(ta.resetPasswordUppercase);
    if (!/[a-z]/.test(password)) errors.push(ta.resetPasswordLowercase);
    if (!/\d/.test(password)) errors.push(ta.resetPasswordNumber);
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push(ta.resetPasswordSpecial);
    return errors;
}

export default function ResetPasswordPage() {
    const { language } = useLanguage();
    const ta = t(language, "auth");
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const tokenError = !token;

    const passwordErrors = validatePassword(password, ta);
    const passwordStrength = getPasswordStrength(password);
    const isPasswordValid = passwordErrors.length === 0;
    const passwordsMatch = password && confirmPassword && password === confirmPassword;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        if (!isPasswordValid) {
            setError(ta.resetPasswordRequirements);
            return;
        }

        if (!passwordsMatch) {
            setError(ta.resetPasswordMismatch);
            return;
        }

        if (!token) {
            setError(ta.resetPasswordTokenMissing);
            return;
        }

        setLoading(true);
        const result = await resetPassword(token, password);
        setLoading(false);

        if (result.success) {
            setSuccess(true);
        } else {
            setError(result.error || 'Failed to reset password');
        }
    };

    if (tokenError) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-background to-primary/5">
                <Card className="w-full max-w-lg border-red-500/30 bg-red-500/5">
                    <CardContent className="p-12 text-center space-y-6">
                        <div className="mx-auto w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
                            <AlertCircle className="h-10 w-10 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold">Invalid Reset Link</h2>
                        <p className="text-muted-foreground">
                            {ta.resetPasswordInvalidBody}
                        </p>
                        <Link href="/forgot-password">
                            <Button className="w-full">{ta.resetPasswordRequestNew}</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-background to-primary/5">
                <Card className="w-full max-w-lg border-green-500/30 bg-green-500/5">
                    <CardContent className="p-12 text-center space-y-6">
                        <div className="mx-auto w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                            <CheckCircle2 className="h-10 w-10 text-green-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-2">{ta.resetPasswordSuccessTitle}</h2>
                            <p className="text-muted-foreground">
                                {ta.resetPasswordSuccessBody}
                            </p>
                        </div>
                        <Link href="/login">
                            <Button className="w-full">{ta.resetPasswordGoToLogin}</Button>
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
                            <Lock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle>{ta.resetPasswordTitle}</CardTitle>
                            <CardDescription>{ta.resetPasswordSubtitle}</CardDescription>
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
                            <Label htmlFor="password" className="text-sm font-medium">
                                {ta.resetPasswordNewLabel}
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder={ta.resetPasswordNewPlaceholder}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                    className="bg-background/50 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>

                            {password && (
                                <div className="space-y-2">
                                    <Progress value={passwordStrength} className="h-1" />
                                    <p className="text-xs text-muted-foreground">
                                        {ta.resetPasswordStrength.replace('{strength}', String(passwordStrength))}
                                    </p>
                                    {passwordErrors.length > 0 && (
                                        <ul className="text-xs text-muted-foreground space-y-1">
                                            {passwordErrors.map((error, i) => (
                                                <li key={i} className="flex gap-2">
                                                    <span>•</span> {error}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-sm font-medium">
                                {ta.resetPasswordConfirmLabel}
                            </Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder={ta.resetPasswordConfirmPlaceholder}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={loading}
                                    className="bg-background/50 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {confirmPassword && !passwordsMatch && (
                                <p className="text-xs text-red-500">{ta.resetPasswordMismatch}</p>
                            )}
                            {passwordsMatch && (
                                <p className="text-xs text-green-500">{ta.passwordsMatch}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading || !isPasswordValid || !passwordsMatch}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {ta.resetPasswordResetting}
                                </>
                            ) : (
                                ta.resetPasswordTitle
                            )}
                        </Button>

                        <div className="pt-2">
                            <Link href="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
                                {ta.backToLogin}
                            </Link>
                        </div>
                    </CardContent>
                </form>
            </Card>
        </div>
    );
}
