'use client';

import { useLanguage } from "@/components/i18n/language-provider";
import { t } from "@/lib/i18n";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export default function SignoutPage() {
    const { language } = useLanguage();
    const tc = t(language, "common");
    const ta = t(language, "auth");

    return (
        <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_bottom_right,_rgba(249,115,22,0.25)_0%,_transparent_60%),linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] px-4 py-12">
            <div className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] bg-gradient-to-br from-orange-400/30 via-transparent to-transparent rounded-full blur-3xl" />
            <div className="relative z-10 w-full max-w-md">
                <div className="rounded-2xl border border-white/70 bg-white/95 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm">
                    <div className="mb-6 flex items-center justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
                            <ShieldCheck className="h-8 w-8 text-emerald-600" />
                        </div>
                    </div>

                    <div className="text-center">
                        <h1 className="mb-2 text-2xl font-black tracking-tight text-slate-900">
                            {tc.logout || "Signed Out"}
                        </h1>
                        <p className="mb-8 text-lg font-semibold text-slate-700">
                            {ta.signedOutSuccessfully || "You have been successfully logged out."}
                        </p>

                        <Link href="/login">
                            <Button className="w-full h-11 rounded-lg bg-black text-white font-semibold hover:bg-slate-800 transition-colors">
                                {ta.backToLogin || "Back to Login"}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}