import { db } from '../src/db';
import { assessmentRequestSuppliers, assessmentRequests, magicTokens } from '../src/db/schema';
import { eq } from 'drizzle-orm';

async function check() {
    console.log('Checking assessment request 86f116d5-be1f-44d2-aed2-220d050f0bba...');
    const [req] = await db.select().from(assessmentRequests).where(eq(assessmentRequests.id, '86f116d5-be1f-44d2-aed2-220d050f0bba')).limit(1);
    console.log('Assessment request:', req ? 'found' : 'NOT found');
    
    console.log('Checking participant b09f6404-b98f-45a8-88ad-1ccc477e9bb0...');
    const [supplier] = await db.select().from(assessmentRequestSuppliers).where(eq(assessmentRequestSuppliers.id, 'b09f6404-b98f-45a8-88ad-1ccc477e9bb0')).limit(1);
    console.log('Assessment request supplier:', supplier ? 'found' : 'NOT found');
    if (supplier) {
        console.log('  assessmentRequestId:', supplier.assessmentRequestId);
        console.log('  supplierId:', supplier.supplierId);
        console.log('  status:', supplier.status);
    }
    
    console.log('Checking magic tokens for assessment request 86f116d5-be1f-44d2-aed2-220d050f0bba...');
    const tokens = await db.select().from(magicTokens).where(eq(magicTokens.assessmentRequestId, '86f116d5-be1f-44d2-aed2-220d050f0bba')).limit(5);
    console.log('Found', tokens.length, 'magic tokens');
    for (const t of tokens) {
        console.log('  token:', t.token.substring(0, 16) + '...');
        console.log('  usedAt:', t.usedAt);
        console.log('  revokedAt:', t.revokedAt);
        console.log('  expiresAt:', t.expiresAt);
    }
    
    console.log('\nAll assessment requests:');
    const allReqs = await db.select().from(assessmentRequests).limit(10);
    console.log('Count:', allReqs.length);
    for (const r of allReqs) {
        console.log('  ID:', r.id, 'Title:', r.title);
    }
    
    console.log('\nAll assessment request suppliers:');
    const allSuppliers = await db.select().from(assessmentRequestSuppliers).limit(10);
    console.log('Count:', allSuppliers.length);
    for (const s of allSuppliers) {
        console.log('  ID:', s.id, 'status:', s.status, 'assessmentRequestId:', s.assessmentRequestId);
    }
}

check().catch(err => console.error('Error:', err));