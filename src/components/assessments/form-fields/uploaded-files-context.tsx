"use client";

import * as React from "react";
import type { FileUploadData } from "@/lib/assessment-templates/types";

interface UploadedFilesContextValue {
    files: FileUploadData[];
    registerFile: (file: FileUploadData) => void;
}

const UploadedFilesContext = React.createContext<UploadedFilesContextValue | null>(null);

export function UploadedFilesProvider({ children }: { children: React.ReactNode }) {
    const [files, setFiles] = React.useState<FileUploadData[]>([]);

    const registerFile = React.useCallback((file: FileUploadData) => {
        setFiles((prev) => {
            // Deduplicate by name + url
            const exists = prev.some((f) => f.name === file.name && f.url === file.url);
            if (exists) return prev;
            return [...prev, file];
        });
    }, []);

    return (
        <UploadedFilesContext.Provider value={{ files, registerFile }}>
            {children}
        </UploadedFilesContext.Provider>
    );
}

export function useUploadedFiles(): UploadedFilesContextValue {
    const ctx = React.useContext(UploadedFilesContext);
    if (!ctx) {
        return { files: [], registerFile: () => {} };
    }
    return ctx;
}