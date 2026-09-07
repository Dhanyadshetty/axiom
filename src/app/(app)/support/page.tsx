'use client'

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LifeBuoy, Mail, ChevronDown, ChevronUp, ShieldCheck, BookOpen } from "lucide-react";
import { useSession } from "next-auth/react";
import { canManageSupportTickets, SUPPORT_FAQS } from "@/lib/support";
import { useLanguage } from "@/components/i18n/language-provider";
import { t } from "@/lib/i18n";

export default function SupportPage() {
    const { data: session } = useSession();
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const canManageTickets = canManageSupportTickets((session?.user as { role?: string | null } | undefined)?.role);
    const { language } = useLanguage();
    const tc = t(language, "misc");

    return (
        <div className="flex min-h-full flex-col bg-muted/40 p-4 lg:p-8 space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                            <LifeBuoy className="h-8 w-8 text-primary" /> {tc.supportTitle}
                        </h1>
                        <p className="text-muted-foreground mt-1 font-medium">{tc.supportSubtitle}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm font-semibold">
                        <Mail className="h-4 w-4 text-primary" /> pma.axiom.support@gmail.com
                    </div>
                    {canManageTickets && (
                        <Button asChild className="gap-2">
                            <Link href="/admin/support">
                                <ShieldCheck className="h-4 w-4" /> {tc.supportTicketConsole}
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> {tc.supportGuide}</CardTitle>
                        <CardDescription>
                            {tc.supportGuideDesc}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg border bg-card p-4">
                            <h2 className="font-semibold text-sm">{tc.needAdditionalHelp}</h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {tc.useKnowledgeGuide}
                            </p>
                        </div>
                        <div className="rounded-lg border bg-card p-4">
                            <h2 className="font-semibold text-sm">{tc.ticketAccess}</h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {tc.ticketAccessDesc}
                                {canManageTickets ? tc.openTicketConsole : tc.sharedKnowledgeGuide}
                            </p>
                        </div>
                </CardContent>
            </Card>

            {/* FAQ */}
            <Card>
                <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> {tc.faq}</CardTitle>
                        <CardDescription>{tc.faqDesc}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {SUPPORT_FAQS.map((faq, i) => (
                        <div key={i} className="border rounded-lg overflow-hidden">
                            <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                className="flex items-center justify-between w-full p-4 text-left font-semibold text-sm hover:bg-muted/50 transition-colors">
                                <span>{faq.q}</span>
                                {openFaq === i ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
                            </button>
                            {openFaq === i && (
                                <div className="px-4 pb-4 text-sm text-muted-foreground border-t bg-muted/30 pt-3">{faq.a}</div>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
