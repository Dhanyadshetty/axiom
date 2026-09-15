"use client";

import type { FileUploadData } from "@/lib/assessment-templates/types";

/** Stores a selected form document before its URL is added to form answers. */
export async function uploadFormFile(file: File): Promise<FileUploadData> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", { method: "POST", body: formData });
    const payload = await response.json().catch(() => null) as { url?: string; filename?: string; size?: number; type?: string; error?: string } | null;
    if (!response.ok || !payload?.url) {
        throw new Error(payload?.error ?? "Upload failed");
    }

    return {
        name: payload.filename || file.name,
        url: payload.url,
        size: payload.size ?? file.size,
        type: payload.type ?? file.type,
    };
}

// Existing callers use this storage-oriented name. Keep it as the same
// durable upload operation so every form and document workflow stores URLs.
export const uploadFileToStorage = uploadFormFile;
