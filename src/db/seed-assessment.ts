import { db } from "./index";
import {
    assessmentTemplates,
    documentTemplates,
    assessmentTemplateCategoryEnum,
    documentTemplateCategoryEnum,
} from "./schema";
import { getBundledTemplateSchema } from "@/lib/assessment-templates";
import { eq } from "drizzle-orm";

const DOCUMENT_TEMPLATES = [
    { name: "amfori BSCI", category: "compliance", description: "Business Social Compliance Initiative audit" },
    { name: "EMAS", category: "certification", description: "Eco-Management and Audit Scheme" },
    { name: "ISO 9001", category: "certification", description: "Quality Management System" },
    { name: "ISO 14001", category: "certification", description: "Environmental Management System" },
    { name: "ISO 45001", category: "certification", description: "Occupational Health & Safety" },
    { name: "REACH Declaration", category: "compliance", description: "Registration, Evaluation, Authorisation of Chemicals" },
    { name: "RoHS Declaration", category: "compliance", description: "Restriction of Hazardous Substances" },
    { name: "SA 8000", category: "certification", description: "Social Accountability Standard" },
    { name: "SEDEX / SMETA", category: "compliance", description: "Supplier Ethical Data Exchange audit" },
    { name: "TISAX", category: "certification", description: "Trusted Information Security Assessment Exchange" },
    { name: "Verhaltenskodex", category: "policy", description: "Supplier Code of Conduct acknowledgement" },
    { name: "Vertraulichkeitsvereinbarung", category: "agreement", description: "Non-Disclosure Agreement" },
    { name: "Product Material Declaration (PMA)", category: "compliance", description: "Material declaration per part" },
    { name: "Conflict Minerals Report", category: "compliance", description: "3TG conflict minerals filing" },
    { name: "Carbon Footprint Statement", category: "policy", description: "Scope 1/2/3 emissions disclosure" },
];

const ASSESSMENT_TEMPLATES = [
    { name: "Code of Conduct", category: "code_of_conduct" },
    { name: "ESG Dokumentenanfrage", category: "esg_document_request" },
    { name: "ESG Lieferantenselbstauskunft - Arbeitsrechte", category: "esg_supplier_self_assessment_labor_rights" },
    { name: "ESG Lieferantenselbstauskunft - Menschenrechte", category: "esg_supplier_self_assessment_human_rights" },
    { name: "ESG Lieferantenselbstauskunft - Umweltrechte", category: "esg_supplier_self_assessment_environmental_rights" },
    { name: "ESG Selbstauskunft - EGB", category: "esg_self_assessment_egb" },
    { name: "REACH Anfrage", category: "reach_enquiry" },
    { name: "RoHS Anfrage", category: "rohs_enquiry" },
    { name: "Supplier Self Assessment PMA & Code of Conduct", category: "supplier_self_assessment_pma_code_of_conduct" },
];

async function run() {
    try {
        const existingDocs = await db.select({ name: documentTemplates.name }).from(documentTemplates);
        const existingDocNames = new Set(existingDocs.map((d) => d.name));
        const newDocs = DOCUMENT_TEMPLATES.filter((d) => !existingDocNames.has(d.name));

        if (newDocs.length) {
            await db.insert(documentTemplates).values(
                newDocs.map((d) => ({
                    name: d.name,
                    description: d.description,
                    category: d.category as unknown as typeof documentTemplateCategoryEnum, // enum cast
                }))
            );
            console.log(`Inserted ${newDocs.length} document templates`);
        } else {
            console.log("Document templates already present");
        }

        const existingTemplates = await db.select({ name: assessmentTemplates.name }).from(assessmentTemplates);
        const existingTemplateNames = new Set(existingTemplates.map((t) => t.name));
        const newTemplates = ASSESSMENT_TEMPLATES.filter((t) => !existingTemplateNames.has(t.name));

        if (newTemplates.length) {
            await db.insert(assessmentTemplates).values(
                newTemplates.map((t) => ({
                    name: t.name,
                    category: t.category as unknown as typeof assessmentTemplateCategoryEnum,
                    isActive: true,
                    config: JSON.stringify(getBundledTemplateSchema(t.category)) || null,
                }))
            );
            console.log(`Inserted ${newTemplates.length} assessment templates`);
        } else {
            console.log("Assessment templates already present");
        }

        // Backfill `config` for any existing rows that pre-date the bundled
        // schemas. Existing assessment_templates rows were inserted with an
        // empty `config`, which made the schema-driven renderer and autofill
        // silently fall back to the PMA JSON for every category.
        const allRows = await db
            .select({ id: assessmentTemplates.id, category: assessmentTemplates.category, config: assessmentTemplates.config })
            .from(assessmentTemplates);
        let backfilled = 0;
        for (const row of allRows) {
            if (row.config && row.config.length > 0) continue;
            const schema = getBundledTemplateSchema(row.category);
            if (!schema) continue;
            await db
                .update(assessmentTemplates)
                .set({ config: JSON.stringify(schema), updatedAt: new Date() })
                .where(eq(assessmentTemplates.id, row.id));
            backfilled += 1;
        }
        if (backfilled > 0) {
            console.log(`Backfilled config JSON for ${backfilled} assessment template(s)`);
        }
    } catch (error) {
        console.error("Assessment seed failed:", error);
        process.exitCode = 1;
    } finally {
        process.exit();
    }
}

run();
