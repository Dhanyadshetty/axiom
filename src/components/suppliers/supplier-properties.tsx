"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Building2, Globe2, Landmark, Scale, Search, Plus, Trash2, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { updateSupplierProfile } from "@/app/actions/suppliers";

type Profile = Record<string, any>;

function routeId(supplier: { id: string; supplierNumber: string | null }) {
    return supplier.supplierNumber || supplier.id;
}

function getPath(obj: any, path: string): any {
    return path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

function setPath(obj: any, path: string, value: any): any {
    const keys = path.split(".");
    const root: any = Array.isArray(obj) ? [...obj] : { ...obj };
    let cur = root;
    for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        cur[k] = cur[k] && typeof cur[k] === "object" ? { ...cur[k] } : {};
        cur = cur[k];
    }
    cur[keys[keys.length - 1]] = value;
    return root;
}

function isEmpty(value: any): boolean {
    if (value == null) return true;
    if (typeof value === "string") return value.trim() === "";
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === "object") return Object.keys(value).length === 0;
    return false;
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={cn(
                "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                checked ? "bg-emerald-500" : "bg-slate-300",
            )}
        >
            <span
                className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    checked ? "translate-x-4" : "translate-x-0.5",
                )}
            />
        </button>
    );
}

function Field({
    label,
    value,
    onCommit,
    type = "text",
    className,
}: {
    label: string;
    value: string;
    onCommit: (v: string) => void;
    type?: string;
    className?: string;
}) {
    const [local, setLocal] = React.useState(value);
    React.useEffect(() => setLocal(value), [value]);
    return (
        <div className={className}>
            <Label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</Label>
            <Input
                type={type}
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                onBlur={() => local !== value && onCommit(local)}
                className="mt-1 h-9"
            />
        </div>
    );
}

export function SupplierProperties({ supplier }: { supplier: any }) {
    const [profile, setProfile] = React.useState<Profile>(supplier.profile || {});
    const [search, setSearch] = React.useState("");
    const [onlyValues, setOnlyValues] = React.useState(false);
    const [saving, setSaving] = React.useState(false);
    const rid = routeId(supplier);

    const updateAt = React.useCallback(
        (path: string, value: any) => {
            const next = setPath(profile, path, value);
            setProfile(next);
            setSaving(true);
            updateSupplierProfile(rid, next).finally(() => setSaving(false));
        },
        [profile, rid],
    );

    const searchMatch = (label: string, value: any) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            label.toLowerCase().includes(q) ||
            (typeof value === "string" && value.toLowerCase().includes(q))
        );
    };

    const sectionVisible = (fields: { label: string; value: any }[]) => {
        if (onlyValues && fields.every((f) => isEmpty(f.value))) return false;
        if (search.trim() && !fields.some((f) => searchMatch(f.label, f.value))) return false;
        return true;
    };

    // ── Key figure table helpers ────────────────────────────────────────────
    const updateArrayItem = (path: string, index: number, patch: any) => {
        const arr = [...(getPath(profile, path) || [])];
        arr[index] = { ...arr[index], ...patch };
        updateAt(path, arr);
    };
    const addArrayItem = (path: string, item: any) => {
        const arr = [...(getPath(profile, path) || []), item];
        updateAt(path, arr);
    };
    const removeArrayItem = (path: string, index: number) => {
        const arr = [...(getPath(profile, path) || [])];
        arr.splice(index, 1);
        updateAt(path, arr);
    };

    const gen = profile.general_information || {};
    const bank = profile.bank_account || {};
    const legal = profile.legal_information || {};
    const fin = profile.financial_figures_and_market || {};

    const generalFields = [
        { label: "Supplier number", value: supplier.supplierNumber ?? supplier.id },
        { label: "Company name", value: gen.company_name ?? "" },
        { label: "Address", value: gen.address ?? "" },
        { label: "Location HQ", value: gen.location_headquarter ?? "" },
        { label: "Local trade register", value: gen.local_trade_register ?? "" },
        { label: "DUNS number", value: gen.duns_number ?? "" },
        { label: "EORI number", value: gen.eori_number ?? "" },
        { label: "VAT ID", value: gen.vat_id ?? "" },
    ];
    const bankFields = [
        { label: "Public website", value: gen.public_website ?? "" },
        { label: "Bank name", value: bank.bank_name ?? "" },
        { label: "IBAN", value: bank.iban ?? "" },
        { label: "BIC / SWIFT", value: bank.bic_swift ?? "" },
        { label: "Account currency", value: bank.account_currency ?? "" },
    ];
    const legalFields = [
        { label: "Legal form", value: legal.legal_form ?? "" },
        { label: "Parent company", value: legal.parent_company ?? "" },
        { label: "Tax number", value: legal.tax_number ?? "" },
        { label: "VAT ID", value: gen.vat_id ?? "" },
        { label: "Year founded", value: legal.year_founded ?? "" },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-5xl px-4 py-6 lg:px-8">
                <Link
                    href={`/suppliers/${rid}/overview`}
                    className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to overview
                </Link>

                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                            <Building2 className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900">{supplier.name}</h1>
                            <p className="text-sm text-slate-500">Supplier properties & attributes</p>
                        </div>
                    </div>
                    <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">
                        {saving ? "Saving…" : "Saved"}
                    </Badge>
                </div>

                {/* Search & toggle */}
                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="relative flex-1 min-w-[240px]">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search properties…"
                            className="pl-9"
                        />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                        Only show properties with values
                        <Toggle checked={onlyValues} onChange={setOnlyValues} />
                    </label>
                </div>

                <div className="mt-4 space-y-4">
                    {/* General Information */}
                    {sectionVisible(generalFields) ? (
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-500">
                                    <Building2 className="h-4 w-4" /> General Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                <Field label="Supplier number" value={supplier.supplierNumber ?? supplier.id} onCommit={() => {}} className="sm:col-span-1" />
                                {generalFields.slice(1).map((f) => (
                                    <Field
                                        key={f.label}
                                        label={f.label}
                                        value={f.value}
                                        onCommit={(v) => updateAt(`general_information.${kebab(f.label)}`, v)}
                                    />
                                ))}
                            </CardContent>
                        </Card>
                    ) : null}

                    {/* Public Website & Bank Account */}
                    {sectionVisible(bankFields) ? (
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-500">
                                    <Landmark className="h-4 w-4" /> Public Website & Bank Account
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                <Field label="Public website" value={bankFields[0].value} onCommit={(v) => updateAt("general_information.public_website", v)} />
                                <Field label="Bank name" value={bank.bank_name ?? ""} onCommit={(v) => updateAt("bank_account.bank_name", v)} />
                                <Field label="IBAN" value={bank.iban ?? ""} onCommit={(v) => updateAt("bank_account.iban", v)} />
                                <Field label="BIC / SWIFT" value={bank.bic_swift ?? ""} onCommit={(v) => updateAt("bank_account.bic_swift", v)} />
                                <Field label="Account currency" value={bank.account_currency ?? ""} onCommit={(v) => updateAt("bank_account.account_currency", v)} />
                            </CardContent>
                        </Card>
                    ) : null}

                    {/* Legal Information */}
                    {sectionVisible(legalFields) ? (
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-500">
                                    <Scale className="h-4 w-4" /> Legal Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                <Field label="Legal form" value={legal.legal_form ?? ""} onCommit={(v) => updateAt("legal_information.legal_form", v)} />
                                <Field label="Parent company" value={legal.parent_company ?? ""} onCommit={(v) => updateAt("legal_information.parent_company", v)} />
                                <Field label="Tax number" value={legal.tax_number ?? ""} onCommit={(v) => updateAt("legal_information.tax_number", v)} />
                                <Field label="VAT ID" value={gen.vat_id ?? ""} onCommit={(v) => updateAt("general_information.vat_id", v)} />
                                <Field label="Year founded" value={legal.year_founded ?? ""} onCommit={(v) => updateAt("legal_information.year_founded", v)} />
                            </CardContent>
                        </Card>
                    ) : null}

                    {/* Key figure tables */}
                    <KeyTable
                        title="Investment volume"
                        columns={[
                            { key: "year", label: "Year", type: "number" },
                            { key: "investment_volume", label: "Investment volume", type: "number" },
                        ]}
                        rows={profile.investment_volume || []}
                        onAdd={(item) => addArrayItem("investment_volume", item)}
                        onEdit={(i, patch) => updateArrayItem("investment_volume", i, patch)}
                        onRemove={(i) => removeArrayItem("investment_volume", i)}
                        visible={!onlyValues || (profile.investment_volume || []).length > 0}
                    />

                    <KeyTable
                        title="Annual revenue"
                        columns={[
                            { key: "year", label: "Year", type: "number" },
                            { key: "revenue", label: "Annual revenue", type: "number" },
                        ]}
                        rows={fin.annual_revenue || []}
                        onAdd={(item) => addArrayItem("financialFigures.annual_revenue", item)}
                        onEdit={(i, patch) => updateArrayItem("financialFigures.annual_revenue", i, patch)}
                        onRemove={(i) => removeArrayItem("financialFigures.annual_revenue", i)}
                        visible={!onlyValues || (fin.annual_revenue || []).length > 0}
                    />

                    <KeyTable
                        title="Number of employees"
                        columns={[
                            { key: "year", label: "Year", type: "number" },
                            { key: "all", label: "All", type: "number" },
                            { key: "rnd", label: "R&D", type: "number" },
                            { key: "sales", label: "Sales", type: "number" },
                            { key: "quality", label: "Quality", type: "number" },
                            { key: "production", label: "Production", type: "number" },
                        ]}
                        rows={profile.workforce_by_year || []}
                        onAdd={(item) => addArrayItem("workforce_by_year", item)}
                        onEdit={(i, patch) => updateArrayItem("workforce_by_year", i, patch)}
                        onRemove={(i) => removeArrayItem("workforce_by_year", i)}
                        visible={!onlyValues || (profile.workforce_by_year || []).length > 0}
                    />

                    <KeyTable
                        title="Sites"
                        columns={[
                            { key: "description", label: "Description", type: "text" },
                            { key: "divisions", label: "Divisions (comma)", type: "text" },
                            { key: "working_shifts", label: "Working shifts", type: "number" },
                        ]}
                        rows={(profile.production_site?.sites_list || []).map((s: any) => ({
                            ...s,
                            divisions: Array.isArray(s.divisions) ? s.divisions.join(", ") : s.divisions,
                        }))}
                        onAdd={(item) => {
                            const mapped = {
                                ...item,
                                divisions: String(item.divisions || "")
                                    .split(",")
                                    .map((x: string) => x.trim())
                                    .filter(Boolean),
                            };
                            addArrayItem("production_site.sites_list", mapped);
                        }}
                        onEdit={(i, patch) => {
                            const mapped = {
                                ...patch,
                                divisions: typeof patch.divisions === "string"
                                    ? String(patch.divisions).split(",").map((x: string) => x.trim()).filter(Boolean)
                                    : patch.divisions,
                            };
                            updateArrayItem("production_site.sites_list", i, mapped);
                        }}
                        onRemove={(i) => removeArrayItem("production_site.sites_list", i)}
                        visible={!onlyValues || (profile.production_site?.sites_list || []).length > 0}
                    />

                    {/* User Defined Properties */}
                    <UserDefinedProperties supplier={supplier} profile={profile} updateAt={updateAt} search={search} onlyValues={onlyValues} />
                </div>
            </div>
        </div>
    );
}

function kebab(label: string) {
    return label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
}

function KeyTable({
    title,
    columns,
    rows,
    onAdd,
    onEdit,
    onRemove,
    visible,
}: {
    title: string;
    columns: { key: string; label: string; type: string }[];
    rows: any[];
    onAdd: (item: any) => void;
    onEdit: (index: number, patch: any) => void;
    onRemove: (index: number) => void;
    visible: boolean;
}) {
    const [open, setOpen] = React.useState(false);
    const [draft, setDraft] = React.useState<Record<string, string>>({});

    const submit = () => {
        const item: any = {};
        for (const c of columns) {
            item[c.key] = c.type === "number" ? Number(draft[c.key] || 0) : draft[c.key] || "";
        }
        onAdd(item);
        setDraft({});
        setOpen(false);
    };

    if (!visible) return null;

    return (
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-500">
                    <Database className="h-4 w-4" /> {title}
                </CardTitle>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="gap-1">
                            <Plus className="h-4 w-4" /> Add
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add {title}</DialogTitle>
                            <DialogDescription>Enter the values for the new row.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-3 py-2">
                            {columns.map((c) => (
                                <div key={c.key} className="grid gap-1">
                                    <Label className="text-xs font-semibold text-slate-500">{c.label}</Label>
                                    <Input
                                        type={c.type === "number" ? "number" : "text"}
                                        value={draft[c.key] || ""}
                                        onChange={(e) => setDraft((d) => ({ ...d, [c.key]: e.target.value }))}
                                    />
                                </div>
                            ))}
                        </div>
                        <Button onClick={submit}>Add row</Button>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {rows.length ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-xs font-black uppercase tracking-wide text-slate-400">
                                    {columns.map((c) => (
                                        <th key={c.key} className="px-2 py-2">{c.label}</th>
                                    ))}
                                    <th className="px-2 py-2" />
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, i) => (
                                    <tr key={i} className="border-b last:border-0">
                                        {columns.map((c) => (
                                            <td key={c.key} className="px-2 py-1.5">
                                                <Input
                                                    type={c.type === "number" ? "number" : "text"}
                                                    defaultValue={row[c.key]}
                                                    onBlur={(e) => onEdit(i, { [c.key]: c.type === "number" ? Number(e.target.value) : e.target.value })}
                                                    className="h-8"
                                                />
                                            </td>
                                        ))}
                                        <td className="px-2 py-1.5 text-right">
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-600" onClick={() => onRemove(i)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-sm text-slate-400">No entries yet. Use “Add” to create one.</p>
                )}
            </CardContent>
        </Card>
    );
}

function UserDefinedProperties({
    supplier,
    profile,
    updateAt,
    search,
    onlyValues,
}: {
    supplier: any;
    profile: Profile;
    updateAt: (path: string, value: any) => void;
    search: string;
    onlyValues: boolean;
}) {
    const uda = profile.user_defined_and_operational_attributes || {};
    const fields: { label: string; path: string; value: any; options?: string[] }[] = [
        { label: "Order Volume 2025", path: "invoicing_and_orders.order_volume_2025", value: profile.financial_figures_and_market?.invoicing_and_orders?.order_volume_2025 ?? "" },
        { label: "Order Volume 2024", path: "invoicing_and_orders.order_volume_2024", value: profile.financial_figures_and_market?.invoicing_and_orders?.order_volume_2024 ?? "" },
        { label: "Responsible Buyer", path: "responsibleBuyer", value: supplier.responsibleBuyer || [], options: undefined },
        { label: "ABC Classification Order Volume", path: "abcClassification", value: supplier.abcClassification ?? "" },
        { label: "Supplier Status", path: "user_defined_and_operational_attributes.supplier_status", value: uda.supplier_status ?? supplier.status ?? "" },
        { label: "Area of Need", path: "areaOfNeed", value: supplier.areaOfNeed || [] },
        { label: "Supplier Type", path: "supplierType", value: supplier.supplierType ?? "" },
        { label: "Commodity Group", path: "commodityGroup", value: supplier.commodityGroup || [] },
        { label: "Strategic Classification (Prettl Pyramid)", path: "strategicClassification", value: supplier.strategicClassification ?? "" },
        { label: "SSA sent", path: "user_defined_and_operational_attributes.ssa_sent", value: uda.ssa_sent ?? "" },
        { label: "SSA reviewed", path: "user_defined_and_operational_attributes.ssa_reviewed", value: uda.ssa_reviewed ?? "" },
    ];

    const visible = (f: { label: string; value: any }) => {
        if (onlyValues && isEmpty(f.value)) return false;
        if (search.trim()) {
            const q = search.toLowerCase();
            const str = Array.isArray(f.value) ? f.value.join(" ") : String(f.value);
            if (!f.label.toLowerCase().includes(q) && !str.toLowerCase().includes(q)) return false;
        }
        return true;
    };

    const shown = fields.filter(visible);
    if (search.trim() && shown.length === 0) return null;

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-500">
                    <Globe2 className="h-4 w-4" /> User Defined Properties
                </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {shown.map((f) => (
                    <div key={f.path}>
                        <Label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{f.label}</Label>
                        {Array.isArray(f.value) ? (
                            <Input
                                defaultValue={f.value.join(", ")}
                                onBlur={(e) =>
                                    updateAt(
                                        f.path,
                                        e.target.value.split(",").map((x) => x.trim()).filter(Boolean),
                                    )
                                }
                                className="mt-1 h-9"
                                placeholder="comma, separated"
                            />
                        ) : (
                            <Input
                                defaultValue={f.value}
                                onBlur={(e) => updateAt(f.path, e.target.value)}
                                className="mt-1 h-9"
                            />
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
