export type DocumentUploadDescriptor = {
  url?: string | null;
  name?: string | null;
};

export function getDocumentUploadLabel(
  upload: DocumentUploadDescriptor | null | undefined,
  fallbackName: string
): string {
  const uploadedName = upload?.name?.trim();
  if (uploadedName) {
    return uploadedName;
  }

  return fallbackName;
}
