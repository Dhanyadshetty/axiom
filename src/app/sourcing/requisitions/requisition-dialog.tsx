'use client'

import { useState, useTransition } from "react";
import { Plus, ShoppingCart, Loader } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { createRequisition } from "@/app/actions/requisitions";
import { toast } from "sonner";
import { useLanguage } from "@/components/i18n/language-provider";
import { t } from "@/lib/i18n";

export function RequisitionDialog() {
    const { language } = useLanguage();
    const tc = t(language, "sourcing");
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    async function handleSubmit(formData: FormData) {
        const title = formData.get("title") as string;
        const estimatedAmount = parseFloat(formData.get("amount") as string);
        const department = formData.get("department") as string;
        const description = formData.get("description") as string;

        startTransition(async () => {
            const result = await createRequisition({
                title,
                estimatedAmount,
                department,
                description
            });

            if (result.success) {
                toast.success(tc.requisitionSubmitted);
                setOpen(false);
            } else {
                toast.error(result.error || tc.failedSubmitRequisition);
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 shadow-md">
                    <Plus className="mr-2 h-4 w-4" />
                    {tc.newRequest}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-primary" />
                        {tc.createPurchaseRequisition}
                    </DialogTitle>
                    <DialogDescription>
                        {tc.internalRequestGoods}
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">{tc.titlePurpose}</Label>
                        <Input id="title" name="title" placeholder={tc.titlePlaceholder} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="amount">{tc.estAmount} (₹)</Label>
                            <Input id="amount" name="amount" type="number" placeholder="0.00" step="0.01" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="department">{tc.department}</Label>
                            <Input id="department" name="department" placeholder={tc.departmentPlaceholder} />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">{tc.justification}</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder={tc.justificationPlaceholder}
                            className="min-h-[100px]"
                        />
                    </div>
                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>{tc.cancel}</Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                            {tc.submitRequest}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
