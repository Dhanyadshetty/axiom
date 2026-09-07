"use client";

import * as React from "react";
import { Users, Inbox, Send, Clock, CheckCircle2, FileText, ChevronDown, AlertCircle, MoreHorizontal, Download, Paperclip, FileUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FormRenderer } from "./FormRenderer";
import type { AssessmentDetail } from "@/lib/assessment-types";
import type { AssessmentTemplateSchema, FormAnswer } from "@/lib/assessment-templates/types";
import type { SupplierDocumentResponse } from "@/lib/assessment-types";
import { getSupplierResponse } from "@/app/actions/assessments";

import {
    supplierStatusStyles,
    reviewStatusStyles,
    initials,
    formatDate,
    formatDateTime,
} from "./shared-constants";

type SupplierResponseData = {
    answers: FormAnswer;
    status: string;
    template: AssessmentTemplateSchema;
    messageBody: string | null;
    documents: SupplierDocumentResponse[];
} | null;

export function ResponsesPanelNew({ detail }: { detail: AssessmentDetail }) {
    const [selectedSupplier, setSelectedSupplier] = React.useState<AssessmentDetail["suppliers"][number] | null>(detail.suppliers[0] ?? null);
    const [sidebarOpen, setSidebarOpen] = React.useState(true);
    const [responseData, setResponseData] = React.useState<SupplierResponseData>(null);
    const [loadingResponse, setLoadingResponse] = React.useState(false);

    const handleSelectSupplier = async (s: AssessmentDetail["suppliers"][number]) => {
        setSelectedSupplier(s);
        if (s) {
            await loadSupplierResponse(s.supplierId);
        }
    };

    const loadSupplierResponse = async (supplierId: string) => {
        setLoadingResponse(true);
        try {
            const data = await getSupplierResponse(detail.id, supplierId);
            setResponseData(data);
        } catch (error) {
            console.error("Failed to load supplier response:", error);
            setResponseData(null);
        } finally {
            setLoadingResponse(false);
        }
    };

    // Load initial supplier response
    React.useEffect(() => {
        if (selectedSupplier) {
            loadSupplierResponse(selectedSupplier.supplierId);
        }
    }, [detail.id, selectedSupplier?.supplierId]);

    const currentSupplier = selectedSupplier ?? detail.suppliers[0];
    const isSubmitted = currentSupplier?.status === "submitted" || currentSupplier?.status === "completed";
    const isInProgress = currentSupplier?.status === "in_progress";
    const currentStatus = currentSupplier ? supplierStatusStyles[currentSupplier.status] : { dot: "bg-slate-400", label: "—", badge: "border-slate-200 bg-slate-50 text-slate-600" };
    const hasResponse = responseData && Object.keys(responseData.answers).length > 0;

    return (
        <div className="space-y-6">
            {/* Header with breadcrumb, title, swap icon */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100">
                        <Users className="h-4 w-4 text-sky-600" />
                    </span>
                    <div className="min-w-0">
                        <h1 className="text-xl font-bold text-slate-900 truncate lg:max-w-[400px]">
                            {detail.id.slice(0, 8)}: {detail.title}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm text-slate-500">Viewing response for:</span>
                </div>
            </div>

            <hr className="border-slate-200" />

            {/* Supplier selector */}
            <div className="flex items-center gap-3 flex-wrap p-4 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
                <div className="flex items-center gap-3">
                    <select
                        value={currentSupplier?.id ?? ""}
                        onChange={(e) => {
                            const s = detail.suppliers.find((s) => s.id === e.target.value);
                            if (s) setSelectedSupplier(s);
                        }}
                        className="h-9 w-auto min-w-[240px] max-w-[300px] rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                    >
                        {detail.suppliers.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.supplierName ?? `Supplier ${s.supplierId.slice(0, 6)}`}
                            </option>
                        ))}
                    </select>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2">Edit supplier</DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">View details</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 text-rose-600">Remove supplier</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Body - Render based on response state */}
            <div className="p-4">
                {detail.suppliers.length === 0 ? (
                    <Card className="border-slate-200">
                        <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
                            <Inbox className="h-9 w-9 text-slate-300" />
                            <p className="text-sm font-medium text-slate-600">No suppliers invited yet</p>
                            <p className="text-xs text-slate-400">
                                Add suppliers in the Form tab to start collecting responses.
                            </p>
                        </CardContent>
                    </Card>
                ) : !currentSupplier ? (
                    <Card className="border-slate-200">
                        <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
                            <Inbox className="h-9 w-9 text-slate-300" />
                            <p className="text-sm font-medium text-slate-600">Select a supplier to view their response</p>
                        </CardContent>
                    </Card>
                ) : loadingResponse ? (
                    <Card className="border-slate-200">
                        <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
                            <p className="text-sm text-slate-500">Loading response...</p>
                        </CardContent>
                    </Card>
                ) : hasResponse && (isSubmitted || isInProgress) ? (
                    <Card className="border-slate-200">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between gap-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <FileText className="h-4 w-4 text-violet-600" />
                                    {isSubmitted ? "Submitted Response" : "In Progress Response"}
                                    <Badge variant="outline" className={supplierStatusStyles[currentSupplier.status]?.badge ?? "border-slate-200 bg-slate-50 text-slate-600"}>
                                        {supplierStatusStyles[currentSupplier.status]?.label ?? currentSupplier.status}
                                    </Badge>
                                </CardTitle>
                                <Button variant="outline" size="sm" className="gap-2 no-print" onClick={() => window.print()}>
                                    <Download className="h-4 w-4" />
                                    Export response
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="response-print-area space-y-4">
                                {responseData?.messageBody && (
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                                            <span className="flex h-4 w-4 text-emerald-600">✉</span>
                                            Message from buyer
                                        </div>
                                        <div className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                                            {responseData.messageBody}
                                        </div>
                                    </div>
                                )}
                                {responseData?.template && (
                                    <FormRenderer
                                        schema={responseData.template}
                                        answers={responseData.answers}
                                        onChange={() => {}}
                                        readOnly={true}
                                    />
                                )}
                                {responseData?.documents && responseData.documents.length > 0 ? (
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                                            <Paperclip className="h-4 w-4 text-slate-500" />
                                            Uploaded documents
                                        </div>
                                        <ul className="space-y-2">
                                            {responseData.documents.map((doc, idx) => (
                                                <li key={doc.documentRequestId ?? idx}>
                                                    <a
                                                        href={doc.documentUrl ?? "#"}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
                                                    >
                                                        <FileUp className="h-4 w-4 text-emerald-600" />
                                                        <span className="min-w-0 flex-1 truncate font-medium text-slate-800">
                                                            {doc.documentName ?? doc.documentUrl}
                                                        </span>
                                                        {doc.responseText ? (
                                                            <span className="hidden truncate text-xs text-slate-400 sm:inline max-w-[200px]">
                                                                {doc.responseText}
                                                            </span>
                                                        ) : null}
                                                        <span className="text-xs text-slate-400">Open</span>
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : null}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-slate-200">
                        <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
                            <Inbox className="h-9 w-9 text-slate-300" />
                            <p className="text-lg font-semibold text-slate-900">No response for this supplier</p>
                            <p className="text-sm text-slate-500">This supplier has not submitted a response yet.</p>
                            {currentSupplier && (
                                <Badge variant="outline" className={supplierStatusStyles[currentSupplier.status]?.badge ?? "border-slate-200 bg-slate-50 text-slate-600"}>
                                    Status: {currentSupplier.status}
                                </Badge>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

// Right Sidebar for Responses
export function ResponsesSidebar({ detail, currentSupplier }: { detail: AssessmentDetail; currentSupplier: AssessmentDetail["suppliers"][number] | null }) {
    const currentStatus = currentSupplier ? supplierStatusStyles[currentSupplier.status] : { dot: "bg-slate-400", label: "—", badge: "border-slate-200 bg-slate-50 text-slate-600" };
    const reviewStatus = reviewStatusStyles.not_reviewed;

    const detailsContent = (
        <dl className="space-y-4 text-sm">
            <div>
                <dt className="text-slate-500">Status</dt>
                <dd className="mt-1 flex items-center gap-2">
                    <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${currentSupplier ? supplierStatusStyles[currentSupplier.status]?.badge : "border-slate-200 bg-slate-50 text-slate-600"}`}>
                        <span className={`h-2 w-2 rounded-full ${currentSupplier ? supplierStatusStyles[currentSupplier.status]?.dot : "bg-slate-400"}`} />
                        {currentSupplier ? supplierStatusStyles[currentSupplier.status]?.label : "—"}
                    </span>
                </dd>
            </div>
            <div>
                <dt className="text-slate-500">Last edited</dt>
                <dd className="mt-1 flex items-center gap-1.5 text-slate-900">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {formatDateTime(new Date())}
                </dd>
            </div>
            <div>
                <dt className="text-slate-500">Responsible</dt>
                <dd className="mt-1 flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-[9px]">R</AvatarFallback>
                    </Avatar>
                    <span className="text-slate-900">Responsible Person</span>
                </dd>
            </div>
            <div>
                <dt className="text-slate-500">Shared with</dt>
                <dd className="mt-1 flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-[9px]">S</AvatarFallback>
                    </Avatar>
                    <span className="text-slate-900">Supplier Contact</span>
                    <Badge variant="secondary" className="border-slate-200 bg-slate-50 text-slate-600 text-[10px]">+2</Badge>
                </dd>
            </div>
        </dl>
    );

    const reviewContent = (
        <dl className="space-y-4 text-sm">
            <div>
                <dt className="text-slate-500">Review status</dt>
                <dd className="mt-1 flex items-center gap-2">
                    <Badge variant="outline" className={reviewStatusStyles.not_reviewed.badge}>
                        {reviewStatusStyles.not_reviewed.icon}
                        <span className="ml-1">{reviewStatusStyles.not_reviewed.label}</span>
                    </Badge>
                </dd>
            </div>
            <div>
                <dt className="text-slate-500">Reviewed by</dt>
                <dd className="mt-1 text-slate-500">Not reviewed yet</dd>
            </div>
            <div>
                <dt className="text-slate-500">Reviewed at</dt>
                <dd className="mt-1 text-slate-500">Not reviewed yet</dd>
            </div>
        </dl>
    );

    return (
        <aside className="w-full lg:w-80 space-y-4">
            {/* Details Section */}
            <Card className="border-slate-200">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                        Details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {detailsContent}
                </CardContent>
            </Card>

            {/* Review Section */}
            <Card className="border-slate-200">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                        Review
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {reviewContent}
                </CardContent>
            </Card>
        </aside>
    );
}

export {
    supplierStatusStyles,
    reviewStatusStyles,
    initials,
    formatDate,
    formatDateTime,
} from "./shared-constants";