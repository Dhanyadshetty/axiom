import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { TableSettingsView } from "@/components/suppliers/table-settings-view";
import { SUPPLIER_VIEWS, getView } from "@/components/suppliers/tacto/suppliers-model";

export const dynamic = "force-dynamic";

export default async function TableSettingsPage({
    params,
}: {
    params: Promise<{ viewId: string }>;
}) {
    const { viewId } = await params;
    const session = await auth();
    const role = session?.user?.role;

    if (role !== "admin") {
        redirect("/suppliers");
    }

    const view = getView(viewId);
    const allViews = SUPPLIER_VIEWS;

    return (
        <div className="min-h-full bg-slate-50/60 p-4 lg:p-6">
            <div className="mb-4 flex items-center justify-between">
                <nav className="flex items-center gap-1.5 text-sm text-slate-400">
                    <Link href="/suppliers" className="hover:text-slate-700">
                        Suppliers
                    </Link>
                    <span>/</span>
                    <Link href={`/suppliers/views/${view.id}`} className="hover:text-slate-700">
                        Table Views
                    </Link>
                    <span>/</span>
                    <span className="font-semibold text-slate-800">{view.label}</span>
                </nav>
                <Link href={`/suppliers/views/${view.id}`}>
                    <Button variant="outline">Back to view</Button>
                </Link>
            </div>
            <TableSettingsView view={view} allViews={allViews} />
        </div>
    );
}