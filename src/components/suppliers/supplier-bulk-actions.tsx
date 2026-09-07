"use client";

import * as React from "react";
import {
    ClipboardList,
    Download,
    FileSpreadsheet,
    FileText,
    ListChecks,
    Plus,
    Trash2,
} from "lucide-react";
import { toast } from "sonner";

import type { BulkActionsConfig } from "@/components/shared/bulk-actions-menu";
import type { Supplier } from "./tacto/suppliers-model";

export interface SupplierBulkActionsContext {
    suppliers: Supplier[];
    onDeleted: (ids: string[]) => void;
    onCreatedEvaluations?: (ids: string[]) => void;
}

export function buildSupplierBulkActions(
    ctx: SupplierBulkActionsContext,
): BulkActionsConfig {
    const byId = new Map(ctx.suppliers.map((s) => [s.id, s]));
    const labelOf = (ids: string[]) =>
        ids
            .map((id) => byId.get(id)?.name ?? id)
            .slice(0, 3)
            .join(", ") + (ids.length > 3 ? ` (+${ids.length - 3} more)` : "");

    const mockRequests = [
        { id: "req-001", label: "Q3 Packaging refresh" },
        { id: "req-002", label: "EU logistics partner search" },
        { id: "req-003", label: "FY26 component sourcing" },
    ];
    const mockRfqs = [
        { id: "rfq-101", label: "RFQ — Injection mould tooling (2026-Q3)" },
        { id: "rfq-102", label: "RFQ — Stainless fasteners" },
    ];
    const mockLists = [
        { id: "list-a", label: "Approved EU fabricators" },
        { id: "list-b", label: "Preferred logistics partners" },
        { id: "list-c", label: "Watchlist — Asia-Pacific suppliers" },
    ];

    return {
        groups: [
            {
                kind: "submenu",
                id: "export",
                label: "Export",
                icon: <Download className="h-4 w-4" />,
                children: [
                    {
                        kind: "action",
                        id: "export-csv",
                        label: "CSV",
                        icon: <FileText className="h-4 w-4" />,
                        run: async (ids) => {
                            const names = labelOf(ids);
                            toast.success(`Exporting ${ids.length} suppliers to CSV`, {
                                description: names,
                            });
                        },
                    },
                    {
                        kind: "action",
                        id: "export-xlsx",
                        label: "Microsoft Excel (.xlsx)",
                        icon: <FileSpreadsheet className="h-4 w-4" />,
                        run: async (ids) => {
                            const names = labelOf(ids);
                            toast.success(`Exporting ${ids.length} suppliers to Excel`, {
                                description: names,
                            });
                        },
                    },
                ],
            },
            {
                kind: "submenu",
                id: "request",
                label: "Request",
                icon: <ClipboardList className="h-4 w-4" />,
                children: [
                    {
                        kind: "create-new",
                        id: "request-new",
                        label: "Create new Request",
                        icon: <Plus className="h-4 w-4" />,
                        entityLabel: "request",
                        run: async (ids) => {
                            toast.success(
                                `Creating new Request with ${ids.length} supplier(s)`,
                                {
                                    description: labelOf(ids),
                                },
                            );
                        },
                    },
                    {
                        kind: "add-to-existing",
                        id: "request-add",
                        label: "Add to existing Request",
                        icon: <ListChecks className="h-4 w-4" />,
                        entityLabel: "request",
                        fetchOptions: async () => mockRequests,
                        run: async (ids, targetId) => {
                            const target = mockRequests.find((r) => r.id === targetId);
                            toast.success(
                                `Added ${ids.length} supplier(s) to ${target?.label ?? targetId}`,
                                { description: labelOf(ids) },
                            );
                        },
                    },
                ],
            },
            {
                kind: "submenu",
                id: "rfq",
                label: "RFQ",
                icon: <FileSpreadsheet className="h-4 w-4" />,
                children: [
                    {
                        kind: "create-new",
                        id: "rfq-new",
                        label: "Create new RFQ",
                        icon: <Plus className="h-4 w-4" />,
                        entityLabel: "RFQ",
                        run: async (ids) => {
                            toast.success(
                                `Creating new RFQ with ${ids.length} supplier(s)`,
                                { description: labelOf(ids) },
                            );
                        },
                    },
                    {
                        kind: "add-to-existing",
                        id: "rfq-add",
                        label: "Add to existing RFQ",
                        icon: <ListChecks className="h-4 w-4" />,
                        entityLabel: "RFQ",
                        fetchOptions: async () => mockRfqs,
                        run: async (ids, targetId) => {
                            const target = mockRfqs.find((r) => r.id === targetId);
                            toast.success(
                                `Added ${ids.length} supplier(s) to ${target?.label ?? targetId}`,
                                { description: labelOf(ids) },
                            );
                        },
                    },
                ],
            },
            {
                kind: "action",
                id: "create-evaluations",
                label: "Create Evaluations",
                icon: <ListChecks className="h-4 w-4" />,
                run: async (ids) => {
                    ctx.onCreatedEvaluations?.(ids);
                    toast.success(
                        `Creating ${ids.length} evaluation record(s)`,
                        { description: labelOf(ids) },
                    );
                },
            },
            {
                kind: "submenu",
                id: "supplier-list",
                label: "Supplier list",
                icon: <ClipboardList className="h-4 w-4" />,
                children: [
                    {
                        kind: "create-new",
                        id: "supplier-list-new",
                        label: "Create new Supplier list",
                        icon: <Plus className="h-4 w-4" />,
                        entityLabel: "supplier list",
                        run: async (ids) => {
                            toast.success(
                                `Creating new Supplier list with ${ids.length} supplier(s)`,
                                { description: labelOf(ids) },
                            );
                        },
                    },
                    {
                        kind: "add-to-existing",
                        id: "supplier-list-add",
                        label: "Add to existing Supplier list",
                        icon: <ListChecks className="h-4 w-4" />,
                        entityLabel: "supplier list",
                        fetchOptions: async () => mockLists,
                        run: async (ids, targetId) => {
                            const target = mockLists.find((l) => l.id === targetId);
                            toast.success(
                                `Added ${ids.length} supplier(s) to ${target?.label ?? targetId}`,
                                { description: labelOf(ids) },
                            );
                        },
                    },
                ],
            },
            {
                kind: "action",
                id: "delete",
                label: "Delete",
                icon: <Trash2 className="h-4 w-4" />,
                destructive: true,
                run: async (ids) => {
                    ctx.onDeleted(ids);
                    toast.success(
                        `Deleted ${ids.length} supplier(s)`,
                        { description: labelOf(ids) },
                    );
                },
            },
        ],
    };
}