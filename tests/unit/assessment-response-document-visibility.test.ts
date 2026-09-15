import test from 'node:test';
import assert from 'node:assert/strict';
import { collectUploadedDocumentsFromAnswers } from '../../src/lib/assessment-upload-documents';

test('collectUploadedDocumentsFromAnswers includes both additional file uploads and nested document upload fields', () => {
  const answers = {
    additional_documents: [
      { name: 'supplement.pdf', url: '/uploads/2026/09/supplement.pdf', size: 1200, type: 'application/pdf' },
    ],
    supplier_profile: {
      file: { name: 'profile.png', url: '/uploads/2026/09/profile.png', size: 800, type: 'image/png' },
      validFrom: '2025-01-01',
      validUntil: '2026-01-01',
    },
    nested_group: [
      {
        certification: {
          file: { name: 'cert.pdf', url: '/uploads/2026/09/cert.pdf', size: 500, type: 'application/pdf' },
        },
      },
    ],
  } as any;

  const docs = collectUploadedDocumentsFromAnswers(answers);

  assert.deepEqual(
    docs.map((doc) => ({ name: doc.documentName, url: doc.documentUrl })),
    [
      { name: 'supplement.pdf', url: '/uploads/2026/09/supplement.pdf' },
      { name: 'profile.png', url: '/uploads/2026/09/profile.png' },
      { name: 'cert.pdf', url: '/uploads/2026/09/cert.pdf' },
    ]
  );
});
