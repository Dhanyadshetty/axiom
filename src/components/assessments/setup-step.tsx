"use client";

import * as React from "react";
import { toast } from "sonner";
import { Info } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateAssessmentSetup } from "@/app/actions/assessments";
import type { AssessmentDetail } from "@/lib/assessment-types";

function initials(name: string | null) {
    if (!name) return "?";
    return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function SetupStep({
    detail,
    canManage,
    userOptions,
    registerSave,
    currentUserId,
}: {
    detail: AssessmentDetail;
    canManage: boolean;
    userOptions: { id: string; name: string | null; email: string | null; image: string | null }[];
    registerSave: (fn: (() => Promise<void>) | null) => void;
    currentUserId: string;
}) {
    const [title, setTitle] = React.useState(detail.title || detail.template?.name || "");
    const [responsibleId, setResponsibleId] = React.useState(detail.responsibleId || currentUserId);
    const [dueDate, setDueDate] = React.useState(
        detail.dueDate ? new Date(detail.dueDate).toISOString().slice(0, 10) : ""
    );
    const [team, setTeam] = React.useState<string[]>(detail.teamIds ?? []);
    const [, startTransition] = React.useTransition();

    const responsible = userOptions.find((u) => u.id === responsibleId);

    const handleSave = () => {
        if (!title.trim()) {
            toast.error("Title is required");
            return Promise.resolve();
        }
        if (!responsibleId) {
            toast.error("Responsible is required");
            return Promise.resolve();
        }
        return new Promise<void>((resolve) => {
            startTransition(async () => {
                const result = await updateAssessmentSetup(detail.id, {
                    title,
                    responsibleId,
                    dueDate: dueDate || null,
                    teamIds: team,
                });
                if (result.success) toast.success("Saved as draft");
                else toast.error(result.error || "Failed to save");
                resolve();
            });
        });
    };

    React.useEffect(() => {
        if (!canManage) {
            registerSave(null);
            return;
        }
        registerSave(() => handleSave());
        return () => registerSave(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canManage, registerSave, title, responsibleId, dueDate, team]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-bold text-slate-900">General Information</h2>
                <p className="text-sm text-slate-500">
                    Define the basic details for this assessment request.
                </p>
            </div>

            <div className="space-y-5">
                <div className="grid gap-2">
                    <Label htmlFor="title" className="text-sm font-semibold">
                        Title <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                        id="title"
                        value={title}
                        disabled={!canManage}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Q3 Supplier Self Assessment"
                    />
                </div>

                <div className="grid gap-2">
                    <div className="flex items-center gap-1.5">
                        <Label htmlFor="responsible" className="text-sm font-semibold">
                            Responsible <span className="text-rose-500">*</span>
                        </Label>
                        <span title="The person accountable for this request">
                            <Info className="h-3.5 w-3.5 text-slate-400" />
                        </span>
                    </div>
                    <select
                        id="responsible"
                        value={responsibleId}
                        disabled={!canManage}
                        onChange={(e) => setResponsibleId(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-60"
                    >
                        <option value="">Select responsible...</option>
                        {userOptions.map((u) => (
                            <option key={u.id} value={u.id}>{u.name ?? u.email}</option>
                        ))}
                    </select>
                    {responsible ? (
                        <div className="flex items-center gap-2 pt-1">
                            <Avatar className="h-7 w-7">
                                {responsible.image ? <AvatarImage src={responsible.image} alt={responsible.name ?? ""} /> : null}
                                <AvatarFallback className="text-[10px]">{initials(responsible.name)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-slate-600">{responsible.name ?? responsible.email}</span>
                        </div>
                    ) : null}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="dueDate" className="text-sm font-semibold">Due date</Label>
                    <Input
                        id="dueDate"
                        type="date"
                        value={dueDate}
                        disabled={!canManage}
                        onChange={(e) => setDueDate(e.target.value)}
                    />
                </div>

                <div className="grid gap-2">
                    <div className="flex items-center gap-1.5">
                        <Label htmlFor="team" className="text-sm font-semibold">Team</Label>
                        <span title="Users who can collaborate on this request">
                            <Info className="h-3.5 w-3.5 text-slate-400" />
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2 rounded-md border border-input p-2 min-h-9">
                        {team.length === 0 ? (
                            <span className="text-sm text-slate-400">Select...</span>
                        ) : (
                            team.map((uid) => {
                                const u = userOptions.find((x) => x.id === uid);
                                return (
                                    <span key={uid} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                                        {u?.name ?? uid.slice(0, 6)}
                                        {canManage ? (
                                            <button onClick={() => setTeam((t) => t.filter((x) => x !== uid))} className="text-slate-400 hover:text-rose-500">×</button>
                                        ) : null}
                                    </span>
                                );
                            })
                        )}
                        {canManage ? (
                            <select
                                value=""
                                onChange={(e) => {
                                    const v = e.target.value;
                                    if (v && !team.includes(v)) setTeam((t) => [...t, v]);
                                }}
                                className="ml-auto rounded-md border border-dashed border-slate-300 px-2 py-0.5 text-xs text-slate-500"
                            >
                                <option value="">+ Add</option>
                                {userOptions.filter((u) => !team.includes(u.id)).map((u) => (
                                    <option key={u.id} value={u.id}>{u.name ?? u.email}</option>
                                ))}
                            </select>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}
