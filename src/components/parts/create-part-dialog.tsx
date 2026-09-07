'use client';

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { addPart } from "@/app/actions/parts";
import { getMarketTrend } from "@/app/actions/intelligence";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { useLanguage } from "@/components/i18n/language-provider";
import { t } from "@/lib/i18n";

export function CreatePartDialog() {
    const { language } = useLanguage();
    const ts = t(language, "sourcing");
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetchingTrend, setIsFetchingTrend] = useState(false);
    const [marketTrendValue, setMarketTrendValue] = useState('stable');
    const [trendReason, setTrendReason] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>("");

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        try {
            const result = await addPart(formData);
            if (result.success) {
                toast.success(ts.partAdded);
                setOpen(false);
            } else {
                toast.error(ts.failedAdd);
            }
        } catch (_error) {
            toast.error(ts.errorOccurred);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-100">
                    <Plus className="mr-2 h-4 w-4" />
                    {ts.addPartSubmit}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{ts.addPartDialogTitle}</DialogTitle>
                    <DialogDescription>
                        {ts.addPartDialogDesc}
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                {ts.name}
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="e.g. Industrial Bearing"
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="sku" className="text-right">
                                {ts.sku}
                            </Label>
                            <Input
                                id="sku"
                                name="sku"
                                placeholder="e.g. PART-001"
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">
                                {ts.category}
                            </Label>
                            <Select name="category" onValueChange={setSelectedCategory} required>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder={ts.selectCategory} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Mechanical">Mechanical</SelectItem>
                                    <SelectItem value="Electronics">Electronics</SelectItem>
                                    <SelectItem value="Hydraulics">Hydraulics</SelectItem>
                                    <SelectItem value="Plumbing">Plumbing</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="countryCode" className="text-right text-[10px] font-bold uppercase">
                                {ts.country}
                            </Label>
                            <Input
                                id="countryCode"
                                name="countryCode"
                                placeholder="DE"
                                className="col-span-1 uppercase"
                                maxLength={2}
                            />
                            <Label htmlFor="region" className="text-right text-[10px] font-bold uppercase">
                                {ts.region}
                            </Label>
                            <Input
                                id="region"
                                name="region"
                                placeholder="Europe"
                                className="col-span-1"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="stock" className="text-right">
                                {ts.stock}
                            </Label>
                            <Input
                                id="stock"
                                name="stock"
                                type="number"
                                defaultValue="0"
                                className="col-span-3"
                                min="0"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">
                                {ts.price}
                            </Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                defaultValue="0.00"
                                className="col-span-3 font-bold"
                                min="0"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="marketTrend" className="text-right">
                                {ts.trend}
                            </Label>
                            <Select name="marketTrend" value={marketTrendValue} onValueChange={setMarketTrendValue}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder={ts.selectTrend} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="stable">Stable</SelectItem>
                                    <SelectItem value="up">Rising</SelectItem>
                                    <SelectItem value="down">Falling</SelectItem>
                                    <SelectItem value="volatile">Volatile</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="reorderPoint" className="text-right text-[10px] font-bold uppercase">{ts.reorder}</Label>
                            <Input
                                id="reorderPoint"
                                name="reorderPoint"
                                type="number"
                                defaultValue="50"
                                className="col-span-1"
                                min="0"
                                required
                            />
                                <Label htmlFor="minStockLevel" className="text-right text-[10px] font-bold uppercase">{ts.min}</Label>
                            <Input
                                id="minStockLevel"
                                name="minStockLevel"
                                type="number"
                                defaultValue="20"
                                className="col-span-1"
                                min="0"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <div />
                            <div className="col-span-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 flex items-center gap-2"
                                    onClick={async () => {
                                        const nameInput = (document.getElementById('name') as HTMLInputElement)?.value;
                                        if (!nameInput) return toast.error(ts.pleaseName);
                                        if (!selectedCategory) return toast.error(ts.pleaseCategory);

                                        setIsFetchingTrend(true);
                                        try {
                                            const intelligence = await getMarketTrend(nameInput, selectedCategory);
                                            setMarketTrendValue(intelligence.trend);
                                            setTrendReason(intelligence.reason);
                                            toast.success(ts.intelligenceFetched);
                                        } catch (_error) {
                                            toast.error(ts.failedFetch);
                                        } finally {
                                            setIsFetchingTrend(false);
                                        }
                                    }}
                                    disabled={isFetchingTrend || isSubmitting}
                                >
                                    {isFetchingTrend ? <Loader2 className="h-3 w-3 animate-spin" /> : <AlertTriangle className="h-3 w-3" />}
                                    {ts.getSmartTrend}
                                </Button>
                                {trendReason && (
                                    <p className="mt-2 text-[10px] text-muted-foreground leading-tight italic bg-muted/50 p-2 rounded border border-dashed">
                                        {trendReason}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {ts.addPartSubmit}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    );
}
