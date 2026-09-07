"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  CheckSquare,
  Type,
  Heading1,
  Heading2,
  Link,
  Pencil,
} from "lucide-react";

interface LongTextRichFieldProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  required?: boolean;
  help?: string;
  disabled?: boolean;
  placeholder?: string;
}

type ToolbarButton =
  | { type: "button"; icon: React.ComponentType<{ className?: string }>; format: string; title: string; value?: string; checklist?: boolean }
  | { type: "separator" };

const TOOLBAR_BUTTONS: ToolbarButton[] = [
  { type: "button", icon: Bold, format: "bold", title: "Bold (Ctrl+B)" },
  { type: "button", icon: Italic, format: "italic", title: "Italic (Ctrl+I)" },
  { type: "button", icon: Underline, format: "underline", title: "Underline (Ctrl+U)" },
  { type: "button", icon: Strikethrough, format: "strikeThrough", title: "Strikethrough" },
  { type: "separator" },
  { type: "button", icon: List, format: "insertUnorderedList", title: "Bullet list" },
  { type: "button", icon: ListOrdered, format: "insertOrderedList", title: "Numbered list" },
  { type: "button", icon: CheckSquare, format: "insertUnorderedList", title: "Checklist", checklist: true },
  { type: "separator" },
  { type: "button", icon: Heading1, format: "formatBlock", value: "h1", title: "Heading 1" },
  { type: "button", icon: Heading2, format: "formatBlock", value: "h2", title: "Heading 2" },
  { type: "separator" },
  { type: "button", icon: Link, format: "createLink", title: "Insert link" },
];

export function LongTextRichField({
  value,
  onChange,
  label,
  required,
  help,
  disabled,
  placeholder,
}: LongTextRichFieldProps) {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const [htmlValue, setHtmlValue] = React.useState(value);

  React.useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setHtmlValue(html);
      onChange(html);
    }
  };

  const execCommand = (command: string, value?: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
    handleInput();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "b") {
      e.preventDefault();
      execCommand("bold");
    } else if ((e.ctrlKey || e.metaKey) && e.key === "i") {
      e.preventDefault();
      execCommand("italic");
    } else if ((e.ctrlKey || e.metaKey) && e.key === "u") {
      e.preventDefault();
      execCommand("underline");
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    handleInput();
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
        {label}
        {required && <span className="text-rose-500" aria-hidden="true">*</span>}
      </Label>

      {!disabled && (
        <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-white p-1.5">
          {TOOLBAR_BUTTONS.map((btn, idx) => {
            if (btn.type === "separator") {
              return <div key={idx} className="w-px h-6 bg-slate-200 mx-1" />;
            }
            const Icon = btn.icon;
            const isActive = typeof document !== "undefined"
              ? (btn.format === "formatBlock"
                  ? document.queryCommandValue(btn.format) === btn.value
                  : document.queryCommandState(btn.format))
              : false;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (btn.format === "createLink") {
                    const url = prompt("Enter URL:");
                    if (url) execCommand(btn.format, url);
                  } else if (btn.format === "formatBlock") {
                    execCommand(btn.format, btn.value);
                  } else if (btn.checklist) {
                    execCommand("insertUnorderedList");
                    const selection = window.getSelection();
                    if (selection && selection.rangeCount > 0) {
                      const range = selection.getRangeAt(0);
                      const li = (range.startContainer as Element).closest("li");
                      if (li) li.setAttribute("data-checklist", "true");
                    }
                  } else {
                    execCommand(btn.format);
                  }
                }}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  isActive ? "bg-emerald-100 text-emerald-700" : "text-slate-600 hover:bg-slate-100"
                )}
                title={btn.title}
                disabled={disabled}
                aria-label={btn.title}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      )}

      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        className={cn(
          "min-h-[120px] max-h-[300px] overflow-y-auto rounded-lg border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-900 placeholder:text-slate-400",
          disabled && "bg-slate-50 cursor-not-allowed"
        )}
        {...(placeholder ? ({ placeholder } as Record<string, unknown>) : {})}
        role="textbox"
        aria-multiline="true"
        aria-label={label}
      />

      {help && <p className="text-xs text-slate-500">{help}</p>}
      <input type="hidden" name={label} defaultValue={htmlValue} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}