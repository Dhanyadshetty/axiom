import { auth } from "@/auth";
import { getSystemTelemetry, getTelemetryStats } from "@/app/actions/telemetry";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Activity,
    Cpu,
    AlertCircle,
    Clock,
    User,
    Terminal
} from "lucide-react";
import { redirect } from "next/navigation";
import { getActiveLanguage, t } from "@/lib/i18n";

export const dynamic = 'force-dynamic';

export default async function TelemetryDashboard() {
    const language = await getActiveLanguage();
    const ta = t(language, "admin");
    const session = await auth();
    if (session?.user?.role !== 'admin') {
        redirect("/");
    }

    const logs = await getSystemTelemetry();
    const stats = await getTelemetryStats();

    return (
        <div className="flex min-h-full flex-col bg-muted/40 p-4 lg:p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Terminal className="h-8 w-8 text-indigo-600" />
                        {ta.systemIntelligenceTelemetry}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {ta.deepMonitoring}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                </div>
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-red-500">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-bold uppercase tracking-wider">{ta.technicalErrors}</CardDescription>
                        <CardTitle className="text-2xl">{stats?.errors || 0}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <AlertCircle className="h-3 w-3 text-red-500" /> {ta.logged30Days}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-bold uppercase tracking-wider">{ta.avgAiLatency}</CardDescription>
                        <CardTitle className="text-2xl">{stats?.avgLatency || 0} ms</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3 text-green-500" /> {ta.endToEndResponse}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-indigo-500">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-bold uppercase tracking-wider">{ta.totalDataPoints}</CardDescription>
                        <CardTitle className="text-2xl">{logs.length}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Activity className="h-3 w-3 text-indigo-500" /> {ta.activeInstrumentation}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-amber-500">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-bold uppercase tracking-wider">{ta.systemLoad}</CardDescription>
                        <CardTitle className="text-2xl">Stable</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Cpu className="h-3 w-3 text-amber-500" /> {ta.operationalHealth}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-lg overflow-hidden border-indigo-100">
                <CardHeader className="border-b bg-indigo-50/20">
                        <CardTitle className="text-lg">{ta.recentTelemetryStream}</CardTitle>
                        <CardDescription>{ta.realTimeLogs}</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-muted/50 border-b">
                                <tr>
                                    <th className="px-6 py-4 font-bold">{ta.type}</th>
                                    <th className="px-6 py-4 font-bold">{ta.scopeKey}</th>
                                    <th className="px-6 py-4 font-bold">{ta.value}</th>
                                    <th className="px-6 py-4 font-bold">{ta.user}</th>
                                    <th className="px-6 py-4 font-bold">{ta.time}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <Badge
                                                variant={log.type === 'error' ? 'destructive' : 'outline'}
                                                className="capitalize"
                                            >
                                                {log.type}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-indigo-900 line-clamp-1">{log.scope}</span>
                                                <span className="text-xs text-muted-foreground font-mono">{log.key}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {log.value ? (
                                                <span className="font-semibold text-xs bg-slate-100 px-2 py-1 rounded">
                                                    {log.value}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground italic text-xs">{ta.na}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center gap-1 text-xs">
                                                <User className="h-3 w-3" />
                                                {log.userName || ta.system}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">
                                            {new Date(log.createdAt!).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                                {logs.length === 0 && (
                                    <tr>
                                            <td colSpan={5} className="p-10 text-center text-muted-foreground">
                                                {ta.noTelemetryYet}
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
