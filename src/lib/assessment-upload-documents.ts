import type { FormAnswer } from "@/lib/assessment-templates/types";

export type UploadedDocumentReference = {
  documentRequestId: string | null;
  documentUrl: string | null;
  responseText: string | null;
  documentName: string | null;
  submittedAt: Date | null;
};

function fileNameFromUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const path = new URL(url, "http://localhost").pathname;
    const decoded = decodeURIComponent(path.split("/").pop() ?? "");
    return decoded || null;
  } catch {
    return url.split("/").pop() ?? null;
  }
}

function isLikelyFileUpload(value: unknown): value is { url?: string; name?: string; file?: unknown } {
  if (!value || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.url === "string" && obj.url.length > 0
    || typeof obj.file === "object" && obj.file !== null && typeof (obj.file as { url?: unknown }).url === "string"
  );
}

export function collectUploadedDocumentsFromAnswers(answers: FormAnswer | Record<string, unknown> | null | undefined): UploadedDocumentReference[] {
  const items: UploadedDocumentReference[] = [];
  const seenUrls = new Set<string>();

  const pushDocument = (documentUrl: string | null, documentName?: string | null) => {
    if (!documentUrl || seenUrls.has(documentUrl)) return;
    seenUrls.add(documentUrl);
    items.push({
      documentRequestId: null,
      documentUrl,
      responseText: null,
      documentName: documentName ?? fileNameFromUrl(documentUrl) ?? "Uploaded document",
      submittedAt: null,
    });
  };

  const walk = (value: unknown) => {
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }

    if (!value || typeof value !== "object") {
      return;
    }

    const obj = value as Record<string, unknown>;

    if (typeof obj.url === "string" && obj.url.length > 0) {
      pushDocument(obj.url, typeof obj.name === "string" ? obj.name : undefined);
    }

    if (obj.file && typeof obj.file === "object") {
      const fileObj = obj.file as Record<string, unknown>;
      if (typeof fileObj.url === "string" && fileObj.url.length > 0) {
        pushDocument(fileObj.url, typeof fileObj.name === "string" ? fileObj.name : undefined);
      }
      walk(fileObj);
    }

    if (isLikelyFileUpload(obj)) {
      const nestedFile = obj.file as Record<string, unknown> | undefined;
      if (nestedFile && typeof nestedFile.url === "string" && nestedFile.url.length > 0) {
        pushDocument(nestedFile.url, typeof nestedFile.name === "string" ? nestedFile.name : undefined);
      }
    }

    for (const child of Object.values(obj)) {
      if (child !== obj) walk(child);
    }
  };

  walk(answers ?? null);
  return items;
}
