"use client";

import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/components/i18n/language-provider";
import { getGreeting } from "@/lib/i18n";

export function DashboardHeader({ userName, dashboardTitle, dashboardSubtitle, sessionBadge, roleBadgeClass, children }: {
    userName: string;
    dashboardTitle: string;
    dashboardSubtitle: string;
    sessionBadge: string;
    roleBadgeClass: string;
    children?: React.ReactNode;
}) {
    const { language } = useLanguage();
    const [currentTime, setCurrentTime] = useState("");
    const greeting = useMemo(() => getGreeting(language, new Date()), [language]);

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const locale = language === "de" ? "de-DE" : "en-GB";
            const dateStr = now.toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            const timeStr = now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            setCurrentTime(`${dateStr} | ${timeStr}`);
        };








        
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="mb-6 rounded-2xl border border-border/60 bg-card/70 px-4 py-3 shadow-sm backdrop-blur-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">








                                <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        {greeting},
                    </p>
                    <h2 className="mt-1 text-2xl font-black tracking-tight text-foreground">
                        {userName}
                    </h2>
                </div>

                {currentTime && (
                    <div className="inline-flex items-center rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                        {currentTime}
                    </div>
                )}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase leading-none">{dashboardTitle}</h1>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${roleBadgeClass}`}>
                            {sessionBadge}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest mt-1">{dashboardSubtitle}</p>
                </div>
                <div className="flex items-center gap-4">
                    {children}
                </div>
            </div>
        </div>
    );
}
