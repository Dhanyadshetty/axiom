import { db } from "@/db";
import { suppliers } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Seed the test supplier "test Lieferant PMA" (supplier number 79793903)
 * together with its full master-data profile so the new
 * /suppliers/79793903/properties view renders every attribute.
 *
 * Run with: npx tsx scripts/seed-test-supplier.ts
 */

const RAW = {
    supplier_profile: {
        general_information: {
            company_name: "test Lieferant PMA",
            address: "Allmandstraße 9, 72290 Lossburg-Betzweiler, Germany",
            public_website: "www.prettl.com",
            location_headquarter: "Neuruppin",
            local_trade_register: "HRB1111",
            duns_number: "456",
            eori_number: "123",
            vat_id: "123",
        },
        bank_account: {
            bank_name: "Dagobert Dug Investments Inc.",
            iban: "GB33BUKB20201555555555",
            bic_swift: "123",
            account_currency: "USD",
        },
        insurance: {
            insurer: "ALLIANZ AG",
            insurance_no: "123",
            amount_insured: 200,
        },
        production_site: {
            company_name: "PAS Cable GmbH",
            contact_name: "Meister Lampe",
            contact_phone: "123",
            contact_email: "torsten.vorwerk@pas-net.com",
            country: "Deutschland",
            area_m2: 3,
            postal_code_and_city: "16816 Neuruppin",
            sites_list: [
                {
                    description: "abcd",
                    divisions: ["PRODUCTION"],
                    working_shifts: 2,
                },
            ],
        },
    },
    user_defined_and_operational_attributes: {
        supplier_status: "Potential Supplier",
        area_of_need: "Direct",
        supplier_type: "Manufacturer",
        ssa_completed: true,
        core_competences: "Stamping",
        main_equipment_machinery: ["CNC machine", "Moulding machine"],
        consignation_stock_possible: true,
        notes: null,
        goals: null,
    },
    financial_figures_and_market: {
        annual_revenue: [
            { year: 2026, revenue: 56000000 },
            { year: 2025, revenue: 60000000 },
            { year: 2024, revenue: 40000000 },
        ],
        annual_purchase_volume_main_suppliers: [
            { supplier: "TE", share_pct: 30 },
            { supplier: "Leoni", share_pct: 25 },
            { supplier: "Tele-Fonika", share_pct: 18 },
            { supplier: "Lumberg", share_pct: 14 },
            { supplier: "Schwager", share_pct: 12 },
        ],
        turnover_share_pct: {
            other: 80,
            industry: 20,
            aerospace: 0,
            automotive: 0,
            medicine: -2,
        },
        invoicing_and_orders: {
            abc_classification_invoice_volume: null,
            invoice_volume_2023: null,
            invoice_volume_2024: null,
            invoice_volume_2025: null,
            order_volume_2023: null,
        },
        customer_portfolio: {
            number_of_customers: 100,
            customers_for_80_pct_sales: 4,
            main_customers_share: [
                { customer: "Fa XL", share_pct: 50 },
                { customer: "Fa L", share_pct: 15 },
                { customer: "Fa M", share_pct: 10 },
                { customer: "Fa S", share_pct: 5 },
            ],
            customer_audits: [
                { customer: "Kd C", audit_type: "Herbstaudit", date: "01.10.2025", result: "tiptop" },
                { customer: "Kd B", audit_type: "Sommeraudit", date: "10.07.2025", result: "geht so" },
                { customer: "Kd A", audit_type: "Frühjahrsaudit", date: "12.03.2025", result: "guter Kaffee" },
            ],
        },
    },
    workforce_structure: {
        employees_total_current: 120,
        employees_total_prev_year: 100,
        employees_direct: 80,
        employees_indirect: 39,
        employees_management: 1,
        employees_engineers: 0,
    },
    certifications_and_compliance: {
        iso_9001: { expiry: "13.08.2026", requested_status: "Accepted" },
        iso_14001: { expiry: "28.08.2026", requested_status: "Accepted" },
        iso_13485: { expiry: "28.08.2026", requested_status: "Accepted" },
        iso_50001: { expiry: "28.08.2026", requested_status: "Accepted" },
        iso_45001: { expiry: "28.08.2026", requested_status: "Accepted" },
        iatf_16949: { expiry: "31.12.2028", system_status: "Non-existent", requested_status: "Accepted" },
        iatf_16949_acquired_requested: null,
        code_of_conduct: { status: "Valid", requested_status: "Accepted" },
    },
    sap_erp_integration: {
        purchasing_organization_sap: null,
        company_code_sap: null,
        purchasing_group_sap: null,
        material_group_sap: null,
        payment_terms_sap: null,
        delivery_conditions_sap: null,
    },
    lksg_due_diligence_framework: {
        esg_risk_analysis_own_business_areas: "Not evaluated",
        esg_risk_status_last_year: null,
        analysis_progress_last_year: null,
        waste_and_chemical_risk_details: {
            violations_chemical_requirements: null,
            violations_waste_handling: null,
            main_causes_waste_violations: null,
            processes_against_waste_risks: null,
            process_descriptions_safety: null,
            effectiveness_description_waste: null,
            effectiveness_description_process: null,
            effectiveness_description_general: null,
        },
    },
};

const profile = {
    general_information: RAW.supplier_profile.general_information,
    bank_account: RAW.supplier_profile.bank_account,
    insurance: RAW.supplier_profile.insurance,
    production_site: RAW.supplier_profile.production_site,
    user_defined_and_operational_attributes: RAW.user_defined_and_operational_attributes,
    financial_figures_and_market: RAW.financial_figures_and_market,
    workforce_structure: RAW.workforce_structure,
    certifications_and_compliance: RAW.certifications_and_compliance,
    sap_erp_integration: RAW.sap_erp_integration,
    lksg_due_diligence_framework: RAW.lksg_due_diligence_framework,
};

const SUPPLIER_NUMBER = "79793903";

async function main() {
    const existing = await db
        .select({ id: suppliers.id })
        .from(suppliers)
        .where(eq(suppliers.supplierNumber, SUPPLIER_NUMBER))
        .limit(1);

    const values = {
        name: "test Lieferant PMA",
        contactEmail: "info@prettl.com",
        countryCode: "DE",
        city: "Lossburg-Betzweiler",
        status: "active" as const,
        lifecycleStatus: "active" as const,
        riskScore: 25,
        esgScore: 70,
        performanceScore: 80,
        financialScore: 70,
        supplierType: "Manufacturer",
        areaOfNeed: ["Direct"],
        commodityGroup: ["Stamping"],
        responsibleBuyer: [],
        strategicClassification: "Preferred Supplier P",
        abcClassification: "A" as const,
        supplierNumber: SUPPLIER_NUMBER,
        profile,
    };

    if (existing.length > 0) {
        await db.update(suppliers).set(values).where(eq(suppliers.id, existing[0].id));
        console.log(`✅ Updated supplier ${SUPPLIER_NUMBER}`);
    } else {
        await db.insert(suppliers).values(values);
        console.log(`✅ Inserted supplier ${SUPPLIER_NUMBER}`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
