import { auth } from "@/auth";
import { canManageSuppliers } from "@/lib/rbac";
import { TableSettingsClient } from "@/components/suppliers/table-settings";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SuppliersSettingsPage() {
    const session = await auth();
    const allowed = session && session.user.role !== "supplier" && canManageSuppliers(session.user);

    if (!allowed) {
        return (
            <div className="mx-auto max-w-2xl p-10 text-center">
                <h1 className="text-2xl font-black text-slate-950">Table settings locked</h1>
                <p className="mt-2 text-sm text-slate-500">
                    Only admins with table-settings permission can configure the Suppliers module.
                </p>
                <div className="mt-4">
                    <Link href="/suppliers">
                        <Button variant="outline">Back to Suppliers</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-slate-50/60 p-4 lg:p-6">
            <div className="mb-5">
                <h1 className="text-2xl font-black tracking-tight text-slate-950">Supplier table settings</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Configure defaults for the configurable Suppliers table.
                </p>
            </div>
            <TableSettingsClient />
        </div>
    );
}
