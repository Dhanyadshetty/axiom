"use client";

import * as React from "react";
import { Settings2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type SectionIcon = React.ComponentType<{ className?: string }>;

export function Section({
    title,
    icon: Icon,
    actions,
    children,
}: {
    title: string;
    icon?: SectionIcon;
    actions?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-2">
                <CardTitle className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500">
                    {Icon ? <Icon className="h-4 w-4 text-slate-400" /> : null}
                    {title}
                </CardTitle>
                <div className="flex items-center gap-1">
                    {actions}
                    {actions === undefined ? (
                        <button
                            type="button"
                            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            aria-label="Configure section"
                        >
                            <Settings2 className="h-4 w-4" />
                        </button>
                    ) : null}
                </div>
            </CardHeader>
            <CardContent className="p-0">{children}</CardContent>
        </Card>
    );
}
