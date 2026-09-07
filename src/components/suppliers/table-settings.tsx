"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SUPPLIER_VIEWS } from "./suppliers-config";
import { useSupplierTablePrefs } from "./table-prefs";

export function TableSettingsClient() {
    const { prefs, update, reset } = useSupplierTablePrefs();

    return (
        <div className="mx-auto max-w-3xl space-y-5">
            <Card className="border-slate-200">
                <CardHeader>
                    <CardTitle className="text-xl">Default view</CardTitle>
                    <CardDescription>
                        The view loaded when you open the Suppliers module.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Label htmlFor="defaultView">Landing view</Label>
                    <select
                        id="defaultView"
                        className="mt-1.5 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                        value={prefs.defaultView}
                        onChange={(event) => update({ defaultView: event.target.value })}
                    >
                        {SUPPLIER_VIEWS.map((view) => (
                            <option key={view.id} value={view.id}>
                                {view.group} · {view.label}
                            </option>
                        ))}
                    </select>
                </CardContent>
            </Card>

            <Card className="border-slate-200">
                <CardHeader>
                    <CardTitle className="text-xl">Table layout</CardTitle>
                    <CardDescription>Control the frozen column and row density.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <label className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                        <span className="text-sm font-medium text-slate-700">Freeze first column (Supplier)</span>
                        <input
                            type="checkbox"
                            checked={prefs.freezeFirstColumn}
                            onChange={(event) => update({ freezeFirstColumn: event.target.checked })}
                            className="h-5 w-5 accent-primary"
                        />
                    </label>
                    <div>
                        <Label>Row density</Label>
                        <div className="mt-1.5 flex gap-2">
                            {(["comfortable", "compact"] as const).map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => update({ density: option })}
                                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors ${
                                        prefs.density === option
                                            ? "border-primary bg-primary/5 text-primary"
                                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                    }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button variant="outline" className="gap-2" onClick={reset}>
                    <RotateCcw className="h-4 w-4" /> Reset to defaults
                </Button>
            </div>
        </div>
    );
}
