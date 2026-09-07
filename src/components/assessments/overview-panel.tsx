"use client";

import * as React from "react";
import {
    FileText,
    Users,
    ListChecks,
    CheckCircle2,
    MessageSquare,
    Paperclip,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { AssessmentDetail } from "@/lib/assessment-types";

function supplierInitials(name: string | null) {
    if (!name) return "?";
    return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

const supplierStatusStyles: Record<string, string> = {
    pending: "border-slate-200 bg-slate-50 text-slate-600",
    sent: "border-sky-200 bg-sky-50 text-sky-700",
    in_progress: "border-amber-200 bg-amber-50 text-amber-700",
    submitted: "border-emerald-200 bg-emerald-50 text-emerald-700",
    completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export function OverviewPanel({ detail }: { detail: AssessmentDetail }) {
    const totalDocuments = detail.documentRequestGroups.reduce(
        (sum: number, g: AssessmentDetail["documentRequestGroups"][number]) => sum + g.documents.length,
        0
    );
    const respondedCount = detail.suppliers.filter(
        (s: AssessmentDetail["suppliers"][number]) => s.status === "submitted" || s.status === "completed"
    ).length;
    const progress = detail.suppliers.length
        ? Math.round((respondedCount / detail.suppliers.length) * 100)
        : 0;

    const stats = [
        { label: "Suppliers invited", value: detail.suppliers.length, icon: <Users className="h-4 w-4 text-emerald-600" /> },
        { label: "Responses submitted", value: detail.responseCount, icon: <CheckCircle2 className="h-4 w-4 text-sky-600" /> },
        { label: "Document requests", value: totalDocuments, icon: <Paperclip className="h-4 w-4 text-violet-600" /> },
        { label: "Completion", value: `${progress}%`, icon: <ListChecks className="h-4 w-4 text-amber-600" /> },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-bold text-slate-900">Overview</h2>
                <p className="text-sm text-slate-500">Summary of this Supplier Self Assessment request.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.label} className="border-slate-200">
                        <CardContent className="flex items-center gap-3 p-4">
                            <div className="rounded-lg bg-slate-50 p-2">{stat.icon}</div>
                            <div>
                                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                                <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Suppliers */}
                <Card className="border-slate-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Users className="h-4 w-4 text-emerald-600" /> Participating Suppliers
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {detail.suppliers.length === 0 ? (
                            <p className="text-sm text-slate-400">No suppliers added yet.</p>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {detail.suppliers.map((s: AssessmentDetail["suppliers"][number]) => (
                                    <li key={s.id} className="flex items-center justify-between py-2.5">
                                        <div className="flex items-center gap-2">
                                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                                                {supplierInitials(s.supplierName)}
                                            </span>
                                            <span className="text-sm font-medium text-slate-700">
                                                {s.supplierName ?? `Supplier ${s.supplierId.slice(0, 6)}`}
                                            </span>
                                        </div>
                                        <Badge variant="outline" className={supplierStatusStyles[s.status] ?? supplierStatusStyles.pending}>
                                            {s.status}
                                        </Badge>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                {/* Document request groups */}
                <Card className="border-slate-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <FileText className="h-4 w-4 text-violet-600" /> Document Requests
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {detail.documentRequestGroups.length === 0 ? (
                            <p className="text-sm text-slate-400">No document sections configured.</p>
                        ) : (
                            <ul className="space-y-3">
                                {detail.documentRequestGroups.map((g: AssessmentDetail["documentRequestGroups"][number]) => (
                                    <li key={g.id} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-slate-800">{g.label}</span>
                                            <Badge variant="outline" className="border-slate-200 bg-white">
                                                {g.documents.length} doc{g.documents.length === 1 ? "" : "s"}
                                            </Badge>
                                        </div>
                                        <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Paperclip className="h-3 w-3" />
                                                {g.allowAdditionalAttachments ? "Additional attachments allowed" : "No extra attachments"}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Message preview */}
            <Card className="border-slate-200">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <MessageSquare className="h-4 w-4 text-slate-500" /> Message to Supplier
                    </CardTitle>
                    <CardDescription>Sent to each invited supplier.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="whitespace-pre-wrap rounded-lg border border-slate-100 bg-slate-50/60 p-4 text-sm leading-6 text-slate-700">
                        {detail.messageBody || "No message configured."}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
