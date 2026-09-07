import { startEmailWorker } from '@/lib/queue/email-queue';

async function main() {
    console.log('[EmailWorker] Starting email worker...');
    const worker = await startEmailWorker();
    if (worker) {
        console.log('[EmailWorker] Email worker started successfully');
    } else {
        console.log('[EmailWorker] Worker not started (Redis not configured)');
    }
}

main().catch((error) => {
    console.error('[EmailWorker] Failed to start:', error);
    process.exit(1);
});