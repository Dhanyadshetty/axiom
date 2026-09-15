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
import { DateField } from "./DateField";
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
  date: DateField,
};

function getSafeFieldValue(field: Field, value: FormAnswer[string]): FormAnswer[string] | null {
  if (value !== undefined && value !== null) return value;

  switch (field.type) {
    case "table_rows":
    case "contact_table":
    case "select_multi_tags":
    case "file_upload":
      return [];
    case "document_review_confirm":
      return { confirmed: false };
    case "document_upload":
      return null;
    default:
      return "";
  }
}

export function FieldRenderer({
  field,
  value,
  onChange,
  disabled,
  readOnly,
  validationErrors,
  blockKey,
  sectionKey,
}: FieldRendererProps) {
  const Renderer = fieldRenderers[field.type];

  if (!Renderer) {
    return (
      <div className="text-sm text-slate-500">
        Unknown field type: {field.type}
      </div>
    );
  }

  const safeValue = getSafeFieldValue(field, value);

  return (
    <Renderer
      field={field}
      value={safeValue as any}
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
      columns={((field as { columns?: unknown }).columns ?? []) as never}
      emptyState={(field as { emptyState?: string }).emptyState}
      addButtonLabel={(field as { addButtonLabel?: string }).addButtonLabel}
      modalTitle={(field as { modalTitle?: string }).modalTitle}
      modalSubtitle={(field as { modalSubtitle?: string }).modalSubtitle}
      modalPrimaryButtonLabel={(field as { modalPrimaryButtonLabel?: string }).modalPrimaryButtonLabel}
      modalCancelButtonLabel={(field as { modalCancelButtonLabel?: string }).modalCancelButtonLabel}
      addRowModalTitle={(field as { addRowModalTitle?: string }).addRowModalTitle}
      addRowModalSubtitle={(field as { addRowModalSubtitle?: string }).addRowModalSubtitle}
      addRowModalFields={((field as { addRowModalFields?: unknown }).addRowModalFields ?? []) as never}
      addRowPrimaryButtonLabel={(field as { addRowPrimaryButtonLabel?: string }).addRowPrimaryButtonLabel}
      addRowCancelButtonLabel={(field as { addRowCancelButtonLabel?: string }).addRowCancelButtonLabel}
      modalFields={((field as { modalFields?: unknown }).modalFields ?? []) as never}
      templates={((field as { templates?: unknown }).templates ?? []) as never}
      subBlocks={((field as { subBlocks?: unknown }).subBlocks ?? []) as never}
    />
  );
}

export function getFieldRenderer(fieldType: string) {
  return fieldRenderers[fieldType];
}

export function registerFieldRenderer(fieldType: string, renderer: React.ComponentType<any>) {
  fieldRenderers[fieldType] = renderer;
}