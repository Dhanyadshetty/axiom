export type FieldType =
  | "short_text"
  | "long_text_rich"
  | "number"
  | "select_single"
  | "select_multi_tags"
  | "yes_no_confirm"
  | "table_rows"
  | "file_upload"
  | "document_upload"
  | "document_review_confirm"
  | "contact_table"
  | "location_lookup"
  | "date";

export interface SelectOption {
  value: string;
  label: string;
  labelDe?: string;
}

export type Lang = "en" | "de";

export interface TableColumn {
  key: string;
  label: string;
  labelDe?: string;
  type: FieldType;
  required?: boolean;
  options?: SelectOption[];
  min?: number;
  max?: number;
  step?: number;
}

export interface ModalField {
  key: string;
  label: string;
  labelDe?: string;
  type: FieldType;
  required?: boolean;
  options?: SelectOption[];
  min?: number;
  max?: number;
  placeholder?: string;
  placeholderDe?: string;
}

export interface BaseField {
  key: string;
  label: string;
  labelDe?: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  helpDe?: string;
  options?: SelectOption[];
  min?: number;
  max?: number;
  step?: number;
  helperText?: string;
  helperTextDe?: string;
  multiple?: boolean;
  clearable?: boolean;
  modalUpload?: boolean;
  templates?: Array<{ id: string; name: string; nameDe?: string; url: string }>;
}

export interface TableRowsField extends BaseField {
  type: "table_rows";
  columns: TableColumn[];
  emptyState?: string;
  emptyStateDe?: string;
  addButtonLabel?: string;
  addButtonLabelDe?: string;
  subBlocks?: SubBlock[];
  addRowModalTitle?: string;
  addRowModalSubtitle?: string;
  addRowModalFields?: ModalField[];
  addRowPrimaryButtonLabel?: string;
  addRowCancelButtonLabel?: string;
}

export interface ContactTableField extends BaseField {
  type: "contact_table";
  columns: TableColumn[];
  addButtonLabel?: string;
  addButtonLabelDe?: string;
  modalTitle?: string;
  modalSubtitle?: string;
  modalFields?: ModalField[];
  modalPrimaryButtonLabel?: string;
  modalCancelButtonLabel?: string;
}

export interface DocumentReviewConfirmField extends BaseField {
  type: "document_review_confirm";
  templates?: Array<{ id: string; name: string; nameDe?: string; url: string }>;
}

export interface DocumentUploadField extends BaseField {
  type: "document_upload";
  templates?: Array<{ id: string; name: string; nameDe?: string; url: string }>;
}

export type Field =
  | BaseField
  | TableRowsField
  | ContactTableField
  | DocumentReviewConfirmField
  | DocumentUploadField;

export interface SubBlock {
  key: string;
  title: string;
  titleDe?: string;
  icon?: string;
  fields: Field[];
}

export interface Block {
  key: string;
  title: string;
  titleDe?: string;
  icon?: string;
  message?: string;
  messageDe?: string;
  fields: Field[];
  subBlocks?: SubBlock[];
}

export interface Section {
  key: string;
  title: string;
  titleDe?: string;
  order: number;
  blocks: Block[];
}

export interface AssessmentTemplateSchema {
  id: string;
  name: string;
  category: string;
  version: string;
  description: string;
  sections: Section[];
}

export interface FormAnswer {
  [fieldKey: string]: FormFieldValue;
}

export type FormFieldValue =
  | string
  | number
  | boolean
  | string[]
  | TableRowData[]
  | ContactRowData[]
  | FileUploadData[]
  | DocumentReviewData
  | DocumentUploadData;

export interface TableRowData {
  [columnKey: string]: string | number | boolean | string[];
}

export interface ContactRowData {
  name: string;
  email: string;
  language?: string;
  department?: string[];
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  responsibility?: string;
  position?: string;
}

export interface FileUploadData {
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface DocumentReviewData {
  confirmed: boolean;
  notApplicable?: boolean;
  templateId?: string;
  confirmedAt?: string;
  decision?: "accepted" | "declined" | "";
}

export interface DocumentUploadData {
  file?: FileUploadData | null;
  validFrom?: string;
  validUntil?: string;
  notApplicable?: boolean;
  naReason?: string;
}

export interface FormResponse {
  assessmentRequestId: string;
  supplierId: string;
  contactId: string;
  answers: FormAnswer;
  status: "draft" | "in_progress" | "submitted" | "rejected";
  startedAt?: string;
  submittedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}