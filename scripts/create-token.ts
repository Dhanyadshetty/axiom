import { createMagicToken } from '../src/lib/services/magic-tokens';

async function test() {
    const assessmentId = '86f116d5-be1f-44d2-aed2-220d050f0bba';
    const participantId = 'b09f6404-b98f-45a8-88ad-1ccc477e9bb0';
    const contactId = 'd184baa7-917b-4a08-ba16-8229ad3e9335';
    const email = 'test@example.com';
    
    const result = await createMagicToken(assessmentId, participantId, contactId, email, 'invitation');
    console.log('New token result:', result);
    
    if (result) {
        const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
        const magicLink = `${baseUrl}/external/login?magictoken=${result.token}&redirect=${encodeURIComponent(`/external/assessments/${assessmentId}/requests/${participantId}/form`)}`;
        console.log('Magic link:', magicLink);
    }
}

test().catch(console.error);