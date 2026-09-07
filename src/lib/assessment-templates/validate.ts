import type { AssessmentTemplateSchema, Block, Field, FormAnswer, Section, SubBlock } from "./types";
import { IBAN_PATTERN, validateIBAN, runFieldValidations, getValidationConfig } from "./validation-rules";

interface RequiredFieldRef {
    key: string;
    label: string;
    type: Field["type"];
}

function collectFields(block: Block | SubBlock): Field[] {
    const fields = [...block.fields];
    if ("subBlocks" in block && block.subBlocks) {
        for (const sb of block.subBlocks) {
            fields.push(...sb.fields);
        }
    }
    return fields;
}

export function getRequiredFields(schema: AssessmentTemplateSchema): RequiredFieldRef[] {
    const refs: RequiredFieldRef[] = [];
    for (const section of schema.sections) {
        for (const block of section.blocks) {
            for (const field of collectFields(block)) {
                if (field.required) {
                    refs.push({ key: field.key, label: field.label, type: field.type });
                }
            }
        }
    }
    return refs;
}

function isEmptyForType(type: Field["type"], value: unknown): { empty: boolean; message?: string } {
    if (value === undefined || value === null) return { empty: true };

    switch (type) {
        case "short_text":
        case "long_text_rich":
        case "number":
            return value === "" ? { empty: true } : { empty: false };
        case "select_single":
        case "location_lookup":
            return value === "" || value === null ? { empty: true } : { empty: false };
        case "yes_no_confirm":
            // Acknowledgement fields: "yes" means confirmed, "no" means declined.
            // Treat a "no" answer as a validation failure with an inline message
            // rather than silently accepting it and writing the response to the DB.
            if (value === "yes") return { empty: false };
            if (value === "no") return { empty: true, message: "This acknowledgement requires \"Yes\" to submit." };
            return { empty: true, message: "Please select Yes or No." };
        case "select_multi_tags":
            return Array.isArray(value) && value.length === 0 ? { empty: true } : { empty: false };
        case "table_rows":
        case "contact_table":
            return !Array.isArray(value) || value.length === 0 ? { empty: true } : { empty: false };
        case "file_upload":
            return !Array.isArray(value) || value.length === 0 ? { empty: true } : { empty: false };
        case "document_upload":
            if (!value) return { empty: true };
            const du = value as { file?: unknown; notApplicable?: boolean };
            return !du.file && !du.notApplicable ? { empty: true } : { empty: false };
        case "document_review_confirm":
            return !(value as { confirmed?: boolean } | null)?.confirmed ? { empty: true } : { empty: false };
        default:
            return value === "" || (Array.isArray(value) && value.length === 0) ? { empty: true } : { empty: false };
    }
}

function emptyMessage(fieldLabel: string, override?: string): string {
    return override ? `${fieldLabel}: ${override}` : `${fieldLabel} is required`;
}

export interface FieldValidationError {
    fieldKey: string;
    fieldLabel: string;
    sectionKey: string;
    blockKey: string;
    message: string;
}

export function validateFormAnswers(schema: AssessmentTemplateSchema, answers: FormAnswer): string[] {
    const errors: string[] = [];
    for (const ref of getRequiredFields(schema)) {
        const value = answers[ref.key];
        const { empty, message } = isEmptyForType(ref.type, value);
        if (empty) {
            errors.push(emptyMessage(ref.label, message));
        }
    }

    // Additional custom validations (IBAN, etc.)
    for (const section of schema.sections) {
        for (const block of section.blocks) {
            for (const field of collectFields(block)) {
                const value = answers[field.key];
                const config = getValidationConfig(field.key);
                if (config) {
                    const result = runFieldValidations(value, config);
                    if (!result.valid) {
                        errors.push(...result.messages);
                    }
                }
            }
        }
    }

    return errors;
}

export function validateFormAnswersDetailed(schema: AssessmentTemplateSchema, answers: FormAnswer): FieldValidationError[] {
    const errors: FieldValidationError[] = [];

    for (const section of schema.sections) {
        for (const block of section.blocks) {
            for (const field of collectFields(block)) {
                const value = answers[field.key];

                // Check required (schema-driven). `isEmptyForType` returns an
                // optional override message for special cases like
                // yes_no_confirm="no" (acknowledgement declined) so the user
                // gets a clear inline reason instead of an opaque 500.
                if (field.required) {
                    const { empty, message } = isEmptyForType(field.type, value);
                    if (empty) {
                        errors.push({
                            fieldKey: field.key,
                            fieldLabel: field.label,
                            sectionKey: section.key,
                            blockKey: block.key,
                            message: message ?? "This field is required.",
                        });
                    }
                }

                // Check custom validations
                const config = getValidationConfig(field.key);
                if (config) {
                    const result = runFieldValidations(value, config);
                    if (!result.valid) {
                        for (const msg of result.messages) {
                            errors.push({
                                fieldKey: field.key,
                                fieldLabel: field.label,
                                sectionKey: section.key,
                                blockKey: block.key,
                                message: msg,
                            });
                        }
                    }
                }
            }
        }
    }

    return errors;
}

export function getSectionValidationErrors(
    schema: AssessmentTemplateSchema,
    answers: FormAnswer,
    sectionKey: string
): FieldValidationError[] {
    const allErrors = validateFormAnswersDetailed(schema, answers);
    return allErrors.filter((e) => e.sectionKey === sectionKey);
}

export function isAnswerComplete(schema: AssessmentTemplateSchema, answers: FormAnswer): boolean {
    return validateFormAnswers(schema, answers).length === 0;
}
