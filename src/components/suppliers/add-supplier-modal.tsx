"use client";

import * as React from "react";
import { Loader, Plus, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addSupplier } from "@/app/actions/suppliers";
import { SearchableCountrySelect } from "./searchable-country-select";

function MultiTagInput({
    values,
    onChange,
    placeholder,
}: {
    values: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
}) {
    const [draft, setDraft] = React.useState("");
    const commit = () => {
        const next = draft.trim();
        if (next && !values.includes(next)) onChange([...values, next]);
        setDraft("");
    };
    return (
        <div className="flex flex-wrap gap-1.5 rounded-md border border-slate-200 bg-white p-1.5">
            {values.map((value) => (
                <span
                    key={value}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                >
                    {value}
                    <button
                        type="button"
                        onClick={() => onChange(values.filter((v) => v !== value))}
                        className="text-slate-400 hover:text-rose-600"
                        aria-label={`Remove ${value}`}
                    >
                        <X className="h-3 w-3" />
                    </button>
                </span>
            ))}
            <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === ",") {
                        event.preventDefault();
                        commit();
                    } else if (event.key === "Backspace" && !draft && values.length) {
                        onChange(values.slice(0, -1));
                    }
                }}
                onBlur={commit}
                placeholder={placeholder ?? "Type and press Enter"}
                className="min-w-[120px] flex-1 bg-transparent text-sm outline-none"
            />
        </div>
    );
}

export function AddSupplierModal({
    open,
    onOpenChange,
    onCreated,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated: (id: string) => void;
}) {
    const [pending, startTransition] = React.useTransition();
    const formRef = React.useRef<HTMLFormElement>(null);
    const [areaOfNeed, setAreaOfNeed] = React.useState<string[]>([]);
    const [commodityGroup, setCommodityGroup] = React.useState<string[]>([]);
    const [responsibleBuyer, setResponsibleBuyer] = React.useState<string[]>([]);
    const [countryCode, setCountryCode] = React.useState("");

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        areaOfNeed.forEach((value) => formData.append("areaOfNeed", value));
        commodityGroup.forEach((value) => formData.append("commodityGroup", value));
        responsibleBuyer.forEach((value) => formData.append("responsibleBuyer", value));
        formData.set("countryCode", countryCode);

        startTransition(async () => {
            const result = await addSupplier(formData);
            if (result.success) {
                toast.success("Supplier added");
                onCreated((result as { id?: string }).id || "__new__");
                formRef.current?.reset();
                setAreaOfNeed([]);
                setCommodityGroup([]);
                setResponsibleBuyer([]);
                setCountryCode("");
                onOpenChange(false);
            } else {
                toast.error(result.error || "Failed to add supplier");
            }
        });
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[640px] max-w-[94vw] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
                    <div className="mb-4 flex items-start justify-between">
                        <div>
                            <Dialog.Title className="text-xl font-black tracking-tight text-slate-950">
                                Add Supplier
                            </Dialog.Title>
                            <Dialog.Description className="mt-1 text-sm text-slate-500">
                                Enter the supplier&apos;s profile information.
                            </Dialog.Description>
                        </div>
                        <Dialog.Close className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
                            <X className="h-5 w-5" />
                        </Dialog.Close>
                    </div>

                    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Supplier name *</Label>
                                <Input id="name" name="name" required placeholder="Company name" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Contact email *</Label>
                                <Input id="email" name="email" type="email" required placeholder="contact@company.com" />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="countryCode">Country *</Label>
                                <SearchableCountrySelect
                                    id="countryCode"
                                    name="countryCode"
                                    value={countryCode}
                                    onChange={setCountryCode}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="supplierNumber">Supplier number</Label>
                                <Input id="supplierNumber" name="supplierNumber" placeholder="Optional" />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="supplierType">Supplier Type</Label>
                                <Input id="supplierType" name="supplierType" placeholder="Manufacturer, Distributor, ..." />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="address1">Address line 1</Label>
                                <Input id="address1" name="address1" placeholder="Street address" />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="address2">Address line 2</Label>
                                <Input id="address2" name="address2" placeholder="Optional" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="postalCode">Postal code</Label>
                                <Input id="postalCode" name="postalCode" placeholder="Postal code" />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="city">City</Label>
                                <Input id="city" name="city" placeholder="City" />
                            </div>
                            <div></div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Area of Need</Label>
                            <MultiTagInput values={areaOfNeed} onChange={setAreaOfNeed} placeholder="e.g. Production, Logistics" />
                        </div>
                        <div className="grid gap-2">
                            <Label>Commodity Group</Label>
                            <MultiTagInput values={commodityGroup} onChange={setCommodityGroup} placeholder="e.g. Electronics, Fasteners" />
                        </div>
                        <div className="grid gap-2">
                            <Label>Responsible Buyer</Label>
                            <MultiTagInput values={responsibleBuyer} onChange={setResponsibleBuyer} placeholder="e.g. J. Smith, A. Khan" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="strategicClassification">Strategic Classification</Label>
                            <select
                                id="strategicClassification"
                                name="strategicClassification"
                                defaultValue=""
                                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                            >
                                <option value="">—</option>
                                <option value="Preferred Supplier (P)">Preferred Supplier (P)</option>
                                <option value="Strategic">Strategic</option>
                                <option value="Standard">Standard</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Dialog.Close asChild>
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Dialog.Close>
                            <Button type="submit" disabled={pending} className="gap-2">
                                {pending ? <Loader className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                Add Supplier
                            </Button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
