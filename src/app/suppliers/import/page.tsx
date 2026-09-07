import { auth } from "@/auth";
import { canManageSuppliers } from "@/lib/rbac";
import { ImportWizard } from "@/components/suppliers/import-wizard";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SuppliersImportPage() {
    const session = await auth();
    const allowed = session && session.user.role !== "supplier" && canManageSuppliers(session.user);

    if (!allowed) {
        return (
            <div className="mx-auto max-w-2xl p-10 text-center">
                <h1 className="text-2xl font-black text-slate-950">Import not available</h1>
                <p className="mt-2 text-sm text-slate-500">
                    Bulk import is restricted to admin roles. Contact a workspace administrator if you need access.
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
            <ImportWizard />
        </div>
    );
}
