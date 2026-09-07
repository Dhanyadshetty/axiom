"use client";

import * as React from "react";
import { Users, Inbox, Send, Clock, CheckCircle2, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AssessmentDetail } from "@/lib/assessment-types";

const supplierStatusStyles: Record<string, string> = {
    pending: "border-slate-200 bg-slate-50 text-slate-600",
    sent: "border-sky-200 bg-sky-50 text-sky-700",
    in_progress: "border-amber-200 bg-amber-50 text-amber-700",
    submitted: "border-emerald-200 bg-emerald-50 text-emerald-700",
    completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const statusIcon: Record<string, React.ReactNode> = {
    pending: <Clock className="h-3.5 w-3.5" />,
    sent: <Send className="h-3.5 w-3.5" />,
    in_progress: <Clock className="h-3.5 w-3.5" />,
    submitted: <CheckCircle2 className="h-3.5 w-3.5" />,
    completed: <CheckCircle2 className="h-3.5 w-3.5" />,
};

export function ResponsesPanel({ detail }: { detail: AssessmentDetail }) {
    const totalDocuments = detail.documentRequestGroups.reduce(
        (sum: number, g: AssessmentDetail["documentRequestGroups"][number]) => sum + g.documents.length,
        0
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-bold text-slate-900">Responses</h2>
                <p className="text-sm text-slate-500">
                    Track supplier participation and submitted documents for this assessment.
                </p>
            </div>

            <Card className="overflow-hidden border-slate-200">
                <CardHeader className="border-b bg-slate-50 pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Users className="h-4 w-4 text-emerald-600" /> Supplier Participation
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {detail.suppliers.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 p-10 text-center">
                            <Inbox className="h-9 w-9 text-slate-300" />
                            <p className="text-sm font-medium text-slate-600">No suppliers invited yet</p>
                            <p className="text-xs text-slate-400">
                                Add suppliers in the Form tab to start collecting responses.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px] text-sm">
                                <thead className="text-xs font-black uppercase tracking-wider text-slate-500">
                                    <tr className="border-b border-slate-200">
                                        <th className="px-4 py-3 text-left">Supplier</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-left">Documents expected</th>
                                        <th className="px-4 py-3 text-left">Submitted</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {detail.suppliers.map((s: AssessmentDetail["suppliers"][number]) => (
                                        <tr key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
                                            <td className="px-4 py-3 font-medium text-slate-800">
                                                {s.supplierName ?? `Supplier ${s.supplierId.slice(0, 6)}`}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant="outline" className={supplierStatusStyles[s.status] ?? supplierStatusStyles.pending}>
                                                    <span className="mr-1">{statusIcon[s.status] ?? <Clock className="h-3.5 w-3.5" />}</span>
                                                    {s.status}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">{totalDocuments}</td>
                                            <td className="px-4 py-3">
                                                {s.status === "submitted" || s.status === "completed" ? (
                                                    <span className="inline-flex items-center gap-1 text-emerald-600">
                                                        <CheckCircle2 className="h-4 w-4" /> Yes
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {detail.responseCount > 0 ? (
                <Card className="border-slate-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <FileText className="h-4 w-4 text-violet-600" /> Submitted Responses
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-500">
                            {detail.responseCount} response(s) received. Review them in the supplier portal inbox.
                        </p>
                    </CardContent>
                </Card>
            ) : null}
        </div>
    );
}
