const fs = require('fs');
const enPath = 'src/lib/i18n/en.ts';
const dePath = 'src/lib/i18n/de.ts';

let en = fs.readFileSync(enPath, 'utf8');
let de = fs.readFileSync(dePath, 'utf8');

const enAgents = `
  agents: {
    fleet: {
      title: "AI Agent Fleet",
      subtitle: "Autonomous Procurement Intelligence",
      activeAgents: "{count} Active Agents",
      validationShield: "Validation Shield",
      validationShieldDesc: "Inputs are schema-validated and rejected safely before agents run.",
      approvalGate: "Approval Gate",
      approvalGateDesc: "Sensitive agents enforce admin-only execution with telemetry-backed blocks.",
      resilienceControls: "Resilience Controls",
      resilienceControlsDesc: "Retries, timeouts, and guarded chaining keep executions stable under stress.",
      demoMode: "Demo Mode Preview",
      demoModeDesc: "Live telemetry is disabled in demo mode. Sign in as an admin to stream execution traces.",
      agentCatalog: "Agent Catalog"
    },
    commandCenter: {
      fleetControl: "AI Fleet Control",
      directLaunchAgents: "{count} direct-launch agents",
      emergencyStopActive: "Emergency stop active",
      routesHealthy: "Routes healthy",
      criticalFraudAlerts: "{count} critical fraud alerts open",
      itemsNeedAttention: "{count} items need attention",
      title: "Axiom AI fleet",
      description: "Agent launches run through the shared dispatcher with retries, timeout fencing, workspace handoffs, and route-linked follow-up.",
      stableAgents: "Stable Agents",
      stableAgentsDesc: "Recovered and ready for another run.",
      riskBacklog: "Risk Backlog",
      riskBacklogDesc: "Open critical risk, inventory, and payment follow-up signals.",
      lastSnapshot: "Last Snapshot",
      waiting: "Waiting",
      lastSnapshotDesc: "Live operational status captured from guarded server actions.",
      fleetStopEngaged: "Fleet emergency stop engaged",
      fleetStopReasonFallback: "New AI launches are blocked until an administrator resumes the fleet.",
      fleetStopTriggeredBy: "Triggered {time} by {user}.",
      anAdministrator: "an administrator",
      fleetStopTriggerSyncing: "Trigger details are still syncing.",
      runBundle: "Run Bundle",
      openRoute: "Open Route",
      postImportStabilizer: "Post-Import Stabilizer",
      postImportStabilizerDesc: "Refresh demand, scan incoming spend, and surface pay term opportunities after new data lands.",
      complianceSweep: "Compliance Sweep",
      complianceSweepDesc: "Run a controlled pass across risk, contracts, and invoice controls before approving the next move."
    }
  },
`;

const deAgents = `
  agents: {
    fleet: {
      title: "KI-Agentenflotte",
      subtitle: "Autonome Beschaffungsintelligenz",
      activeAgents: "{count} Aktive Agenten",
      validationShield: "Validierungsschild",
      validationShieldDesc: "Eingaben werden schema-validiert und sicher abgelehnt, bevor Agenten ausgeführt werden.",
      approvalGate: "Genehmigungstor",
      approvalGateDesc: "Sensible Agenten erzwingen eine nur für Administratoren zugängliche Ausführung mit telemetriegestützten Blöcken.",
      resilienceControls: "Resilienz-Kontrollen",
      resilienceControlsDesc: "Wiederholungen, Timeouts und gesichertes Chaining halten Ausführungen unter Stress stabil.",
      demoMode: "Demo-Modus Vorschau",
      demoModeDesc: "Live-Telemetrie ist im Demo-Modus deaktiviert. Melden Sie sich als Administrator an, um Ausführungsspuren zu streamen.",
      agentCatalog: "Agenten-Katalog"
    },
    commandCenter: {
      fleetControl: "KI-Flottensteuerung",
      directLaunchAgents: "{count} direkt startende Agenten",
      emergencyStopActive: "Notstopp aktiv",
      routesHealthy: "Routen fehlerfrei",
      criticalFraudAlerts: "{count} kritische Betrugswarnungen offen",
      itemsNeedAttention: "{count} Elemente erfordern Aufmerksamkeit",
      title: "Axiom KI-Flotte",
      description: "Agentenstarts laufen über den gemeinsamen Dispatcher mit Wiederholungen, Timeout-Abgrenzung, Workspace-Übergaben und routenbezogenem Follow-up.",
      stableAgents: "Stabile Agenten",
      stableAgentsDesc: "Wiederhergestellt und bereit für einen weiteren Durchlauf.",
      riskBacklog: "Risiko-Rückstand",
      riskBacklogDesc: "Offene Signale für kritisches Risiko, Inventar- und Zahlungsverfolgung.",
      lastSnapshot: "Letzter Schnappschuss",
      waiting: "Warten",
      lastSnapshotDesc: "Live-Betriebsstatus aus gesicherten Serveraktionen erfasst.",
      fleetStopEngaged: "Flotten-Notstopp ausgelöst",
      fleetStopReasonFallback: "Neue KI-Starts sind blockiert, bis ein Administrator die Flotte fortsetzt.",
      fleetStopTriggeredBy: "Ausgelöst {time} von {user}.",
      anAdministrator: "einem Administrator",
      fleetStopTriggerSyncing: "Auslöserdetails werden noch synchronisiert.",
      runBundle: "Paket ausführen",
      openRoute: "Route öffnen",
      postImportStabilizer: "Post-Import Stabilisator",
      postImportStabilizerDesc: "Bedarf aktualisieren, eingehende Ausgaben scannen und Zahlungsziel-Möglichkeiten aufzeigen, nachdem neue Daten eingetroffen sind.",
      complianceSweep: "Compliance-Überprüfung",
      complianceSweepDesc: "Führen Sie einen kontrollierten Durchlauf über Risiko-, Vertrags- und Rechnungskontrollen durch, bevor Sie den nächsten Schritt genehmigen."
    }
  },
`;

if (!en.includes('agents: {')) {
  en = en.replace(/operationalFreshness: {/, enAgents + '\\n  operationalFreshness: {');
  fs.writeFileSync(enPath, en);
  console.log('en.ts updated');
}

if (!de.includes('agents: {')) {
  de = de.replace(/operationalFreshness: {/, deAgents + '\\n  operationalFreshness: {');
  fs.writeFileSync(dePath, de);
  console.log('de.ts updated');
}
