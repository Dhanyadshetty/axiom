import { auth } from "@/auth";
import { SuppliersModule } from "@/components/suppliers/SuppliersModule";
import { MOCK_SUPPLIERS } from "@/components/suppliers/tacto/suppliers-mock-data";
import { SUPPLIER_VIEWS, getView } from "@/components/suppliers/tacto/suppliers-model";
import { getSupplierWorkspaceRows } from "@/app/actions/suppliers";
import { dbRowToGridSupplier } from "@/components/suppliers/db-supplier-adapter";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SupplierViewPage({
    params,
}: {
    params: Promise<{ viewId: string }>;
}) {
    const { viewId } = await params;
    const view = getView(viewId);

    if (!view) {
        notFound();
    }

    const session = await auth();
    const role = (session?.user?.role as string) ?? "user";

    const mock = MOCK_SUPPLIERS;
    let suppliers = mock;
    try {
        const rows = await getSupplierWorkspaceRows();
        if (rows.length > 0) {
            const mapped = rows.map(dbRowToGridSupplier);
            const seen = new Set(mapped.map((s) => s.id));
            const mockExtra = mock.filter((m) => !seen.has(m.id));
            suppliers = [...mapped, ...mockExtra];
        }
    } catch {
        suppliers = mock;
    }

    return (
        <div className="min-h-full bg-slate-50/60 p-4 lg:p-6">
            <SuppliersModule
                suppliers={suppliers}
                defaultViewId={view.id}
                canManage={role === "admin"}
                canImport={role === "admin"}
                views={SUPPLIER_VIEWS}
            />
        </div>
    );
}