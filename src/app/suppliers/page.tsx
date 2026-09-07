import { auth } from "@/auth";
import { SuppliersModule } from "@/components/suppliers/SuppliersModule";
import { getSupplierWorkspaceRows } from "@/app/actions/suppliers";
import { MOCK_SUPPLIERS } from "@/components/suppliers/tacto/suppliers-mock-data";
import { SUPPLIER_VIEWS } from "@/components/suppliers/tacto/suppliers-model";
import { dbRowToGridSupplier } from "@/components/suppliers/db-supplier-adapter";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
    const session = await auth();
    const role = (session?.user?.role as string) ?? "user";
    const canManage = role === "admin";
    const canImport = role === "admin";

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
        <div className="flex h-full min-h-[calc(100dvh-3.5rem)] min-w-0 flex-col overflow-hidden bg-muted/40 p-4 lg:p-8">
            <SuppliersModule
                suppliers={suppliers}
                defaultViewId="classification"
                canManage={canManage}
                canImport={canImport}
                views={SUPPLIER_VIEWS}
            />
        </div>
    );
}