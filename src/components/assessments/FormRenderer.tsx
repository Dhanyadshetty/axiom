"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { FieldRenderer } from "./form-fields";
import { UploadedFilesProvider } from "./form-fields/uploaded-files-context";
import {
  AlertTriangle,
  MessageSquare,
  Building,
  FileText,
  Globe,
  Info,
  CreditCard,
  Shield,
  Factory,
  MapPin,
  Users,
  UserCheck,
  Euro,
  PieChart,
  Truck,
  Cog,
  Target,
  FileCheck,
  FileSignature,
  CheckCircle,
  Clock,
  Eye,
} from "lucide-react";
import type { AssessmentTemplateSchema, Section, Block, Field, FormAnswer } from "@/lib/assessment-templates/types";
import { getSectionValidationErrors } from "@/lib/assessment-templates/validate";

// Schema icon fields store kebab-case lucide icon names (e.g. "message-square").
// Resolve them to the actual component so they render as SVGs instead of raw text.
const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "message-square": MessageSquare,
  building: Building,
  "file-text": FileText,
  globe: Globe,
  info: Info,
  "credit-card": CreditCard,
  shield: Shield,
  factory: Factory,
  "map-pin": MapPin,
  users: Users,
  "user-check": UserCheck,
  euro: Euro,
  "pie-chart": PieChart,
  truck: Truck,
  cog: Cog,
  target: Target,
  "file-check": FileCheck,
  "file-signature": FileSignature,
  "check-circle": CheckCircle,
};

function resolveIcon(name?: string): React.ComponentType<{ className?: string }> | null {
  if (!name) return null;
  return ICONS[name] ?? null;
}

interface FormRendererProps {
  schema: AssessmentTemplateSchema;
  answers: FormAnswer;
  onChange: (answers: FormAnswer) => void;
  disabled?: boolean;
  readOnly?: boolean;
  onValidate?: (answers: FormAnswer) => { valid: boolean; errors: string[] };
  validationErrors?: Record<string, string>;
  showRequiredHighlights?: boolean;
}

function getNestedValue(obj: FormAnswer, path: string): any {
  return path.split(".").reduce<any>((acc, part) => acc?.[part], obj);
}

function setNestedValue(obj: FormAnswer, path: string, value: any): FormAnswer {
  const result = { ...obj };
  const parts = path.split(".");
  let current: any = result;

  for (let i = 0; i < parts.length - 1; i++) {
    current[parts[i]] = { ...current[parts[i]] };
    current = current[parts[i]];
  }

  current[parts[parts.length - 1]] = value;
  return result;
}

export function FormRenderer({
  schema,
  answers,
  onChange,
  disabled,
  readOnly,
  onValidate,
  validationErrors = {},
  showRequiredHighlights = false,
}: FormRendererProps) {
  const [touchedFields, setTouchedFields] = React.useState<Set<string>>(new Set());

  const handleFieldChange = React.useCallback(
    (fieldKey: string, value: any) => {
      const newAnswers = setNestedValue(answers, fieldKey, value);
      onChange(newAnswers);
    },
    [answers, onChange]
  );

  const handleBlur = React.useCallback((fieldKey: string) => {
    setTouchedFields((prev) => new Set([...prev, fieldKey]));
  }, []);

  // Answers may be empty (e.g. a fresh external assessment), so default each
  // field's value to a safe empty type instead of undefined (many field
  // components assume a defined value and would throw during render).
  const defaultValueFor = React.useCallback((field: Field): any => {
    switch (field.type) {
      case "table_rows":
      case "contact_table":
      case "select_multi_tags":
        return [];
      case "file_upload":
        return [];
      case "yes_no_confirm":
        return "";
      case "document_review_confirm":
        return { confirmed: false };
      case "document_upload":
        return null;
      default:
        return "";
    }
  }, []);

  const safeValue = React.useCallback(
    (field: Field, raw: any) => (raw === undefined || raw === null ? defaultValueFor(field) : raw),
    [defaultValueFor]
  );

  // Guard against undefined schema
  if (!schema || !schema.sections || !Array.isArray(schema.sections)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
      </div>
    );
  }

  return (
    <UploadedFilesProvider>
      <div className="space-y-6">
        {schema.sections.map((section) => {
        const sectionErrors = getSectionValidationErrors(schema, answers, section.key);
        const hasSectionErrors = sectionErrors.length > 0;
        const blocks = section.blocks ?? [];

        return (
          <section key={section.key} className="space-y-4" data-section={section.key}>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              {section.title}
              {hasSectionErrors && (
                <AlertTriangle className="h-4 w-4 text-rose-500 flex-shrink-0" aria-label="Validation errors in this section" />
              )}
            </h2>

            {blocks.map((block) => {
              const fields = block.fields ?? [];
              const subBlocks = block.subBlocks ?? [];
              return (
                <div
                  key={block.key}
                  className={cn(
                    "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm",
                    readOnly && "bg-slate-50",
                    hasSectionErrors && fields.some((f) => validationErrors[f.key]) && "border-rose-200"
                  )}
                >
                   <div className="flex items-start gap-3">
                     {block.icon && (() => {
                       const Icon = resolveIcon(block.icon);
                       if (!Icon) return null;
                       return (
                         <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                           <Icon className="h-5 w-5" />
                         </div>
                       );
                     })()}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 flex items-center gap-1.5">
                        {block.title}
                        {fields.some((f) => f.required) && (
                          <span className="text-rose-600 font-bold" aria-hidden="true">*</span>
                        )}
                      </h3>

                      {block.message && (
                        <div className="mt-2 rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-700 whitespace-pre-wrap">
                          {block.message}
                        </div>
                      )}

                      <div className="mt-4 space-y-4">
                        {fields.map((field) => {
                          const fieldError = validationErrors[field.key];
                          const fieldTouched = touchedFields.has(field.key);
                          const showError = fieldError && (fieldTouched || fieldError.includes("required"));
                          const fieldValue = safeValue(field, getNestedValue(answers, field.key));
                          const hasValue = fieldValue !== undefined && fieldValue !== null && fieldValue !== "" && !(Array.isArray(fieldValue) && fieldValue.length === 0);
                            const requiredMissing = field.required && !hasValue && !!showRequiredHighlights;

                          return (
                            <div
                              key={field.key}
                              className={cn(
                                "space-y-1.5 rounded-xl border border-transparent p-2 transition-colors",
                                showError && "border-rose-300 bg-rose-50/40",
                                requiredMissing && "border-rose-300 bg-rose-50/40 shadow-sm"
                              )}
                            >
                              <div className="flex w-full min-w-0 items-start gap-2">
                                <div className="w-full min-w-0 flex-1">
                                  <FieldRenderer
                                    field={field}
                                    value={fieldValue}
                                    onChange={(val) => handleFieldChange(field.key, val)}
                                    disabled={disabled}
                                    readOnly={readOnly}
                                    validationErrors={validationErrors}
                                    blockKey={block.key}
                                    sectionKey={section.key}
                                  />
                                </div>
                                {readOnly && hasValue && (
                                  <button
                                    type="button"
                                    className="mt-1.5 flex-shrink-0 p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                                    aria-label="View history"
                                    title="View history"
                                  >
                                    <Clock className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                              {showError && (
                                <p className="text-xs text-rose-500 flex items-center gap-1" role="alert">
                                  <span className="h-3 w-3 rounded-full bg-rose-500" />
                                  {fieldError}
                                </p>
                              )}
                            </div>
                          );
                        })}

                        {subBlocks.map((subBlock) => (
                          <div key={subBlock.key} className="mt-6 ml-4 border-l-2 border-emerald-200 pl-4 space-y-4">
                            <h4 className="font-medium text-slate-700 flex items-center gap-1.5">
                              {(() => {
                                const Icon = resolveIcon(subBlock.icon);
                                if (Icon) return <Icon className="h-4 w-4" />;
                                return <span className="text-lg">{"📍"}</span>;
                              })()}
                              {subBlock.title}
                            </h4>
                            { (subBlock.fields ?? []).map((field) => {
                              const fieldError = validationErrors[field.key];
                              const fieldTouched = touchedFields.has(field.key);
                              const showError = fieldError && (fieldTouched || fieldError.includes("required"));
                              const fieldValue = safeValue(field, getNestedValue(answers, field.key));
                              const hasValue = fieldValue !== undefined && fieldValue !== null && fieldValue !== "" && !(Array.isArray(fieldValue) && fieldValue.length === 0);
                              const requiredMissing = field.required && !hasValue && showRequiredHighlights;

                              return (
                                <div
                                  key={field.key}
                                  className={cn(
                                    "space-y-1.5 rounded-xl border border-transparent p-2 transition-colors",
                                    showError && "border-rose-300 bg-rose-50/40",
                                    requiredMissing && "border-rose-300 bg-rose-50/40 shadow-sm"
                                  )}
                                >
                                  <div className="flex w-full min-w-0 items-start gap-2">
                                    <div className="w-full min-w-0 flex-1">
                                      <FieldRenderer
                                        field={field}
                                        value={fieldValue}
                                        onChange={(val) => handleFieldChange(field.key, val)}
                                        disabled={disabled}
                                        readOnly={readOnly}
                                        validationErrors={validationErrors}
                                        blockKey={block.key}
                                        sectionKey={section.key}
                                      />
                                    </div>
                                    {readOnly && hasValue && (
                                      <button
                                        type="button"
                                        className="mt-1.5 flex-shrink-0 p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                                        aria-label="View history"
                                        title="View history"
                                      >
                                        <Clock className="h-4 w-4" />
                                      </button>
                                    )}
                                  </div>
                                  {showError && (
                                    <p className="text-xs text-rose-500 flex items-center gap-1" role="alert">
                                      <span className="h-3 w-3 rounded-full bg-rose-500" />
                                      {fieldError}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        );
      })}
      </div>
    </UploadedFilesProvider>
  );
}