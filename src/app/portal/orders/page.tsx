import { getSupplierOrders } from "@/app/actions/portal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { t, getActiveLanguage } from "@/lib/i18n";

export const dynamic = 'force-dynamic';

const statusClasses: Record<string, string> = {
    draft: 'bg-stone-100 text-stone-600 border-stone-200',
    pending_approval: 'bg-amber-100 text-amber-700 border-amber-200',
    approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    sent: 'bg-blue-100 text-blue-700 border-blue-200',
    fulfilled: 'bg-green-100 text-green-700 border-green-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
};

export default async function SupplierOrdersPage() {
    const orders = await getSupplierOrders();
    const language = await getActiveLanguage();
    const tc = t(language, "portal");

    return (
        <div className="flex min-h-full flex-col bg-muted/40 p-4 lg:p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                    <ShoppingCart className="h-8 w-8 text-primary" /> {tc.ordersTitle}
                </h1>
                <p className="text-muted-foreground mt-1 font-medium">{tc.ordersSubtitle}</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{tc.ordersLedger}</CardTitle>
                    <CardDescription>{tc.ordersAvailable.replace("{n}", String(orders.length))}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="h-11 px-4 text-left text-xs uppercase text-muted-foreground">{tc.ordersHeaderOrder}</th>
                                    <th className="h-11 px-4 text-left text-xs uppercase text-muted-foreground">{tc.ordersHeaderStatus}</th>
                                    <th className="h-11 px-4 text-left text-xs uppercase text-muted-foreground">{tc.ordersHeaderAmount}</th>
                                    <th className="h-11 px-4 text-left text-xs uppercase text-muted-foreground">{tc.ordersHeaderCreated}</th>
                                    <th className="h-11 px-4 text-left text-xs uppercase text-muted-foreground">{tc.ordersHeaderItems}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id} className="border-b hover:bg-muted/40 transition-colors align-top">
                                        <td className="p-4 font-mono text-xs text-primary font-bold">{order.id?.slice(0, 8)}</td>
                                        <td className="p-4">
                                            <Badge className={statusClasses[order.status] || 'bg-stone-100 text-stone-600 border-stone-200'}>
                                                {String(order.status || 'unknown').replace('_', ' ')}
                                            </Badge>
                                        </td>
                                        <td className="p-4 font-semibold">{formatCurrency(order.totalAmount || 0)}</td>
                                        <td className="p-4 text-muted-foreground">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : tc.ordersNa}</td>
                                        <td className="p-4 min-w-[260px]">
                                            <div className="space-y-1 text-xs">
                                                {(order.items || []).length === 0 ? (
                                                    <span className="text-muted-foreground italic">{tc.ordersNoItems}</span>
                                                ) : (
                                                    (order.items || []).map((item) => (
                                                        <div key={item.id} className="flex items-center justify-between gap-2">
                                                            <span className="font-medium">{item.part?.name || tc.ordersUnknownPart} ({item.part?.sku || tc.ordersNa})</span>
                                                            <span className="text-muted-foreground">Qty {item.quantity}</span>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {orders.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-10 text-center text-muted-foreground italic">
                                            {tc.ordersNoneAvailable}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
