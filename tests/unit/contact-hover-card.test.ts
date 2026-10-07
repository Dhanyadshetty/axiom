import test from 'node:test';
import assert from 'node:assert/strict';
import type { ContactRow } from '@/app/actions/contacts-detail';

test('ContactRow has all genuine backend fields required for hover card details', () => {
    const sampleContact: ContactRow = {
        id: '9d429e7c-8cf3-49dd-af89-340e280ad603',
        name: 'quatsch@funktioniertnicht.com',
        email: 'quatsch@funktioniertnicht.com',
        phone: '+49 123 45678',
        supplierId: 'sup-123',
        supplierName: 'Tacto Testlieferant GmbH',
        supplierNumber: '10042',
        language: 'de',
        department: 'Sales, Purchasing',
        position: 'Head of Sales',
        responsibility: 'Account Management',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    assert.equal(sampleContact.status, 'active');
    assert.equal(sampleContact.email, 'quatsch@funktioniertnicht.com');
    assert.equal(sampleContact.supplierName, 'Tacto Testlieferant GmbH');
    assert.equal(sampleContact.supplierNumber, '10042');
    
    // Department parsing
    const departments = sampleContact.department!.split(/[,;|]/).map(d => d.trim());
    assert.deepEqual(departments, ['Sales', 'Purchasing']);
});
