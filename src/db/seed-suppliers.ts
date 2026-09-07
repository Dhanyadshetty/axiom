import { db } from "@/db";
import { suppliers } from "@/db/schema";

/**
 * Seed ~30 demo suppliers with classification fields so the new
 * Suppliers module (views, classification columns, import template)
 * has realistic data to display.
 *
 * Run with: npm run db:seed:suppliers
 */

const SAMPLE: Array<{
    name: string;
    country: string;
    status: "active" | "inactive" | "blacklisted";
    supplierType: string;
    areaOfNeed: string[];
    commodityGroup: string[];
    responsibleBuyer: string[];
    strategicClassification: string;
    lifecycle: "prospect" | "onboarding" | "active" | "suspended" | "terminated";
    riskScore: number;
    abc: "A" | "B" | "C" | "None";
}> = [
    { name: "Acme Components GmbH", country: "DE", status: "active", supplierType: "Manufacturer", areaOfNeed: ["Production", "Logistics"], commodityGroup: ["Electronics", "Fasteners"], responsibleBuyer: ["J. Smith"], strategicClassification: "Strategic", lifecycle: "active", riskScore: 22, abc: "A" },
    { name: "Nordic Plastics AS", country: "NO", status: "active", supplierType: "Distributor", areaOfNeed: ["Packaging"], commodityGroup: ["Plastics"], responsibleBuyer: ["A. Khan"], strategicClassification: "Preferred", lifecycle: "active", riskScore: 31, abc: "B" },
    { name: "Iberia Forge SL", country: "ES", status: "active", supplierType: "Manufacturer", areaOfNeed: ["Machining"], commodityGroup: ["Machining", "Fasteners"], responsibleBuyer: ["M. Lopez"], strategicClassification: "Strategic", lifecycle: "active", riskScore: 41, abc: "A" },
    { name: "Asia Pacific Circuits", country: "CN", status: "active", supplierType: "Manufacturer", areaOfNeed: ["Electronics"], commodityGroup: ["Electronics"], responsibleBuyer: ["L. Chen"], strategicClassification: "Preferred", lifecycle: "active", riskScore: 58, abc: "B" },
    { name: "Bharat Precision Ltd", country: "IN", status: "active", supplierType: "Manufacturer", areaOfNeed: ["Machining", "Production"], commodityGroup: ["Machining"], responsibleBuyer: ["R. Patel"], strategicClassification: "Strategic", lifecycle: "active", riskScore: 47, abc: "A" },
    { name: "Helvetia Logistics AG", country: "CH", status: "active", supplierType: "Service Provider", areaOfNeed: ["Logistics"], commodityGroup: ["Logistics"], responsibleBuyer: ["K. Müller"], strategicClassification: "Transactional", lifecycle: "active", riskScore: 18, abc: "C" },
    { name: "Sahara Polymers", country: "AE", status: "active", supplierType: "Distributor", areaOfNeed: ["Packaging"], commodityGroup: ["Plastics"], responsibleBuyer: ["A. Khan"], strategicClassification: "Approved", lifecycle: "active", riskScore: 52, abc: "B" },
    { name: "Tokyo Sensor Kogyo", country: "JP", status: "active", supplierType: "Manufacturer", areaOfNeed: ["Electronics"], commodityGroup: ["Electronics", "Sensors"], responsibleBuyer: ["L. Chen"], strategicClassification: "Strategic", lifecycle: "active", riskScore: 27, abc: "A" },
    { name: "Maple Tech Components", country: "CA", status: "active", supplierType: "Manufacturer", areaOfNeed: ["Electronics"], commodityGroup: ["Electronics"], responsibleBuyer: ["S. Tremblay"], strategicClassification: "Preferred", lifecycle: "active", riskScore: 33, abc: "B" },
    { name: "Outback Mining Supply", country: "AU", status: "active", supplierType: "Manufacturer", areaOfNeed: ["Raw Materials"], commodityGroup: ["Metals"], responsibleBuyer: ["B. Carter"], strategicClassification: "Transactional", lifecycle: "active", riskScore: 61, abc: "C" },
    { name: "Sao Paulo Castings", country: "BR", status: "inactive", supplierType: "Manufacturer", areaOfNeed: ["Machining"], commodityGroup: ["Machining", "Metals"], responsibleBuyer: ["C. Silva"], strategicClassification: "Approved", lifecycle: "suspended", riskScore: 72, abc: "C" },
    { name: "Gulf Metal Works", country: "SA", status: "active", supplierType: "Manufacturer", areaOfNeed: ["Machining"], commodityGroup: ["Metals"], responsibleBuyer: ["F. Al-Saud"], strategicClassification: "Preferred", lifecycle: "active", riskScore: 44, abc: "B" },
    { name: "Rand Resources Pty", country: "ZA", status: "active", supplierType: "Distributor", areaOfNeed: ["Raw Materials"], commodityGroup: ["Metals"], responsibleBuyer: ["T. Mokoena"], strategicClassification: "Transactional", lifecycle: "active", riskScore: 66, abc: "C" },
    { name: "Seoul Semiconductor Co", country: "KR", status: "active", supplierType: "Manufacturer", areaOfNeed: ["Electronics"], commodityGroup: ["Electronics", "Sensors"], responsibleBuyer: ["L. Chen"], strategicClassification: "Strategic", lifecycle: "active", riskScore: 29, abc: "A" },
    { name: "Bavarian Motors Zulieferer", country: "DE", status: "active", supplierType: "Manufacturer", areaOfNeed: ["Production"], commodityGroup: ["Automotive"], responsibleBuyer: ["K. Müller"], strategicClassification: "Strategic", lifecycle: "active", riskScore: 35, abc: "A" },
    { name: "Lombardy Textiles", country: "IT", status: "active", supplierType: "Manufacturer", areaOfNeed: ["Packaging"], commodityGroup: ["Textiles"], responsibleBuyer: ["G. Rossi"], strategicClassification: "Preferred", lifecycle: "active", riskScore: 39, abc: "B" },
    { name: "Rhone Chemicals", country: "FR", status: "active", supplierType: "Manufacturer", areaOfNeed: ["Production"], commodityGroup: ["Chemicals"], responsibleBuyer: ["P. Dubois"], strategicClassification: "Strategic", lifecycle: "active", riskScore: 48, abc: "B" },
    { name: "Danube Fasteners", country: "HU", status: "active", supplierType: "Distributor", areaOfNeed: ["Machining"], commodityGroup: ["Fasteners"], responsibleBuyer: ["M. Nagy"], strategicClassification: "Approved", lifecycle: "active", riskScore: 42, abc: "C" },
    { name: "Nederland Packaging", country: "NL", status: "active", supplierType: "Manufacturer", areaOfNeed: ["Packaging"], commodityGroup: ["Packaging"], responsibleBuyer: ["J. de Vries"], strategicClassification: "Preferred", lifecycle: "active", riskScore: 25, abc: "B" },
    { name: "Caledonia Steel", country: "GB", status: "active", supplierType: "Manufacturer", areaOfNeed: ["Raw Materials", "Machining"], commodityGroup: ["Metals"], responsibleBuyer: ["E. MacDonald"], strategicClassification: "Strategic", lifecycle: "active", riskScore: 37, abc: "A" },
    { name: "Baltic Wood Products", country: "PL", status: "inactive", supplierType: "Manufacturer", areaOfNeed: ["Packaging"], commodityGroup: ["Wood"], responsibleBuyer: ["A. Nowak"], strategicClassification: "Approved", lifecycle: "onboarding", riskScore: 55, abc: "C" },
    { name: "Andes Copper Supply", country: "CL", status: "active", supplierType: "Distributor", areaOfNeed: ["Raw Materials"], commodityGroup: ["Metals"], responsibleBuyer: ["R. Fernandez"], strategicClassification: "Transactional", lifecycle: "active", riskScore: 63, abc: "C" },
    { name: "Mississippi Components", country: "US", status: "active", supplierType: "Manufacturer", areaOfNeed: ["Electronics", "Production"], commodityGroup: ["Electronics"], responsibleBuyer: ["D. Johnson"], strategicClassification: "Strategic", lifecycle: "active", riskScore: 28, abc: "A" },
    { name: "Orient Freight Lines", country: "SG", status: "active", supplierType: "Service Provider", areaOfNeed: ["Logistics"], commodityGroup: ["Logistics"], responsibleBuyer: ["W. Tan"], strategicClassification: "Transactional", lifecycle: "active", riskScore: 21, abc: "C" },
    { name: "Anatolia Ceramics", country: "TR", status: "active", supplierType: "Manufacturer", areaOfNeed: ["Production"], commodityGroup: ["Ceramics"], responsibleBuyer: ["M. Yilmaz"], strategicClassification: "Preferred", lifecycle: "active", riskScore: 50, abc: "B" },
    { name: "Caspian Energy Parts", country: "KZ", status: "blacklisted", supplierType: "Distributor", areaOfNeed: ["Raw Materials"], commodityGroup: ["Metals"], responsibleBuyer: ["D. Assetov"], strategicClassification: "Approved", lifecycle: "terminated", riskScore: 88, abc: "C" },
    { name: "Vistula Tooling", country: "PL", status: "active", supplierType: "Manufacturer", areaOfNeed: ["Machining"], commodityGroup: ["Machining", "Tools"], responsibleBuyer: ["A. Nowak"], strategicClassification: "Preferred", lifecycle: "onboarding", riskScore: 46, abc: "B" },
    { name: "Alpine Coatings", country: "AT", status: "active", supplierType: "Manufacturer", areaOfNeed: ["Production"], commodityGroup: ["Chemicals"], responsibleBuyer: ["F. Berger"], strategicClassification: "Strategic", lifecycle: "active", riskScore: 34, abc: "A" },
    { name: "Cape Agri Supply", country: "ZA", status: "active", supplierType: "Distributor", areaOfNeed: ["Raw Materials"], commodityGroup: ["Agriculture"], responsibleBuyer: ["T. Mokoena"], strategicClassification: "Transactional", lifecycle: "prospect", riskScore: 59, abc: "C" },
    { name: "Nile Textiles", country: "EG", status: "inactive", supplierType: "Manufacturer", areaOfNeed: ["Packaging"], commodityGroup: ["Textiles"], responsibleBuyer: ["O. Hassan"], strategicClassification: "Approved", lifecycle: "suspended", riskScore: 70, abc: "C" },
    { name: "Pacific Rim Logistics", country: "MY", status: "active", supplierType: "Service Provider", areaOfNeed: ["Logistics"], commodityGroup: ["Logistics"], responsibleBuyer: ["W. Tan"], strategicClassification: "Transactional", lifecycle: "active", riskScore: 30, abc: "C" },
];

async function main() {
    console.log(`Seeding ${SAMPLE.length} suppliers…`);
    for (const item of SAMPLE) {
        await db.insert(suppliers).values({
            name: item.name,
            contactEmail: `contact@${item.name.toLowerCase().replace(/[^a-z0-9]+/g, "")}.example.com`,
            countryCode: item.country,
            status: item.status,
            lifecycleStatus: item.lifecycle,
            abcClassification: item.abc,
            supplierType: item.supplierType,
            areaOfNeed: item.areaOfNeed,
            commodityGroup: item.commodityGroup,
            responsibleBuyer: item.responsibleBuyer,
            strategicClassification: item.strategicClassification,
            riskScore: item.riskScore,
            performanceScore: 80,
            financialScore: 70,
            esgScore: 70,
            tierLevel: "tier_3",
            conflictMineralsStatus: "unknown",
            modernSlaveryStatement: "no",
        }).onConflictDoNothing();
    }
    console.log("Done.");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
