'use client'

import React, { useEffect, useState, useTransition } from "react";
import { deleteSupplierDocument, getSupplierDocuments, uploadSupplierDocument } from "@/app/actions/portal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    FileText,
    Upload,
    Download,
    Trash2,
    Calendar,
    Search,
    Plus,
    Loader2,
    FileCheck,
    FileWarning
} from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { openOrDownloadFile } from "@/lib/client/download";
import { useLanguage } from "@/components/i18n/language-provider";
import { t } from "@/lib/i18n";

type SupplierDocumentRecord = Awaited<ReturnType<typeof getSupplierDocuments>>[number];

export default function SupplierDocuments() {
    const { language } = useLanguage();
    const tc = t(language, "documents");
    const [docs, setDocs] = useState<SupplierDocumentRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState("");

    const loadDocs = async () => {
        const data = await getSupplierDocuments();
        setDocs(data);
        setLoading(false);
    };

    useEffect(() => {
        getSupplierDocuments().then(data => {
            setDocs(data);
            setLoading(false);
        });
    }, []);

    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            const res = await uploadSupplierDocument(formData);
        if (res.success) {
            toast.success(tc.uploadSuccess);
            setIsModalOpen(false);
            loadDocs();
        } else {
            toast.error(res.error || tc.uploadFailed);
        }
        });
    };

    const handleDelete = (documentId: string) => {
        startTransition(async () => {
            const result = await deleteSupplierDocument(documentId);
            if (result.success) {
                toast.success("Document removed");
                loadDocs();
            } else {
                toast.error(result.error || "Remove failed");
            }
        });
    };

    const filteredDocs = docs.filter((doc) =>
        !search.trim() || String(doc.name || "").toLowerCase().includes(search.trim().toLowerCase())
    );

    if (loading) return <div className="p-8">{tc.syncingVault}</div>;

    return (
        <div className="flex min-h-full flex-col bg-muted/40 p-4 lg:p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{tc.vaultTitle}</h1>
                    <p className="text-muted-foreground mt-1">{tc.vaultSubtitle}</p>
                </div>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 font-bold h-11 shadow-lg bg-amber-600 hover:bg-amber-700 text-white shadow-amber-100">
                            <Plus className="h-4 w-4" /> {tc.uploadNewDocument}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <form onSubmit={handleUpload}>
                            <DialogHeader>
                                <DialogTitle>{tc.secureUpload}</DialogTitle>
                                <DialogDescription>
                                    {tc.secureUploadDesc}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6 py-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">{tc.documentName}</Label>
                                    <Input id="name" name="name" placeholder={tc.documentNamePlaceholder} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type">{tc.documentType}</Label>
                                    <Select name="type" defaultValue="other">
                                        <SelectTrigger>
                                            <SelectValue placeholder={tc.selectType} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="contract">{tc.typeContract}</SelectItem>
                                            <SelectItem value="invoice">{tc.typeInvoice}</SelectItem>
                                            <SelectItem value="quote">{tc.typeQuote}</SelectItem>
                                            <SelectItem value="license">{tc.typeLicense}</SelectItem>
                                            <SelectItem value="other">{tc.typeOther}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="file">{tc.fileLabel}</Label>
                                    <label htmlFor="file" className="flex items-center justify-center border-2 border-dashed rounded-xl p-4 lg:p-8 hover:bg-muted/50 transition-colors cursor-pointer group">
                                        <div className="flex flex-col items-center gap-2">
                                            <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                                            <span className="text-sm text-muted-foreground">{tc.clickToSelect}</span>
                                            <span className="text-[11px] text-muted-foreground">{tc.fileHint}</span>
                                        </div>
                                    </label>
                                    <Input id="file" name="file" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.csv,.txt,.xlsx,.xls" required />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" className="w-full h-11 font-bold" disabled={isPending}>
                                    {isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : tc.verifyUpload}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6">
                <Card className="shadow-sm border-none bg-gradient-to-r from-amber-50 to-stone-50/20 border-amber-100">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FileCheck className="h-5 w-5 text-amber-600" />
                            {tc.vaultSecurityNotice}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-blue-800/80 leading-relaxed max-w-2xl">
                            {tc.vaultSecurityText}
                        </p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>{tc.storedDocuments}</CardTitle>
                                <CardDescription>{tc.storedDocumentsDesc}</CardDescription>
                            </div>
                            <div className="relative w-72">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={tc.filterByName}
                                    className="pl-9 bg-muted/30 border-none shadow-none"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {filteredDocs.length === 0 ? (
                                <div className="py-20 text-center flex flex-col items-center gap-4">
                                    <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
                                        <FileWarning className="h-8 w-8 text-muted-foreground opacity-20" />
                                    </div>
                                    <p className="text-muted-foreground">{docs.length === 0 ? tc.vaultEmpty : tc.vaultNoMatch}</p>
                                </div>
                            ) : (
                                filteredDocs.map((doc) => (
                                    <div key={doc.id} className="flex items-center justify-between p-4 rounded-xl border border-muted-foreground/10 hover:border-primary/20 hover:bg-muted/30 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                                <FileText className="h-6 w-6 text-primary" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-foreground">{doc.name}</span>
                                                <div className="flex items-center gap-3 mt-1.5">
                                                    <Badge variant="secondary" className="text-[10px] uppercase h-5 font-bold">
                                                        {doc.type}
                                                    </Badge>
                                                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(doc.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 text-muted-foreground hover:text-primary"
                                                onClick={() => {
                                                    if (doc.url) {
                                                        openOrDownloadFile(doc.url, doc.name);
                                                    } else {
                                                        toast.error(tc.fileUnavailable);
                                                    }
                                                }}
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 text-muted-foreground hover:text-red-500"
                                                onClick={() => handleDelete(doc.id)}
                                                disabled={isPending}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
