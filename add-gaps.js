const fs = require('fs');

const gapsEn = `    gaps: {
      regionalDataIncomplete: "Regional data is incomplete, which weakens geographic reporting.",
      noDocuments: "No supporting documents are attached to validate supplier claims.",
      complianceEvidenceThin: "Compliance evidence coverage is too thin for high-confidence scoring.",
      auditRecordsStale: "Audit records are stale or missing.",
      riskAuditStale: "Risk audit data is stale or missing.",
      noActiveWebhooks: "No active outbound integration endpoint is configured.",
      noSourceSystems: "No tracked source system is feeding import history.",
      noExchangeRates: "Exchange-rate coverage is missing from platform settings.",
      lowWebhookSuccess: "Webhook delivery success rate is below the enterprise target.",
      staleWebhooks: "{count} webhook endpoint(s) are stale.",
      webhookBacklog: "Webhook backlog is starting to accumulate.",
      noApprovalPolicies: "Approval policies are missing for core purchasing and governance workflows.",
      noMatchingTolerances: "Three-way matching tolerances are not configured for invoice reconciliation.",
      noSupplierTolerances: "No supplier-specific tolerance overrides are currently active.",
      highEscalation: "Task escalation levels point to a lack of governance oversight.",
      overdueTasks: "Overdue compliance or review tasks need immediate attention.",
      noRecentImports: "No recent import jobs are available to prove ingestion reliability.",
      noRecentWebhooks: "No recent webhook deliveries are available to prove integration reliability.",
      lowWebhookReliability: "Webhook delivery failure rate suggests underlying connectivity issues."
    },`;

const gapsDe = `    gaps: {
      regionalDataIncomplete: "Regionale Daten sind unvollständig, was die geografische Berichterstattung schwächt.",
      noDocuments: "Es sind keine unterstützenden Dokumente angehängt, um Lieferantenangaben zu validieren.",
      complianceEvidenceThin: "Die Abdeckung der Compliance-Nachweise ist für eine zuverlässige Bewertung zu gering.",
      auditRecordsStale: "Auditaufzeichnungen sind veraltet oder fehlen.",
      riskAuditStale: "Risikoauditdaten sind veraltet oder fehlen.",
      noActiveWebhooks: "Es ist kein aktiver ausgehender Integrations-Endpunkt konfiguriert.",
      noSourceSystems: "Kein erfasstes Quellsystem liefert eine Import-Historie.",
      noExchangeRates: "Wechselkurs-Abdeckung fehlt in den Plattform-Einstellungen.",
      lowWebhookSuccess: "Die Erfolgsquote der Webhook-Zustellung liegt unter dem Unternehmensziel.",
      staleWebhooks: "{count} Webhook-Endpunkt(e) sind veraltet.",
      webhookBacklog: "Ein Webhook-Rückstand beginnt sich aufzubauen.",
      noApprovalPolicies: "Genehmigungsrichtlinien fehlen für wichtige Beschaffungs- und Governance-Workflows.",
      noMatchingTolerances: "Für den Rechnungsabgleich sind keine 3-Wege-Matching-Toleranzen konfiguriert.",
      noSupplierTolerances: "Derzeit sind keine lieferantenspezifischen Toleranzüberschreibungen aktiv.",
      highEscalation: "Das Eskalationsniveau von Aufgaben weist auf mangelnde Governance-Kontrolle hin.",
      overdueTasks: "Überfällige Compliance- oder Überprüfungsaufgaben erfordern sofortige Aufmerksamkeit.",
      noRecentImports: "Es sind keine aktuellen Import-Jobs verfügbar, um die Zuverlässigkeit der Datenaufnahme nachzuweisen.",
      noRecentWebhooks: "Es sind keine aktuellen Webhook-Zustellungen verfügbar, um die Zuverlässigkeit der Integration nachzuweisen.",
      lowWebhookReliability: "Die Ausfallrate der Webhook-Zustellung deutet auf zugrunde liegende Verbindungsprobleme hin."
    },`;

function addGaps(filePath, gapsBlock) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('    gaps: {')) {
        console.log('Gaps already exists in ' + filePath);
        return;
    }
    const targetIdx = content.indexOf('    attentionSuppliers: {');
    if (targetIdx === -1) {
        console.log('attentionSuppliers not found in ' + filePath);
        return;
    }
    content = content.substring(0, targetIdx) + gapsBlock + '\n' + content.substring(targetIdx);
    fs.writeFileSync(filePath, content);
    console.log('Added gaps to ' + filePath);
}

addGaps('src/lib/i18n/en.ts', gapsEn);
addGaps('src/lib/i18n/de.ts', gapsDe);

let deContent = fs.readFileSync('src/lib/i18n/de.ts', 'utf8');
deContent = deContent.replace(
    'subtitle: "Enterprise Procurement Analytics mit erfassten Werten und mehrdimensionaler Filterung",',
    'subtitle: "Enterprise-Beschaffungsanalysen mit intuitiver ROI-Betrachtung und verifizierter, makelloser Filterung",'
);
fs.writeFileSync('src/lib/i18n/de.ts', deContent);
console.log('Updated subtitle in de.ts');
