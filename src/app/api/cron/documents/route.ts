import { NextResponse } from 'next/server';
import { checkAndSendDocumentExpiryReminders } from '@/app/actions/documents';
import { isCronAuthorized } from '@/lib/api-security';
import { withPgAdvisoryLock } from '@/lib/db-locks';

export async function GET(req: Request) {
    try {
        if (!isCronAuthorized(req)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const locked = await withPgAdvisoryLock('cron:document_expiry_reminders', async () => {
            const result = await checkAndSendDocumentExpiryReminders();
            return NextResponse.json({
                ...result,
                timestamp: new Date().toISOString(),
            });
        });

        if (!locked.acquired) {
            return NextResponse.json({ success: true, skipped: true, reason: 'already_running' }, { status: 202 });
        }

        return locked.value;
    } catch (error) {
        console.error('[Document Expiry Alerts] Cron failed:', error);
        return NextResponse.json(
            { error: 'Failed to process document expiry alerts' },
            { status: 500 },
        );
    }
}

export async function POST(req: Request) {
    return GET(req);
}
