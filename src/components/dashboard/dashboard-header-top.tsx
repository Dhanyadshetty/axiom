"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/language-provider";

export function DashboardHeaderTop({ userName }: { userName?: string }) {
    const { language } = useLanguage();
    const [currentTime, setCurrentTime] = useState<Date | null>(null);

    useEffect(() => {
        setCurrentTime(new Date());
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const greeting = () => {
        if (!currentTime) return "";
        const hour = currentTime.getHours();
        if (hour < 12) return language === "de" ? "Guten Morgen" : "Good morning";
        if (hour < 18) return language === "de" ? "Guten Tag" : "Good afternoon";
        return language === "de" ? "Guten Abend" : "Good evening";
    };

    const dateFormatted = currentTime
        ? new Intl.DateTimeFormat(language === "de" ? "de-DE" : "en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
              second: "2-digit",
          }).format(currentTime)
        : "";

    return (
        <div className="flex items-center justify-between mb-1">
            <div className="text-lg font-medium text-foreground tracking-tight">
                {greeting()}{userName ? `, ${userName}` : ""}
            </div>
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {dateFormatted}
            </div>
        </div>
    );
}
