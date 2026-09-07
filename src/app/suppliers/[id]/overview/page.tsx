import Link from "next/link";
import { resolveSupplierDetail } from "@/components/suppliers/detail/resolve-supplier";
import { SupplierOverviewTemplate, type OverviewSupplier } from "@/components/suppliers/detail/supplier-overview-template";

export const dynamic = "force-dynamic";

export default async function SupplierOverviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supplier = resolveSupplierDetail(id);

    if (!supplier) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 p-8 text-center">
                <p className="text-lg font-semibold text-slate-700">Supplier not found</p>
                <Link href="/suppliers" className="text-emerald-600 hover:underline">Back to suppliers</Link>
            </div>
        );
    }

    const overviewSupplier: OverviewSupplier = { ...supplier };
    return <SupplierOverviewTemplate supplier={overviewSupplier} />;
}
