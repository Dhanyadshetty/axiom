import type { AssessmentTemplateSchema } from "./types";

import pma from "./supplier-self-assessment-pma-code-of-conduct.json";
import coc from "./code-of-conduct.json";
import esgDocs from "./esg-document-request.json";
import esgLabor from "./esg-supplier-self-assessment-labor-rights.json";
import esgHuman from "./esg-supplier-self-assessment-human-rights.json";
import esgEnv from "./esg-supplier-self-assessment-environmental-rights.json";
import esgEgb from "./esg-self-assessment-egb.json";
import reach from "./reach-enquiry.json";
import rohs from "./rohs-enquiry.json";

const REGISTRY: Record<string, AssessmentTemplateSchema> = {
    supplier_self_assessment_pma_code_of_conduct:
        pma as unknown as AssessmentTemplateSchema,
    code_of_conduct: coc as unknown as AssessmentTemplateSchema,
    esg_document_request: esgDocs as unknown as AssessmentTemplateSchema,
    esg_supplier_self_assessment_labor_rights:
        esgLabor as unknown as AssessmentTemplateSchema,
    esg_supplier_self_assessment_human_rights:
        esgHuman as unknown as AssessmentTemplateSchema,
    esg_supplier_self_assessment_environmental_rights:
        esgEnv as unknown as AssessmentTemplateSchema,
    esg_self_assessment_egb: esgEgb as unknown as AssessmentTemplateSchema,
    reach_enquiry: reach as unknown as AssessmentTemplateSchema,
    rohs_enquiry: rohs as unknown as AssessmentTemplateSchema,
};

export const BUNDLED_TEMPLATE_CATEGORIES = Object.keys(REGISTRY);

/**
 * Return the JSON schema bundled in the codebase for a given template category,
 * or `null` if no bundle is registered. Every one of the 9 enum categories is
 * registered, so callers always get a real schema rather than the historical
 * silent fallback to the PMA schema for non-PMA templates.
 */
export function getBundledTemplateSchema(
    category: string | null
): AssessmentTemplateSchema | null {
    if (!category) return null;
    return REGISTRY[category] ?? null;
}

export function resolveAssessmentTemplateSchema(
    category: string | null,
    storedConfig?: string | null
): AssessmentTemplateSchema | null {
    const bundled = getBundledTemplateSchema(category);
    if (bundled) return bundled;

    if (!storedConfig) return null;

    try {
        const parsed = JSON.parse(storedConfig);
        if (parsed && Array.isArray(parsed.sections)) {
            return parsed as AssessmentTemplateSchema;
        }
    } catch {
        // Ignore malformed config and return null.
    }

    return null;
}