import test from "node:test";
import assert from "node:assert/strict";

import { getDocumentUploadLabel } from "../../src/lib/document-upload-display";

test("returns the uploaded document name when available", () => {
  assert.equal(
    getDocumentUploadLabel({ url: "/uploads/2026/09/file.pdf", name: "ISO 9001 Certificate.pdf" }, "ISO 9001"),
    "ISO 9001 Certificate.pdf"
  );
});

test("falls back to the required document name when no uploaded file name is stored", () => {
  assert.equal(
    getDocumentUploadLabel({ url: "/uploads/2026/09/file.pdf" }, "ISO 9001"),
    "ISO 9001"
  );
});
