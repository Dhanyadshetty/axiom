import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CreateOrderDialog } from "@/components/sourcing/create-order-dialog";
import { getParts } from "@/app/actions/parts";
import { getOrders } from "@/app/actions/orders";
import { getSuppliers } from "@/app/actions/suppliers";
import Link from "next/link";
import { OrderActions } from "@/components/sourcing/order-actions";
import { OrderCharts } from "@/components/sourcing/order-charts";
import { formatPmaId } from "@/lib/utils/format-id";
import { auth } from "@/auth";
import { canManageSourcing } from "@/lib/rbac";
import { getActiveLanguage, t } from "@/lib/i18n";

export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
    const session = await auth();
    const ordersList = await getOrders();
    const suppliers = await getSuppliers();
    const parts = await getParts();
    const canCreateOrder = canManageSourcing(session?.user);
    const language = await getActiveLanguage();
    const ts = t(language, "sourcing");

    return (
        <div className="flex min-h-full flex-col bg-muted/40 p-4 lg:p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{ts.procurementOrders}</h1>
                    <p className="text-muted-foreground mt-1">{ts.procurementOrdersSubtitle}</p>
                </div>

                {canCreateOrder ? <CreateOrderDialog suppliers={suppliers} parts={parts} /> : null}
            </div>

            {/* Order Charts */}
            <OrderCharts orders={ordersList} />

            <Card>
                <CardHeader>
                    <CardTitle>{ts.activeOrders}</CardTitle>
                    <CardDescription>{ts.activeOrdersDesc}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 text-left align-middle font-black text-muted-foreground uppercase tracking-widest text-[10px]">{ts.orderId}</th>
                                        <th className="h-12 px-4 text-left align-middle font-black text-muted-foreground uppercase tracking-widest text-[10px]">{ts.supplier}</th>
                                        <th className="h-12 px-4 text-left align-middle font-black text-muted-foreground uppercase tracking-widest text-[10px]">{ts.status}</th>
                                        <th className="h-12 px-4 text-left align-middle font-black text-muted-foreground uppercase tracking-widest text-[10px]">{ts.amount}</th>
                                        <th className="h-12 px-4 text-right align-middle font-black text-muted-foreground uppercase tracking-widest text-[10px]">{ts.action}</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {ordersList.map((order) => (
                                        <tr key={order.id} className="border-b transition-colors hover:bg-muted/30">
                                            <td className="p-4 align-middle font-mono text-xs">
                                                <Link href={`/sourcing/orders/${order.id}`} className="font-bold text-primary hover:underline transition-colors">
                                                    {formatPmaId(order.id, 'order', order.createdAt)}
                                                </Link>
                                            </td>
                                            <td className="p-4 align-middle font-bold text-slate-700">{order.supplier?.name || ts.unknownSupplier}</td>
                                            <td className="p-4 align-middle capitalize">
                                                <Badge variant="outline" className={cn(
                                                    "font-black text-[10px] uppercase tracking-widest px-2 py-0.5",
                                                    order.status === 'fulfilled' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                                        order.status === 'sent' ? "bg-sky-50 text-sky-700 border-sky-100" :
                                                            order.status === 'pending_approval' ? "bg-amber-50 text-amber-700 border-amber-100" :
                                                                "bg-slate-50 text-slate-600 border-slate-100"
                                                )}>
                                                    {order.status?.replace('_', ' ') || ts.notAvailableShort}
                                                </Badge>
                                            </td>
                                            <td className="p-4 align-middle font-bold">
                                                ₹{Number(order.totalAmount).toLocaleString()}
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                <OrderActions
                                                    orderId={order.id}
                                                    status={order.status}
                                                    supplierId={order.supplierId}
                                                    totalAmount={Number(order.totalAmount)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                    {ordersList.length === 0 && (
                                        <tr className="border-b transition-colors hover:bg-muted/50">
                                            <td colSpan={4} className="p-4 text-center text-muted-foreground">{ts.noOrdersFound}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
