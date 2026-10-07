const fs = require('fs');

const packsEn = `  compliancePolicyPacks: {
    IN_GST_CORE: {
      label: "India GST Core",
      region: "India",
      summary: "GST evidence, supplier tax details, and invoice controls for India-led flows."
    },
    EU_GDPR_SUPPLY: {
      label: "EU GDPR Supply Chain",
      region: "European Union",
      summary: "Data privacy, processor controls, and supplier evidence for EU operations."
    },
    UK_GDPR_SUPPLY: {
      label: "UK GDPR",
      region: "United Kingdom",
      summary: "UK data-processing and supplier record controls aligned to UK GDPR."
    },
    US_CCPA_VENDOR: {
      label: "US CCPA Vendor",
      region: "United States",
      summary: "Consumer data, vendor handling, and evidence obligations for US workflows."
    },
    SG_PDPA_VENDOR: {
      label: "Singapore PDPA",
      region: "Singapore",
      summary: "PDPA-aligned controls for supplier data, retention, and disclosure handling."
    },
    AE_VAT_TRADE: {
      label: "UAE VAT & Trade",
      region: "United Arab Emirates",
      summary: "Trade paperwork, VAT evidence, and regional customs-readiness controls."
    },
    GLOBAL_TPRM_BASELINE: {
      label: "Global TPRM Baseline",
      region: "Global",
      summary: "Shared third-party risk baseline for multi-region suppliers and contracts."
    }
  },`;

const packsDe = `  compliancePolicyPacks: {
    IN_GST_CORE: {
      label: "Indien GST Core",
      region: "Indien",
      summary: "GST-Nachweise, Lieferantensteuerdetails und Rechnungskontrollen für indisch geführte Abläufe."
    },
    EU_GDPR_SUPPLY: {
      label: "EU DSGVO Lieferkette",
      region: "Europäische Union",
      summary: "Datenschutz, Auftragsverarbeiterkontrollen und Lieferantennachweise für den EU-Betrieb."
    },
    UK_GDPR_SUPPLY: {
      label: "UK DSGVO",
      region: "Vereinigtes Königreich",
      summary: "UK-Datenverarbeitung und Lieferantenaufzeichnungs-Kontrollen ausgerichtet auf UK DSGVO."
    },
    US_CCPA_VENDOR: {
      label: "US CCPA Anbieter",
      region: "Vereinigte Staaten",
      summary: "Verbraucherdaten, Anbieterhandhabung und Nachweispflichten für US-Workflows."
    },
    SG_PDPA_VENDOR: {
      label: "Singapur PDPA",
      region: "Singapur",
      summary: "PDPA-ausgerichtete Kontrollen für Lieferantendaten, Aufbewahrung und Offenlegung."
    },
    AE_VAT_TRADE: {
      label: "VAE MwSt & Handel",
      region: "Vereinigte Arabische Emirate",
      summary: "Handelspapiere, MwSt-Nachweise und Kontrollen der regionalen Zollbereitschaft."
    },
    GLOBAL_TPRM_BASELINE: {
      label: "Globale TPRM-Basis",
      region: "Global",
      summary: "Gemeinsame Basis für das Risiko durch Dritte (TPRM) für überregionale Lieferanten und Verträge."
    }
  },`;

function addPacks(filePath, block) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('  compliancePolicyPacks: {')) {
        console.log('Already exists in ' + filePath);
        return;
    }
    // Find adminCompliancePage and insert before it
    const targetIdx = content.indexOf('  adminCompliancePage: {');
    if (targetIdx === -1) {
        console.log('adminCompliancePage not found in ' + filePath);
        return;
    }
    content = content.substring(0, targetIdx) + block + '\n' + content.substring(targetIdx);
    fs.writeFileSync(filePath, content);
    console.log('Added policy packs to ' + filePath);
}

addPacks('src/lib/i18n/en.ts', packsEn);
addPacks('src/lib/i18n/de.ts', packsDe);
