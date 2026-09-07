import Link from "next/link";
import { resolveSupplierDetail } from "@/components/suppliers/detail/resolve-supplier";
import {
    SupplierEvaluationsTemplate,
} from "@/components/suppliers/detail/supplier-evaluations-template";
import {
    ensureEvaluationTemplatesSeeded,
    getEvaluationTemplates,
    getSupplierEvaluations,
} from "@/app/actions/supplier-evaluations";

export const dynamic = "force-dynamic";

export default async function SupplierEvaluationsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supplier = resolveSupplierDetail(id);

    if (!supplier) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 p-8 text-center">
                <p className="text-lg font-semibold text-slate-700">Supplier not found</p>
                <Link href="/suppliers" className="text-emerald-600 hover:underline">
                    Back to suppliers
                </Link>
            </div>
        );
    }

    await ensureEvaluationTemplatesSeeded();

    const [templates, evaluations] = await Promise.all([
        getEvaluationTemplates(),
        getSupplierEvaluations(supplier.id),
    ]);

    const headerSupplier = {
        id: supplier.id,
        supplierNumber: supplier.supplierNumber ?? supplier.id,
        name: supplier.name,
        countryCode: supplier.countryCode,
        countryName: supplier.countryName,
        city: supplier.city,
    };

    return (
        <SupplierEvaluationsTemplate
            supplier={headerSupplier}
            supplierId={supplier.id}
            supplierName={supplier.name}
            supplierNumber={headerSupplier.supplierNumber}
            initialEvaluations={evaluations}
            initialTemplates={templates}
        />
    );
}
