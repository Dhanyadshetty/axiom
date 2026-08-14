import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getActiveLanguage, t } from "@/lib/i18n";

export default async function AccessDeniedPage() {
    const language = await getActiveLanguage();
    const tm = t(language, "misc");
    const ta = t(language, "admin");
    return (
        <div className="flex min-h-full items-center justify-center bg-muted/40 p-6 lg:p-10">
            <Card className="w-full max-w-xl border-amber-200 shadow-lg">
                <CardHeader>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                        <ShieldAlert className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl font-black tracking-tight text-slate-950">{tm.accessDeniedTitle}</CardTitle>
                    <CardDescription className="text-sm leading-6">
                        {tm.thisWorkspace}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                    <Link href="/">
                        <Button>{ta.returnToWorkspace}</Button>
                    </Link>
                    <Link href="/support">
                        <Button variant="outline">{ta.contactAdministrator}</Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}
