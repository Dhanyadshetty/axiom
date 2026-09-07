"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, File, X, Download, Eye, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import type { FileUploadData } from "@/lib/assessment-templates/types";

interface FileUploadFieldProps {
  value: FileUploadData[];
  onChange: (value: FileUploadData[]) => void;
  label: string;
  required?: boolean;
  help?: string;
  disabled?: boolean;
  helperText?: string;
  multiple?: boolean;
  modalUpload?: boolean;
}

export function FileUploadField({
  value,
  onChange,
  label,
  required,
  help,
  disabled,
  helperText,
  multiple = false,
  modalUpload = false,
}: FileUploadFieldProps) {
  const [dragActive, setDragActive] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList) => {
    const newFiles: FileUploadData[] = Array.from(files).map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
      size: file.size,
      type: file.type,
    }));
    if (multiple) {
      onChange([...value, ...newFiles]);
    } else {
      onChange(newFiles);
    }
    if (modalUpload && !multiple) setModalOpen(false);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
        {label}
        {required && <span className="text-rose-500" aria-hidden="true">*</span>}
      </Label>

      {modalUpload && (
        <div className="space-y-3">
          {!disabled && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              {multiple ? "Add additional documents" : "Add additional document"}
            </Button>
          )}

          {value.length > 0 && (
            <div className="space-y-2">
              {value.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3"
                >
                  <File className="h-5 w-5 text-slate-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                    <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                  </div>
                  {!disabled && (
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" aria-label="Preview">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" aria-label="Download">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(idx)}
                        className="h-8 w-8 text-rose-500 hover:text-rose-600"
                        aria-label="Remove"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!modalUpload && !disabled && (
        <div
          ref={(el) => {
            if (el) el.addEventListener("click", () => fileInputRef.current?.click());
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            "rounded-lg border-2 border-dashed p-6 text-center transition-colors",
            dragActive
              ? "border-emerald-400 bg-emerald-50"
              : "border-slate-300 hover:border-emerald-400 hover:bg-slate-50"
          )}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            disabled={disabled}
            className="hidden"
            accept={multiple ? "*/*" : ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"}
          />
          <Upload className="mx-auto mb-2 h-8 w-8 text-slate-400" />
          <p className="text-sm font-medium text-slate-700">
            {multiple ? "Drag & drop files here, or click to browse" : "Drag & drop a file here, or click to browse"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {helperText || "Supported formats: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG"}
          </p>
        </div>
      )}

      {!modalUpload && value.length > 0 && (
        <div className="space-y-2">
          {value.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3"
            >
              <File className="h-5 w-5 text-slate-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
              </div>
              {!disabled && (
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" aria-label="Preview">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" aria-label="Download">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(idx)}
                    className="h-8 w-8 text-rose-500 hover:text-rose-600"
                    aria-label="Remove"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal upload for additional documents */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add additional document</DialogTitle>
          </DialogHeader>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "rounded-lg border-2 border-dashed p-6 text-center transition-colors cursor-pointer",
              dragActive
                ? "border-emerald-400 bg-emerald-50"
                : "border-slate-300 hover:border-emerald-400 hover:bg-slate-50"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple={multiple}
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              disabled={disabled}
              className="hidden"
              accept={multiple ? "*/*" : ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"}
            />
            <Upload className="mx-auto mb-2 h-8 w-8 text-slate-400" />
            <p className="text-sm font-medium text-slate-700">
              Click to upload or drag and drop one file here
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {help && <p className="text-xs text-slate-500">{help}</p>}
    </div>
  );
}