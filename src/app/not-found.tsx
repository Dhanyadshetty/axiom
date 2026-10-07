import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BarChart3, Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center space-y-6">
            <div className="h-16 w-16 rounded-2xl bg-muted/60 flex items-center justify-center border border-border">
                <span className="text-3xl font-black text-foreground">404</span>
            </div>
            <div className="space-y-2 max-w-md">
                <h1 className="text-xl font-bold tracking-tight text-foreground">Page Not Found</h1>
                <p className="text-sm text-muted-foreground">
                    The requested page could not be located. You can navigate back to the overview or open Analytics.
                </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
                <Link href="/">
                    <Button variant="outline" className="gap-2 text-xs">
                        <Home className="h-4 w-4" />
                        Dashboard
                    </Button>
                </Link>
                <Link href="/analytics">
                    <Button className="gap-2 text-xs">
                        <BarChart3 className="h-4 w-4" />
                        Go to Analytics
                    </Button>
                </Link>
            </div>
        </div>
    );
}
