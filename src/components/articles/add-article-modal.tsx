'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DEFAULT_ARTICLE_CATEGORIES, type ArticleItem } from './articles-schema';
import { createArticle } from '@/app/actions/articles';
import { toast } from 'sonner';

export const WEIGHT_UNITS_LIST = ['T', 'KG', 'G', 'MG', 'LB', 'OZ'];

interface AddArticleModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onArticleCreated?: (article: ArticleItem) => void;
}

export function AddArticleModal({
    open,
    onOpenChange,
    onArticleCreated,
}: AddArticleModalProps) {
    const [articleNumber, setArticleNumber] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [category, setCategory] = React.useState('');
    const [netWeight, setNetWeight] = React.useState('');
    const [netWeightUnit, setNetWeightUnit] = React.useState('');
    const [cnCode, setCnCode] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const artNum = articleNumber.trim() || `10000${Math.floor(100 + Math.random() * 900)}`;

        setIsSubmitting(true);
        try {
            const res = await createArticle({
                articleNumber: artNum,
                description: description.trim() || null,
                longText: description.trim() || null,
                category: category || null,
                netWeight: netWeight ? parseFloat(netWeight) : null,
                netWeightUnit: netWeightUnit || (netWeight ? 'G' : null),
                cnCode: cnCode.trim() || null,
            });

            if (res.success && res.data) {
                onArticleCreated?.(res.data);
                toast.success(`Article ${res.data.articleNumber} created successfully`);
                onOpenChange(false);
                resetForm();
            } else {
                toast.error(res.error || 'Failed to create article');
            }
        } catch {
            toast.error('Failed to create article');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setArticleNumber('');
        setDescription('');
        setCategory('');
        setNetWeight('');
        setNetWeightUnit('');
        setCnCode('');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px] p-6 rounded-2xl bg-white shadow-xl border border-slate-200">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Header (matches screenshot) */}
                    <DialogHeader className="space-y-1 text-left">
                        <DialogTitle className="text-[17px] font-bold text-slate-900">
                            Create Article
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500 font-normal">
                            Enter article properties to create a new article
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3.5 pt-2">
                        {/* 1. Article number */}
                        <div className="space-y-1.5">
                            <Label htmlFor="articleNumber" className="text-xs font-medium text-slate-700">
                                Article number
                            </Label>
                            <Input
                                id="articleNumber"
                                value={articleNumber}
                                onChange={(e) => setArticleNumber(e.target.value)}
                                className="h-9 text-xs bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-400"
                                autoFocus
                            />
                        </div>

                        {/* 2. Description (optional) */}
                        <div className="space-y-1.5">
                            <Label htmlFor="description" className="text-xs font-medium text-slate-700">
                                Description
                            </Label>
                            <Input
                                id="description"
                                placeholder="Enter a short description ..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="h-9 text-xs bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-400 placeholder:text-slate-400"
                            />
                        </div>

                        {/* 3. Category */}
                        <div className="space-y-1.5">
                            <Label htmlFor="category" className="text-xs font-medium text-slate-700">
                                Category
                            </Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger id="category" className="h-9 text-xs bg-white border-slate-200 focus:ring-1 focus:ring-slate-400">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border border-slate-200 shadow-lg max-h-60">
                                    {DEFAULT_ARTICLE_CATEGORIES.map((cat) => (
                                        <SelectItem key={cat} value={cat} className="text-xs cursor-pointer">
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* 4. Net weight & Unit Row (matches screenshot) */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-700">
                                Net weight
                            </Label>
                            <div className="grid grid-cols-[1fr_130px] gap-2.5 items-center">
                                <Input
                                    type="number"
                                    step="any"
                                    placeholder="Enter a number"
                                    value={netWeight}
                                    onChange={(e) => setNetWeight(e.target.value)}
                                    className="h-9 text-xs bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-400 placeholder:text-slate-400"
                                />

                                <Select value={netWeightUnit} onValueChange={setNetWeightUnit}>
                                    <SelectTrigger className="h-9 text-xs bg-white border-amber-500/80 hover:border-amber-600 focus:ring-2 focus:ring-amber-500/20 rounded-lg">
                                        <SelectValue placeholder="Select unit..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border border-slate-200 shadow-lg min-w-[130px]">
                                        {WEIGHT_UNITS_LIST.map((unit) => (
                                            <SelectItem key={unit} value={unit} className="text-xs font-medium cursor-pointer">
                                                {unit}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* 5. CN code */}
                        <div className="space-y-1.5">
                            <Label htmlFor="cnCode" className="text-xs font-medium text-slate-700">
                                CN code
                            </Label>
                            <Input
                                id="cnCode"
                                value={cnCode}
                                onChange={(e) => setCnCode(e.target.value)}
                                className="h-9 text-xs bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-400"
                            />
                        </div>
                    </div>

                    {/* Footer Actions (matches screenshot) */}
                    <DialogFooter className="pt-3 flex items-center justify-end gap-2 border-none">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                            className="h-9 px-4 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="h-9 px-4 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold rounded-lg shadow-2xs cursor-pointer"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Creating...' : 'Create article'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
