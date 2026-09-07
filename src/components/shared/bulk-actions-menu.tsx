"use client";

import * as React from "react";
import {
    ChevronDown,
    ChevronRight,
    ChevronsUpDown,
    XIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type BulkActionChild =
    | {
          kind: "action";
          id: string;
          label: string;
          icon?: React.ReactNode;
          destructive?: boolean;
          run: (selectedIds: string[]) => void | Promise<void>;
      }
    | {
          kind: "add-to-existing";
          id: string;
          label: string;
          icon?: React.ReactNode;
          entityLabel: string;
          fetchOptions: () => Promise<Array<{ id: string; label: string }>>;
          run: (selectedIds: string[], targetId: string) => void | Promise<void>;
      }
    | {
          kind: "create-new";
          id: string;
          label: string;
          icon?: React.ReactNode;
          entityLabel: string;
          run: (selectedIds: string[]) => void | Promise<void>;
      };

export type BulkActionGroup =
    | {
          kind: "submenu";
          id: string;
          label: string;
          icon?: React.ReactNode;
          children: BulkActionChild[];
      }
    | {
          kind: "action";
          id: string;
          label: string;
          icon?: React.ReactNode;
          destructive?: boolean;
          run: (selectedIds: string[]) => void | Promise<void>;
      };

export interface BulkActionsConfig {
    groups: BulkActionGroup[];
}

export interface BulkActionsMenuProps {
    selectedIds: Set<string>;
    onClearSelection: () => void;
    actions: BulkActionsConfig;
    className?: string;
    /** Optional callback when a selection-derived sub-action completes (e.g. removed rows). */
    onActionComplete?: (actionId: string) => void;
    /** Optional cap label for the count badge, defaults to "selected". */
    countLabel?: string;
}

export function BulkActionsMenu({
    selectedIds,
    onClearSelection,
    actions,
    className,
    onActionComplete,
    countLabel = "selected",
}: BulkActionsMenuProps) {
    const count = selectedIds.size;
    const [pendingDestructive, setPendingDestructive] = React.useState<{
        label: string;
        run: () => void | Promise<void>;
    } | null>(null);
    const [pickerOpen, setPickerOpen] = React.useState<{
        label: string;
        options: Array<{ id: string; label: string }>;
        run: (targetId: string) => void | Promise<void>;
        loading: boolean;
    } | null>(null);
    const [pickerQuery, setPickerQuery] = React.useState("");

    const idArray = React.useMemo(() => Array.from(selectedIds), [selectedIds]);

    React.useEffect(() => {
        if (count === 0) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                onClearSelection();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [count, onClearSelection]);

    if (count === 0) return null;

    const executeChild = async (child: BulkActionChild) => {
        if (child.kind === "add-to-existing") {
            try {
                const opts = await child.fetchOptions();
                setPickerQuery("");
                setPickerOpen({
                    label: child.label,
                    options: opts,
                    run: (targetId) => child.run(idArray, targetId),
                    loading: false,
                });
            } catch (err) {
                console.error(err);
                toast.error(`Failed to load ${child.entityLabel} list`);
            }
            return;
        }
        if (child.kind === "create-new") {
            await child.run(idArray);
            onActionComplete?.(child.id);
            return;
        }
        if (child.destructive) {
            setPendingDestructive({
                label: child.label,
                run: () => child.run(idArray),
            });
            return;
        }
        await child.run(idArray);
        onActionComplete?.(child.id);
    };

    const executeGroup = async (group: BulkActionGroup) => {
        if (group.kind === "action") {
            if (group.destructive) {
                setPendingDestructive({
                    label: group.label,
                    run: () => group.run(idArray),
                });
                return;
            }
            await group.run(idArray);
            onActionComplete?.(group.id);
        }
    };

    return (
        <>
            <div
                role="toolbar"
                aria-label="Bulk actions"
                data-testid="bulk-actions-toolbar"
                className={cn(
                    "pointer-events-auto sticky bottom-3 z-30 ml-auto flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-3 py-1.5 text-sm shadow-lg backdrop-blur supports-[backdrop-filter]:bg-white/80",
                    className,
                )}
            >
                <button
                    type="button"
                    onClick={onClearSelection}
                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    aria-label="Clear selection"
                >
                    <span className="font-medium">Clear selection</span>
                    <kbd className="hidden rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-500 sm:inline-flex">
                        Esc
                    </kbd>
                </button>

                <span aria-hidden className="h-5 w-px bg-slate-200" />

                <span
                    className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-900"
                    data-testid="bulk-actions-count"
                >
                    <span>
                      {count} {countLabel}
                    </span>
                    <button
                        type="button"
                        onClick={onClearSelection}
                        aria-label="Clear selection"
                        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-orange-700 transition-colors hover:bg-orange-200 hover:text-orange-900"
                    >
                        <XIcon className="h-3 w-3" />
                    </button>
                </span>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                        >
                            <ChevronsUpDown className="h-3.5 w-3.5 text-slate-500" />
                            <span>Actions</span>
                            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        sideOffset={8}
                        className="min-w-[14rem]"
                        onCloseAutoFocus={(e) => e.preventDefault()}
                    >
                        <DropdownMenuLabel className="flex items-center justify-between text-[11px] uppercase tracking-wide text-slate-500">
                            <span>Bulk actions</span>
                            <span className="font-mono normal-case text-slate-400">
                                {count} selected
                            </span>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {actions.groups.map((group, groupIndex) => {
                            if (group.kind === "submenu") {
                                return (
                                    <DropdownMenuSub key={group.id}>
                                        <DropdownMenuSubTrigger>
                                            {group.icon ? (
                                                <span className="mr-2 flex h-4 w-4 items-center justify-center text-slate-500">
                                                    {group.icon}
                                                </span>
                                            ) : null}
                                            <span>{group.label}</span>
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuPortal>
                                            <DropdownMenuSubContent
                                                sideOffset={4}
                                                className="min-w-[16rem]"
                                            >
                                                {group.children.map((child) => {
                                                    if (child.kind === "action") {
                                                        return (
                                                            <DropdownMenuItem
                                                                key={child.id}
                                                                onSelect={() =>
                                                                    executeChild(child)
                                                                }
                                                                className={cn(
                                                                    child.destructive &&
                                                                        "text-red-600 focus:text-red-700",
                                                                )}
                                                            >
                                                                {child.icon ? (
                                                                    <span className="mr-2 flex h-4 w-4 items-center justify-center text-slate-500">
                                                                        {child.icon}
                                                                    </span>
                                                                ) : null}
                                                                <span>{child.label}</span>
                                                                {child.destructive ? (
                                                                    <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-0" />
                                                                ) : null}
                                                            </DropdownMenuItem>
                                                        );
                                                    }
                                                    return (
                                                        <DropdownMenuItem
                                                            key={child.id}
                                                            onSelect={() => executeChild(child)}
                                                        >
                                                            {child.icon ? (
                                                                <span className="mr-2 flex h-4 w-4 items-center justify-center text-slate-500">
                                                                    {child.icon}
                                                                </span>
                                                            ) : null}
                                                            <span>{child.label}</span>
                                                            {child.kind === "add-to-existing" ? (
                                                                <span className="ml-auto text-[10px] uppercase tracking-wide text-slate-400">
                                                                    Pick
                                                                </span>
                                                            ) : (
                                                                <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-0" />
                                                            )}
                                                        </DropdownMenuItem>
                                                    );
                                                })}
                                            </DropdownMenuSubContent>
                                        </DropdownMenuPortal>
                                    </DropdownMenuSub>
                                );
                            }
                            return (
                                <React.Fragment key={group.id}>
                                    <DropdownMenuItem
                                        onSelect={() => executeGroup(group)}
                                        className={cn(
                                            group.destructive &&
                                                "text-red-600 focus:bg-red-50 focus:text-red-700",
                                        )}
                                    >
                                        {group.icon ? (
                                            <span
                                                className={cn(
                                                    "mr-2 flex h-4 w-4 items-center justify-center",
                                                    group.destructive
                                                        ? "text-red-500"
                                                        : "text-slate-500",
                                                )}
                                            >
                                                {group.icon}
                                            </span>
                                        ) : null}
                                        <span>{group.label}</span>
                                    </DropdownMenuItem>
                                    {groupIndex < actions.groups.length - 1 ? (
                                        <DropdownMenuSeparator />
                                    ) : null}
                                </React.Fragment>
                            );
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <AlertDialog
                open={pendingDestructive !== null}
                onOpenChange={(open) => !open && setPendingDestructive(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                                Confirm: {pendingDestructive?.label}
                            </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will affect{" "}
                            <span className="font-semibold text-slate-900">
                                {count} {countLabel}
                            </span>
                            . This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 text-white hover:bg-red-700"
                            onClick={async (e) => {
                                e.preventDefault();
                                const action = pendingDestructive;
                                setPendingDestructive(null);
                                if (action) {
                                    await action.run();
                                    onActionComplete?.("destructive");
                                }
                            }}
                        >
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <PickerDialog
                open={pickerOpen !== null}
                onOpenChange={(open) => {
                    if (!open) setPickerOpen(null);
                }}
                picker={pickerOpen}
                query={pickerQuery}
                onQueryChange={setPickerQuery}
                onConfirm={async (targetId) => {
                    const p = pickerOpen;
                    setPickerOpen(null);
                    if (p) await p.run(targetId);
                    onActionComplete?.("add-to-existing");
                }}
            />
        </>
    );
}

function PickerDialog({
    open,
    onOpenChange,
    picker,
    query,
    onQueryChange,
    onConfirm,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    picker: {
        label: string;
        options: Array<{ id: string; label: string }>;
        run: (targetId: string) => void | Promise<void>;
        loading: boolean;
    } | null;
    query: string;
    onQueryChange: (q: string) => void;
    onConfirm: (targetId: string) => void;
}) {
    const [selected, setSelected] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (open) setSelected(null);
    }, [open]);

    const filtered = React.useMemo(() => {
        if (!picker) return [];
        const q = query.trim().toLowerCase();
        if (!q) return picker.options;
        return picker.options.filter((o) => o.label.toLowerCase().includes(q));
    }, [picker, query]);

    if (!picker) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={picker.label}
            data-state={open ? "open" : "closed"}
            className={cn(
                "fixed inset-0 z-50 flex items-center justify-center p-4",
                open ? "pointer-events-auto" : "pointer-events-none hidden",
            )}
        >
            <button
                type="button"
                aria-label="Close"
                onClick={() => onOpenChange(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <div className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
                <div className="border-b border-slate-200 px-4 py-3">
                    <h2 className="text-sm font-semibold text-slate-900">{picker.label}</h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                        Search and pick an existing item to add to.
                    </p>
                </div>
                <div className="p-4">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                        placeholder="Search…"
                        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    />
                    <ul className="mt-2 max-h-64 overflow-y-auto rounded-md border border-slate-100">
                        {picker.loading ? (
                            <li className="px-3 py-2 text-sm text-slate-500">Loading…</li>
                        ) : filtered.length === 0 ? (
                            <li className="px-3 py-2 text-sm text-slate-500">
                                No matches.
                            </li>
                        ) : (
                            filtered.map((opt) => (
                                <li key={opt.id}>
                                    <button
                                        type="button"
                                        onClick={() => setSelected(opt.id)}
                                        className={cn(
                                            "flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50",
                                            selected === opt.id && "bg-orange-50 text-orange-900",
                                        )}
                                    >
                                        <span>{opt.label}</span>
                                        {selected === opt.id ? (
                                            <span className="text-xs font-semibold text-orange-700">
                                                Selected
                                            </span>
                                        ) : null}
                                    </button>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
                <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3">
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        disabled={!selected}
                        onClick={() => selected && onConfirm(selected)}
                        className="rounded-md bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                        Add selected
                    </button>
                </div>
            </div>
        </div>
    );
}