"use client";

import * as React from "react";
import { ShortTextField } from "./ShortTextField";
import { LongTextRichField } from "./LongTextRichField";
import { NumberField } from "./NumberField";
import { SelectSingleField } from "./SelectSingleField";
import { SelectMultiTagsField } from "./SelectMultiTagsField";
import { YesNoConfirmField } from "./YesNoConfirmField";
import { TableRowsField } from "./TableRowsField";
import { FileUploadField } from "./FileUploadField";
import { DocumentReviewConfirmField } from "./DocumentReviewConfirmField";
import { DocumentUploadField } from "./DocumentUploadField";
import { ContactTableField } from "./ContactTableField";
import { LocationLookupField } from "./LocationLookupField";
import type { Field, FormAnswer } from "@/lib/assessment-templates/types";

type FieldRendererProps = {
  field: Field;
  value: FormAnswer[string];
  onChange: (value: FormAnswer[string]) => void;
  disabled?: boolean;
  readOnly?: boolean;
  validationErrors?: Record<string, string>;
  blockKey?: string;
  sectionKey?: string;
};

const fieldRenderers: Record<string, React.ComponentType<any>> = {
  short_text: ShortTextField,
  long_text_rich: LongTextRichField,
  number: NumberField,
  select_single: SelectSingleField,
  select_multi_tags: SelectMultiTagsField,
  yes_no_confirm: YesNoConfirmField,
  table_rows: TableRowsField,
  file_upload: FileUploadField,
  document_upload: DocumentUploadField,
  document_review_confirm: DocumentReviewConfirmField,
  contact_table: ContactTableField,
  location_lookup: LocationLookupField,
};

export function FieldRenderer({ field, value, onChange, disabled, readOnly, validationErrors, blockKey, sectionKey }: FieldRendererProps) {
  const Renderer = fieldRenderers[field.type];

  if (!Renderer) {
    return (
      <div className="text-sm text-slate-500">
        Unknown field type: {field.type}
      </div>
    );
  }

  return (
    <Renderer
      field={field}
      value={value as any}
      onChange={onChange}
      disabled={disabled || readOnly}
      validationErrors={validationErrors}
      blockKey={blockKey}
      sectionKey={sectionKey}
      label={field.label}
      required={field.required}
      help={field.help}
      options={(field as { options?: unknown }).options as never}
      placeholder={(field as { placeholder?: string }).placeholder}
      clearable={(field as { clearable?: boolean }).clearable}
      helperText={(field as { helperText?: string }).helperText}
      multiple={(field as { multiple?: boolean }).multiple}
      modalUpload={(field as { modalUpload?: boolean }).modalUpload}
      min={(field as { min?: number }).min}
      max={(field as { max?: number }).max}
      step={(field as { step?: number }).step}
      columns={(field as { columns?: unknown }).columns as never}
      emptyState={(field as { emptyState?: string }).emptyState}
      addButtonLabel={(field as { addButtonLabel?: string }).addButtonLabel}
      templates={(field as { templates?: unknown }).templates as never}
      subBlocks={(field as { subBlocks?: unknown }).subBlocks as never}
    />
  );
}

export function getFieldRenderer(fieldType: string) {
  return fieldRenderers[fieldType];
}

export function registerFieldRenderer(fieldType: string, renderer: React.ComponentType<any>) {
  fieldRenderers[fieldType] = renderer;
}