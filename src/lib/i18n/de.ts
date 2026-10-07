/**
 * German translation dictionary
 * Mirrors the exact key structure of en.ts.
 */
import type { TranslationKeys } from "./en";

export const de: TranslationKeys = {
  // ── Seitenleiste ──
  sidebar: {
    procurementOS: "Beschaffungs-OS",
    workspace: "Arbeitsbereich",
    adminConsole: "Admin-Konsole",
    supplierPortal: "Lieferantenportal",
    internalWorkspace: "Interner Arbeitsbereich",
    adminConsoleDesc: "Plattformsteuerung, Genehmigungen, Intelligenz und Betriebsaufsicht",
    supplierPortalDesc: "Lieferantenansicht für Angebote, Bestellungen, Dokumente und Anfragen",
    internalWorkspaceDesc: "Operative Beschaffung, Anforderungen und Rechnungskoordination",
    suppliers: "Lieferanten",
    axiomCopilot: "Axiom Copilot",
    aiAgents: "KI-Agenten",
    analyticsStudio: "Analyse-Studio",

    // Abschnittstitel
    sourcing: "Beschaffung",
    finance: "Finanzen",
    resources: "Ressourcen",
    intelligence: "Intelligenz",
    operations: "Betrieb",
    vendorPortal: "Lieferantenportal",
    adminControl: "Admin-Steuerung",

    // Beschaffungslinks
    partsCatalog: "Teilekatalog",
    sourcingRequests: "Beschaffungsanfragen",
    requisitions: "Anforderungen",
    orders: "Bestellungen",
    goodsReceipts: "Wareneingänge",
    exceptionManagement: "Ausnahmemanagement",
    contracts: "Verträge",
    invoiceRecords: "Rechnungsunterlagen",
    agreements: "Vereinbarungen",

    // Finanzlinks
    invoices: "Rechnungen",
    inventory: "Bestand",
    transactions: "Transaktionen",
    contacts: "Kontakte",
    savings: "Einsparungen",
    sustainability: "Nachhaltigkeit",

    // Ressourcenlinks
    axiomPlaybook: "Axiom Handbuch",
    helpSupport: "Hilfe & Support",

    // Admin-Prioritätslinks
    fraudAlerts: "Betrugswarnungen",
    telemetry: "Telemetrie",
    financialMatching: "Finanzieller Abgleich",
    spendIntelligence: "Ausgabenanalyse",
    riskIntelligence: "Risikointelligenz",

    // Admin-Betriebslinks
    taskInbox: "Aufgabeneingang",
    compliance: "Compliance",
    userManagement: "Benutzerverwaltung",
    supportTickets: "Support-Tickets",
    auditTrail: "Prüfpfad",
    importData: "Daten importieren",
    adminSettings: "Admin-Einstellungen",
    scenarioModeling: "Szenariomodellierung",
    supplierEcosystem: "Lieferanten-Ökosystem",

    // Lieferantenportal-Links
    myPortal: "Mein Portal",
    incomingBids: "Eingehende Angebote",
    activeOrders: "Aktive Bestellungen",
    myDocuments: "Meine Dokumente",
    requestsTasks: "Anfragen & Aufgaben",
  },

  // ── Kopfzeile ──
  header: {
    adminConsole: "Admin-Konsole",
    supplierPortal: "Lieferantenportal",
    operationsWorkspace: "Operativer Arbeitsbereich",
    adminSubtitle: "Plattformintelligenz, Steuerung, Genehmigungen und Betriebsaufsicht",
    supplierSubtitle: "Lieferantenansicht für Ausschreibungen, Bestellungen, Dokumente und Anfragen",
    internalSubtitle: "Interner Beschaffungsarbeitsbereich",
    adminConsoleBadge: "Admin-Konsole Sitzung",
    internalUserBadge: "Interne Benutzersitzung",
  },

  // ── Dashboard ──
  dashboard: {
    adminCommandCenter: "Admin-Kommandozentrale",
    operationsWorkspace: "Operativer Arbeitsbereich",
    adminSubtitle: "Plattformintelligenz, Genehmigungen und operative Steuerung",
    internalSubtitle: "Operative Beschaffung und Anforderungsarbeitsbereich",

    // Statistikkarten
    purchaseRequests: "Bestellanforderungen",
    request: "Anfrage",
    internalWorkflow: "Interner Workflow",
    submitForApproval: "Zur Genehmigung einreichen",
    viewRequisitions: "Anforderungen anzeigen",
    verifiedNetwork: "Verifiziertes Netzwerk",
    activeGlobalSuppliers: "Aktive globale Lieferanten",
    viewSuppliers: "Lieferanten anzeigen",
    add: "Hinzufügen",
    activeFunnel: "Aktiver Trichter",
    fulfilled: "Erfüllt",
    active: "Aktiv",
    viewOrders: "Bestellungen anzeigen",
    track: "Verfolgen",
    warehouseLoad: "Lagerbestand",
    inventoryBtn: "Bestand",
    reorder: "Nachbestellen",

    // Schnellaktionen
    openHelpdesk: "Helpdesk öffnen",
    supportQueueEscalations: "Support-Warteschlange und Eskalationen",
    activeLabel: "aktiv",
    allSuppliers: "Alle Lieferanten",
    classificationOnboarding: "Klassifizierung, Onboarding und Compliance",
    tracked: "verfolgt",
    openFindings: "Offene Befunde",
    riskWatchlist: "Risikobeobachtungsliste und Interventionswege",
    critical: "kritisch",
    allTasks: "Alle Aufgaben",
    workflowInbox: "Workflow-Eingang und Genehmigungen",
    open: "offen",

    // Risikobereich
    criticalOpsWatch: "Kritische Betriebsüberwachung",
    supplierAlert: "Lieferantenwarnung",
    supplierAlerts: "Lieferantenwarnungen",
    impactNeedsAttention: "Auswirkung erfordert sofortige Aufmerksamkeit.",
    openRiskIntelligence: "Risikointelligenz öffnen",
    exceptionQueue: "Ausnahmewarteschlange",
    scenarioLab: "Szenario-Labor",
    aiFleet: "KI-Flotte",

    // Globale Betriebssteuerung
    globalOperatingControls: "Globale Betriebssteuerung",
    globalControlsDesc: "Mehrwährungsfinanzierung, regionale Compliance und geschützter Datentransfer sind Teil der Betriebsschicht, kein Nachgedanke.",
    multiCurrencySpend: "Mehrwährungs-Ausgaben",
    multiCurrencyDesc: "Die ursprüngliche Rechnungswährung bleibt erhalten, während benutzerlokale Devisenkurse und Berichtswährungen synchron bleiben.",
    openFinanceConsole: "Finanzkonsole öffnen",
    regionalCompliance: "Regionale Compliance",
    regionalComplianceDesc: "Richtlinienpakete, Regionskennzeichen, Nachweisabdeckung und Genehmigungskontrollen sind an Lieferanten- und Vertragsdatensätze gebunden.",
    supplierRecordsCompliance: "Lieferantendatensätze können Compliance-Umfang und Nachweise tragen.",
    openComplianceRoutes: "Compliance-Routen öffnen",
    deterministicMatching: "Deterministischer Abgleich",
    deterministicMatchingDesc: "Die Zahlungsfreigabe bleibt an Bestellung, Eingang, QC und Rechnungsmathematik gebunden, bevor eine nachgelagerte Genehmigung erfolgt.",
    financeHold: "Finanzhalt",
    financeHolds: "Finanzhalte",
    currentlyNeedReview: "müssen derzeit überprüft werden.",
    openMatchingQueue: "Abgleichswarteschlange öffnen",
    guardedImports: "Geschützte Importe",
    guardedImportsDesc: "Admin-exklusive Probeläufe, Schema-Validierung, referenzielle Prüfungen und Post-Import-Synchronisierung schützen den operativen Datensatz.",
    useDryRun: "Zuerst Probelauf verwenden, dann nur die Zeilen übernehmen, die die Validierung bestehen.",
    openControlledImport: "Kontrollierten Import öffnen",
    operationalTruth: "Operative Wahrheit",

    // KI-Flottenbereich
    sharedDispatcher: "Gemeinsamer Dispatcher und Wiederherstellungsrouten",
    aiExecutionDesc: "KI-Ausführung und Routenwiederherstellung befinden sich im Hauptarbeitsbereich.",
    launchAgentDesc: "Starten Sie Agentenläufe, koordinierte Wiederherstellungspakete und verknüpfte Folgerouten, ohne das Dashboard zu verlassen.",
    openAIFleet: "KI-Flotte öffnen",
    riskConsole: "Risikokonsole",

    // Untere Abschnitte
    operationalWorkspace: "Operativer Arbeitsbereich",
    operationalWorkspaceDesc: "Verwenden Sie Anforderungen für interne Einkäufe und das gemeinsame Support-Center für Hilfe.",
    openRequisitions: "Anforderungen öffnen",
    helpSupportBtn: "Hilfe & Support",
    enterpriseAnalyticsNote: "Enterprise-Ausgabenanalysen, Telemetrie und Lieferanten-Risikoüberwachung bleiben auf Admin-Sitzungen beschränkt.",
    recentProcurement: "Aktuelle Beschaffung",
    recentProcurementDesc: "Neueste Bestellungen und Statusaktualisierungen.",
    riskIntelligenceTitle: "Risikointelligenz",
    highPriorityInterventions: "Interventionen mit hoher Priorität erforderlich.",
    interventionNeeded: "Intervention erforderlich",
    criticality: "Kritikalität",
    warningRange: "Warnbereich",
    monitorClosely: "Genau beobachten",
    allSuppliersWithinLimits: "Alle Lieferanten innerhalb sicherer Risikogrenzen.",
  },

  // ── Mobile Navigation ──
  mobileNav: {
    navigation: "Navigation",
    subtitle: "Alles bleibt auf Laptop-Breiten erreichbar.",
    openNavigation: "Navigation öffnen",
  },

  // ── Allgemein ──
  common: {
    financeSettingsReview: "Überprüfung der Finanzeinstellungen erforderlich",
    telemetryPending: "Telemetrie-Nachweis ausstehend",
    telemetryNotAvailable: "Telemetrie-Aktualität ist noch nicht verfügbar.",
    fxNotAvailable: "FX-Berichtswährungs-Aktualität ist noch nicht verfügbar.",
    aiDependencyNotAvailable: "KI-Abhängigkeitsstatus ist noch nicht verfügbar.",
  },
  copilot: {
    welcomeMessage: "Hallo! Ich antworte aus dem Live-Arbeitsbereich von Axiom, mit fundiertem Betriebswissen und hochgeladenen PDF-, CSV-, TXT-, JSON- oder Excel-Dateien.",
    welcomeMessageShort: "Hallo! Fragen Sie nach Live-Axiom-Daten, Betriebs-Workflows oder laden Sie ein Dokument zur Analyse hoch.",
    fileTooLarge: "Datei zu groß. Maximale Größe ist 10 MB.",
    unsupportedFileType: "Nicht unterstützter Dateityp. Laden Sie PDF-, CSV-, TSV-, TXT-, JSON-, XLSX- oder XLS-Dateien hoch.",
    failedToReadFile: "Fehler beim Lesen der Datei. Bitte versuchen Sie es erneut.",
    failedToRespond: "Copilot hat nicht geantwortet. Bitte versuchen Sie es erneut.",
    failedToRespondDetailed: "Axiom Copilot konnte diese Anfrage nicht sauber abschließen. Bitte versuchen Sie es erneut oder stellen Sie eine engere Frage, und ich antworte aus dem aktuellen Snapshot des Arbeitsbereichs.",
    title: "Axiom Copilot",
    subtitle: "Stellen Sie fundierte Fragen zu Lieferanten, Teilen, Kontakten, Rechnungen, Bestellungen und analysierten Geschäftsdokumenten.",
    clearSession: "Sitzung löschen",
    analyzingData: "Copilot analysiert Ihre Daten...",
    inputPlaceholder: "Fragen Sie nach Axiom-Workflows, Live-Daten oder laden Sie eine Datei zur Analyse hoch...",
  },
  suppliers: {
    workspaceTitle: "Lieferanten-Arbeitsbereich",
    workspaceSubtitle: "Klassifizierung, Onboarding, Compliance-Abdeckung und Lieferantenrisiko in einer operativen Ansicht.",
    refreshAbc: "ABC Aktualisieren",
    openEcosystem: "Ökosystem Öffnen",
    addNew: "Neu hinzufügen",
    searchPlaceholder: "Suchen nach Name, Land, ABC-Klasse oder Punktzahl...",
    allCountries: "Alle Länder",
    allAttentionLevels: "Alle Aufmerksamkeitsstufen",
    requiresAction: "Handlungsbedarf",
    goodStanding: "Guter Stand",
    table: {
      supplier: "Lieferant",
      abc: "ABC",
      risk: "Risiko",
      performance: "Leistung",
      spend: "Ausgaben (YTD)",
      compliance: "Compliance",
      status: "Status",
      actions: "Aktionen",
    },
    sections: {
      general: "Allgemeine Übersichten",
      classification: "Klassifizierung",
      classificationDesc: "Volumen, ABC und Vertrauensstellung.",
      certificates: "Zertifikate & Dokumente",
      certificatesDesc: "Compliance-Abdeckung und Datenqualität.",
      performance: "Leistung",
      performanceDesc: "Liefertreue, Qualität und aktive Bestelllast.",
      onboarding: "Onboarding",
      potential: "Potenzielle Lieferanten",
      potentialDesc: "Noch nicht qualifizierte Interessenten.",
      qualification: "In Qualifizierung",
      qualificationDesc: "Lieferanten im Onboarding-Prozess.",
      onboarded: "Eingebundene Lieferanten",
      onboardedDesc: "Genehmigtes Netzwerk bereit für Transaktionen.",
      suspended: "Gesperrt / Abgelehnt",
      suspendedDesc: "Gestoppte oder abgelehnte Beziehungen.",
      riskEsg: "Risiko & ESG",
      riskDevelopment: "Risikoentwicklung",
      riskDevelopmentDesc: "Operatives und finanzielles Risiko.",
      watchlist: "Auffällige Lieferanten",
      watchlistDesc: "Lieferanten mit hohem Risiko oder wenig Vertrauen.",
      incidents: "Öffentliche Vorfälle",
      incidentsDesc: "Lieferanten über kritischer Risikoschwelle.",
    },
    cards: {
      volume: "Auftragsvolumen (Laufendes Jahr)",
      volumeDesc: "Live-Bestellwert im aktuell gefilterten Arbeitsbereich.",
      onboarding: "Onboarding-Warteschlange",
      onboardingDesc: "Lieferanten, die noch Qualifizierung und Onboarding durchlaufen.",
      highRisk: "Hochrisiko-Beobachtungsliste",
      highRiskDesc: "Lieferanten, die derzeit über der Interventionsschwelle liegen.",
      compliance: "Compliance-Lücken",
      complianceDesc: "Lieferanten mit unzureichender Zertifizierungs- oder Kontrollabdeckung.",
    },
    controlTable: {
      title: "Lieferanten-Kontrolltabelle",
      description: "Filtern Sie nach Lebenszyklus, Risiko, Geografie und Compliance, ohne den Lieferanten-Arbeitsbereich zu verlassen.",
      rows: "Zeilen",
      searchPlaceholder: "Suchen Sie nach Lieferanten, E-Mail, Code oder Kategorie...",
      allCountries: "Alle Länder",
      allViews: "Alle Ansichten",
      reset: "Zurücksetzen",
      emptyTitle: "Keine Lieferanten entsprechen dieser Ansicht",
      emptyDesc: "Passen Sie den Arbeitsbereich an oder löschen Sie Filter, um die Lieferantengruppe zu erweitern.",
      headers: {
        supplier: "LIEFERANT",
        country: "LAND",
        orderVolume2024: "BESTELLVOLUMEN 2024",
        orderVolume2025: "BESTELLVOLUMEN 2025",
        abc: "ABC",
        trustCompliance: "VERTRAUEN & COMPLIANCE",
        lifecycle: "LEBENSZYKLUS",
        actions: "AKTIONEN",
      },
      badges: {
        unassigned: "Nicht zugewiesen",
        prospect: "Interessent",
        active: "Aktiv",
        suspended: "Gesperrt",
        terminated: "Beendet",
      }
    }
  },
  rfqs: {
    title: "Beschaffungsanfragen (RFQs)",
    subtitle: "Verwalten Sie Angebote, Lieferanteneinladungen und den Beschaffungsfortschritt mit Schnellfiltern.",
    searchLabel: "Suchen",
    searchPlaceholder: "Titel, Beschreibung, Lieferant",
    statusLabel: "Status",
    statusOptions: {
      all: "Alle Status",
      draft: "Entwurf",
      open: "Offen",
      closed: "Geschlossen",
      cancelled: "Abgebrochen",
    },
    suppliersLabel: "Lieferanten",
    suppliersOptions: {
      all: "Alle RFQs",
      invited: "Mit Lieferanten",
      unassigned: "Ohne Lieferanten",
    },
    sortLabel: "Sortierung",
    sortOptions: {
      newest: "Neueste zuerst",
      oldest: "Älteste zuerst",
      title: "Titel A-Z",
      items: "Meiste Artikel",
      suppliers: "Meiste Lieferanten",
    },
    reset: "Zurücksetzen",
    results: "Ergebnisse",
    result: "Ergebnis",
    created: "Erstellt",
    archivedItemDetail: "Archivierte Artikeldetails nicht verfügbar",
    items: "Artikel",
    item: "Artikel",
    suppliersCount: "Lieferanten",
    supplierCount: "Lieferant",
    emptyTitle: "Keine Beschaffungsanfragen gefunden",
    emptyDesc: "Erstellen Sie Ihre erste RFQ, um die automatisierte Lieferantenauswahl zu starten.",
    emptyFilterDesc: "Passen Sie die Filter an, um die Ergebnisse zu erweitern.",
    newRequest: "Neue Beschaffungsanfrage",
    viewDetails: "Details Ansehen",
    noDescription: "Keine Beschreibung verfügbar.",
    aiSuppliers: "KI-ausgewählte Lieferanten:",
    unknown: "Unbekannt",
    noneInvited: "Noch keine eingeladen",
    liveBidMode: "Der Live-Gebotsmodus hält Lieferantenidentitäten bis zur Vergabe oder Schließung maskiert.",
  },
  rfqActions: {
    launchTitle: "Sourcing-Event starten",
    launching: "Starte...",
    launchSuccess: "Sourcing-Event gestartet",
    launchEmailSent: "Eingeladene Lieferanten können nun Live-Angebote im Portal abgeben und erhalten die Start-E-Mail.",
    launchWarning: "Lieferanten können jetzt im Portal Angebote abgeben. E-Mail-Status: {warning}",
    launchError: "Fehler beim Starten des Sourcing-Events",
    compare: "Vergleichen",
    prepTitle: "Verhandlung vorbereiten",
    preparing: "Vorbereitung...",
    prepSuccess: "Verhandlungsworkbench vorbereitet",
    prepDesc: "Workflow-Aufgabe erstellt, wobei noch {gap} gegenüber den Sollkosten offen sind.",
    prepError: "Der Verhandlungsworkflow konnte nicht vorbereitet werden",
  },
  orders: {
    title: "Beschaffungsaufträge",
    subtitle: "Kaufaufträge und RFQs verwalten.",
    activeOrders: "Aktive Bestellungen",
    activeOrdersDesc: "Aktuelle Kaufaufträge und deren Erfüllungsstatus.",
    headers: {
      orderId: "Bestell-ID",
      supplier: "Lieferant",
      status: "Status",
      amount: "Betrag",
      action: "Aktion"
    },
    unknownSupplier: "Unbekannter Lieferant",
    na: "N/V",
    empty: "Keine Bestellungen gefunden."
  },
  orderDetail: {
    back: "Zurück zu Bestellungen",
    title: "Bestelldetails",
    id: "ID",
    supplierInfo: {
      title: "Lieferanteninformationen",
      framework: "Rahmenvertrag"
    },
    summary: {
      title: "Bestellzusammenfassung",
      placedOn: "Aufgegeben am",
      na: "N/V",
      source: "Quelle",
      requisition: "Anforderung",
      standardTitle: "Standard",
      standardDesc: "Konform mit dem globalen Beschaffungsstandard",
      totalAmount: "Gesamtbetrag"
    },
    logistics: {
      title: "Logistik & Verfolgung",
      carrier: "Frachtführer",
      tracking: "Verfolgung",
      eta: "Geschätzte Ankunft",
      noTracking: "Keine Verfolgungsinformationen bereitgestellt."
    },
    items: {
      title: "Bestellte Artikel",
      partName: "Teilename",
      sku: "SKU",
      quantity: "Menge",
      unitPrice: "Einzelpreis",
      avgPrice: "Durchschn. Preis",
      subtotal: "Zwischensumme"
    }
  },
  orderActions: {
    operations: "Bestellvorgänge",
    viewDetails: "Details anzeigen",
    submitApproval: "Zur Genehmigung einreichen",
    sendSupplier: "An Lieferant senden",
    cancelOrder: "Bestellung stornieren",
    recordReceipt: "Wareneingang erfassen",
    addInvoice: "Rechnung hinzufügen",
    deleteOrder: "Bestellung löschen",
    deleteCaution: "Achtung: Das Löschen einer Bestellung ist dauerhaft und entfernt alle zugehörigen Artikel. Fortfahren?",
    successUpdate: "Bestellstatus aktualisiert",
    successDelete: "Bestellung gelöscht",
    errorUpdate: "Fehler beim Aktualisieren",
    errorDelete: "Fehler beim Löschen"
  },
  enterpriseReadiness: {
    loading: "Lade Unternehmensbereitschaft...",
    title: "Unternehmensbereitschaft",
    description: "Qualität des Lieferantennetzwerks, Integrationsstatus, Governance-Abdeckung und Nachweis der Betriebssicherheit.",
    refresh: "Audit aktualisieren",
    overall: "Gesamt",
    overallSubtitle: "überwachte Lieferanten",
    network: "Lieferantennetzwerk",
    networkSubtitle: "Onboarding-Lieferanten sind bereit zur Genehmigung",
    integrations: "Integrationen",
    integrationsSubtitle: "aktive Endpunkte | {count} Quellsysteme",
    governance: "Governance",
    governanceSubtitle: "Genehmigungsrichtlinien | {count} Toleranzen",
    reliability: {
      title: "Zuverlässigkeitsnachweis",
      dataConfidence: "Datenzuversicht",
      dataConfidenceSub: "durchschnittliche Zuversicht der Lieferantenintelligenz",
      webhook: "Webhook-Zuverlässigkeit",
      webhookSub: "kürzliche Lieferungen beobachtet",
      import: "Import-Zuverlässigkeit",
      importSub: "kürzliche Importjobs",
      compliance: "Abdeckung der Compliance-Nachweise",
      expired: "Abgelaufene oder überfällige Verpflichtungen",
      overdue: "Überfällige Lieferantenanfragen"
    },
    priorityActions: {
      title: "Prioritätsaktionen",
      none: "Beim letzten Audit wurden keine prioritären Lücken festgestellt."
    },
    gaps: {
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
      lowWebhookReliability: "Die Ausfallrate der Webhook-Zustellung deutet auf zugrunde liegende Verbindungsprobleme hin.",
      missingContact: "Primärer Lieferantenkontakt fehlt.",
      missingCategories: "Lieferkategorien wurden nicht klassifiziert.",
      missingLocation: "Standortabdeckung ist unvollständig.",
      missingComplianceMarkers: "Keine Zertifizierung oder Menschenrechtsbescheinigung erfasst.",
      missingFinancialBaseline: "Finanzielle Basis wurde nicht ermittelt.",
      missingPerformanceBaseline: "Leistungsbasis wurde nicht ermittelt.",
      missingDocuments: "Es wurden keine Lieferantendokumente hochgeladen.",
      complianceWithoutEvidence: "Compliance-Verpflichtungen bestehen ohne Nachweise.",
      overdueRequestsCount: "{count} Lieferantenanfrage(n) sind überfällig.",
      overdueComplianceCount: "{count} Compliance-Verpflichtung(en) sind überfällig.",
      escalatedTasksCount: "{count} Workflow-Aufgabe(n) sind eskaliert."
    },
    attentionSuppliers: {
      title: "Lieferanten mit Handlungsbedarf",
      confidence: "Zuversicht"
    }
  },
  parts: {
    title: "Teile-Intelligenz",
    subtitle: "Strategisches Bestandsmanagement und Markttrendanalyse.",
    cards: {
      totalInventory: "Gesamtbestand",
      lowStock: "Niedriger Bestand",
      critical: "Kritisch",
      categories: "Kategorien",
    },
    linkedCoverage: "Verknüpfte Transaktionsabdeckung",
    orderLinks: "Bestellungslinks",
    invoiceLinks: "Rechnungslinks",
    topLinkedParts: "Top verknüpfte Teile",
    orders: "Bestellungen",
    invoices: "Rechnungen",
    rfqs: "RFQs",
    table: {
      title: "Teilebestand",
      subtitle: "Überprüfen Sie den Zustand der Bestände, Preis-Benchmarks und verknüpfte Beschaffungsaktivitäten an einem Ort.",
      searchPlaceholder: "Nach Teil, SKU oder Kategorie suchen...",
      sku: "SKU",
      partName: "TEILENAME",
      category: "KATEGORIE",
      stock: "BESTAND",
      currentPrice: "AKTUELLER PREIS",
      marketTrend: "MARKT-TREND",
      status: "STATUS",
      actions: "AKTIONEN",
      emptyTitle: "Keine Teile gefunden",
      emptyDesc: "Versuchen Sie, Ihre Suche oder Filter anzupassen.",
    },
  },
  requisitions: {
    titleAdmin: "Interne Anforderungen",
    titleUser: "Meine Anforderungen",
    subtitleAdmin: "P2P-Workflow: Verwaltung interner Bestellanforderungen und Freigaben.",
    subtitleUser: "Verfolgen Sie die von Ihnen erstellten Bestellanforderungen und deren aktuellen Freigabestatus.",
    cards: {
      totalAdmin: "Gesamtanforderungen",
      totalUser: "Meine Anforderungen",
      totalAdminDesc: "Abteilungsübergreifend",
      totalUserDesc: "Von Ihrem Konto erstellt",
      pending: "Ausstehende Freigabe",
      pendingAdminDesc: "Warten auf Budgetprüfung",
      pendingUserDesc: "Warten auf Administratorprüfung",
      approved: "Genehmigtes Volumen",
      approvedDesc: "Bereit zur Umwandlung in Bestellung",
    },
    table: {
      title: "Anforderungsbuch",
      subtitle: "Umfassender Prüfpfad interner Beschaffungsanforderungen.",
      id: "ID",
      titleDept: "Titel / Abteilung",
      estAmount: "Geschätzter Betrag",
      status: "Status",
      requestedOn: "Angefordert am",
      actions: "Aktionen",
      unassigned: "Nicht zugewiesen",
      empty: "Keine Anforderungen gefunden. Beginnen Sie mit der Erstellung einer internen Anfrage.",
    },
  },
  adminAnalytics: {
    title: "Beschaffungs-Analyse-Board",
    subtitle: "Live-Ausgaben, Kategoriekonzentration und Beschaffungsgeografie aus dem aktuellen operativen Datensatz.",
    spendVolume: "Ausgabenvolumen",
    spendVolumeDesc: "Monatlicher Wert der verbuchten Bestellungen im Live-Betriebsdatensatz.",
    spendEmpty: "Ausgabenanalysen werden freigeschaltet, sobald verbuchte Bestellungen verfügbar sind.",
    categoryVolume: "Kategorievolumen",
    categoryVolumeDesc: "Aktuelle Portfoliokonzentration über Ausgabenkategorien hinweg.",
    categoryEmpty: "Kategoriekonzentration wird angezeigt, sobald Bestellpositionen zugeordnet sind.",
    countryVolume: "Ländervolumen",
    countryVolumeDesc: "Top-Geografien nach beschafftem Auftragsvolumen.",
    ordersCount: "Bestellungen",
    countryEmpty: "Länderbezogenes Beschaffungsvolumen wird angezeigt, sobald Lieferantengeografien vorhanden sind.",
    openAnalytics: "Analytics öffnen",
  },
  adminAnalyticsHub: {
    title: "Intelligence Hub",
    subtitle: "Enterprise-Beschaffungsanalysen mit intuitiver ROI-Betrachtung und verifizierter, makelloser Filterung",
    initializing: "Initialisiere Intelligence Hub...",
    filters: "Filter",
    export: "Exportieren",
    apply: "Anwenden",
    reset: "Zurücksetzen",
    trendMonthly: "monatlich",
    trendQuarterly: "vierteljährlich",
    trendYearly: "jährlich",
    clearAll: "Alle löschen",
    noOptions: "Keine Optionen",
    filterLabels: {
      from: "Von",
      to: "Bis",
      region: "Region",
      supplier: "Lieferant",
      category: "Kategorie",
      invoiceStatus: "Rechnungsstatus",
      orderStatus: "Bestellstatus",
      invoiceStatuses: {
        pending: "Ausstehend",
        matched: "Abgeglichen",
        disputed: "Umstritten",
        paid: "Bezahlt"
      },
      orderStatuses: {
        draft: "Entwurf",
        pending_approval: "Genehmigung ausstehend",
        approved: "Genehmigt",
        rejected: "Abgelehnt",
        sent: "Gesendet",
        fulfilled: "Erfüllt",
        cancelled: "Abgebrochen"
      }
    },
    kpis: {
      totalSpend: "Gesamtausgaben",
      savings: "Einsparungen",
      savingsRate: "Sparquote",
      avgOrder: "Durchschn. Bestellung",
      suppliers: "Lieferanten",
      orders: "Bestellungen",
      invoices: "Rechnungen",
      categories: "Kategorien",
      ordersSubtitle: "Bestellungen",
      rateSubtitle: "Quote",
      savingsRateSubtitle: "von ersten Angeboten",
      suppliersSubtitle: "aktiv im Zeitraum",
      categoriesSubtitle: "erfasst",
    },
    charts: {
      spendTrend: "Ausgaben & Einsparungen Trend",
      spendTrendDesc: "{view} Ausgabenentwicklung mit Einsparungs-Overlay",
      categoryDist: "Kategorienverteilung",
      categoryDistDesc: "Ausgabenkonzentration über Kategorien hinweg",
      topSuppliers: "Top-Lieferanten",
      bySpend: "nach Ausgaben",
      invoiceStatus: "Rechnungsstatus",
      invoiceStatusDesc: "Verteilung nach Status",
      orderStatus: "Bestellstatus",
      orderStatusDesc: "Verteilung der Beschaffungsaufträge",
      spendByRegion: "Ausgaben nach Region",
      spendByRegionDesc: "Geografische Ausgabenverteilung",
      priceVariance: "Preisabweichungsanalyse",
      priceVarianceDesc: "Durchschn. ursprüngliches Angebot vs. tatsächlicher Preis im Zeitverlauf – Differenz stellt Einsparungen dar",
      savingsBreakdown: "Aufschlüsselung der Einsparungen",
      savingsBreakdownDesc: "Nach Art der Verhandlungsstrategie",
      supplierRisk: "Lieferantenrisiko vs. Leistung",
      supplierRiskDesc: "Blasengröße = Ausgabenvolumen. Top 50 Lieferanten nach Ausgaben.",
      scatter: "Streudiagramm",
      top5Compare: "Top 5 Lieferantenvergleich",
      top5CompareDesc: "Mehrdimensionales Score-Overlay",
      spendByCountry: "Ausgaben nach Land",
      spendByCountryDesc: "Wichtigste Beschaffungsziele",
      invoiceVolume: "Rechnungsvolumen nach Region",
      invoiceVolumeDesc: "Regionale Rechnungskonzentration",
      topParts: "Top Artikel nach Ausgaben",
      topPartsDesc: "Artikel mit höchstem Wert mit Volumen- und Preismetriken",
      top15: "Top 15",
      contractPortfolio: "Vertragsportfolio",
      contractPortfolioDesc: "Wertverteilung nach Vertragsart",
    },
    footer: "Intelligence Hub — {categories} Kategorien · {suppliers} Lieferanten · {periods} Perioden erfasst",
    footerFilterActive: " · {count} Filter aktiv",
    footerFiltersActive: " · {count} Filter aktiv"
  },
  riskIntelligence: {
    aiAssessment: "KI-Bewertung",
    runDeepDive: "Risiko Deep-Dive starten",
    currentRisk: "Aktueller Risikowert: ",
    keyAlerts: "Wichtige Warnungen",
    mitigationStrategy: "Minderungsstrategie",
    unrunDesc: "Führen Sie den KI Deep-Dive aus, um Leistungsdaten, ESG-Compliance und Signale für finanzielle Stabilität zu analysieren.",
    success: "Risikoanalyse für {name} abgeschlossen.",
    fail: "Risikoprofil konnte nicht analysiert werden",
    error: "Während der Risikoanalyse ist ein Fehler aufgetreten",
    levels: {
      low: "Gering",
      medium: "Mittel",
      high: "Hoch",
      critical: "Kritisch"
    },
    riskSuffix: "Risiko"
  },
  geoRiskMap: {
    title: "Globaler Risiko-Kontrollturm",
    monitoringFrom: "Überwachung aus",
    noSuppliers: "Keine Lieferanten-Geodaten verfügbar.",
    riskScore: "Risikowert",
    geographicDist: "Geografische Verteilung",
    totalSuppliers: "Gesamte Lieferanten",
    atRiskClusters: "Gefährdete Cluster",
    homeCountry: "Heimatland",
    baseCurrency: "Basiswährung",
    topHotspot: "Top Hotspot",
    regionsAtRisk: "{count} Regionen gefährdet",
    noActiveHotspots: "Keine aktiven Hotspots",
    riskByRegion: "Risiko nach Region",
    high: "hoch",
    countryHotspots: "Länder-Hotspots",
    noCountryData: "Keine Länderrisikodaten.",
    legendHome: "Heimatbasis",
    legendLow: "Lieferanten (Geringes Risiko)",
    legendMod: "Mittleres Risiko",
    legendHigh: "Hohes Risiko"
  },
  goodsReceipts: {
    title: "Wareneingangsprotokoll",
    subtitle: "Lagereingang, Qualitätsprüfung und Bereitschaft für den Dreierabgleich an einem Ort.",
    openException: "Ausnahmemanagement öffnen",
    cards: {
      total: "Gesamteingänge",
      totalDesc: "Alle protokollierten Wareneingänge",
      passed: "Qualitätsprüfung bestanden",
      passedDesc: "Bereit für nachgelagerten Abgleich",
      pending: "Ausstehende Prüfung",
      pendingDesc: "Warten auf Lager- oder Qualitätsprüfung",
      failed: "Qualitätsprüfung fehlgeschlagen",
      failedDesc: "Erfordert Rückgabe, Nacharbeit oder Eskalation",
    },
    warehouseLight: "Lager Leichtansicht",
    warehouseLightDesc: "Kompakte Karten halten den Wareneingang auf kleineren Laptopbildschirmen und Bildschirmen im Lager nutzbar.",
    inboundLedger: "Eingangsbuch",
    inboundLedgerDesc: "Verifiziertes Protokoll der erhaltenen Lieferungen mit Prüfergebnissen und Bestellrückverfolgbarkeit.",
    table: {
      reference: "Referenz",
      supplier: "Lieferant",
      receivedBy: "Empfangen von",
      timestamp: "Zeitstempel",
      inspection: "Prüfung",
      notes: "Notizen",
      action: "Aktion",
      orderRef: "Bestellref",
      unknownSupplier: "Unbekannter Lieferant",
      warehouseNotes: "Lagernotizen",
      defaultNote: "Eingang im Lager verifiziert.",
    },
    empty: {
      title: "Keine Wareneingänge für diesen Zeitraum protokolliert.",
      desc: "Verwenden Sie \"Neue Lieferung erfassen\", um eingehende Bestände zu protokollieren und die Qualitätsprüfung zu starten.",
    },
    workflow: {
      title: "Wareneingangs-Workflow",
      step1: "1. Wareneingang",
      step1Desc: "Protokollieren Sie die eingehende Lieferung und verbinden Sie sie mit der Bestellung, die das Lager entlädt.",
      step2: "2. Qualitätsprüfung",
      step2Desc: "Das Lager oder die Qualitätssicherung markiert den Eingang als bestanden, fehlgeschlagen oder bedingt mit Notizen, die der Einkauf sofort sehen kann.",
      step3: "3. Abgleichbereitschaft",
      step3Desc: "Das System validiert die Übereinstimmung von Bestellung, Eingang und Rechnung, damit die Finanzabteilung später nicht raten muss.",
      step4: "4. Zahlungsfreigabe",
      step4Desc: "Nur ein sauberer Empfangspfad sollte in den Status 'abgeglichen' und zur Zahlungsfreigabe übergehen.",
    },
    status: {
      passed: "Bestanden",
      failed: "Fehlgeschlagen",
      conditional: "Bedingt",
      pending: "Ausstehend",
    }
  },
  exceptions: {
    title: "Ausnahmemanagement",
    subtitle: "Quarantäne fehlerhafter operativer Datensätze, bevor sie zu Zahlungsfehlern, Lieferantenausfällen oder unbemerkter Datenverschiebung werden.",
    buttons: {
      risk: "Risikointelligenz",
      receipts: "Wareneingänge",
      invoices: "Rechnungsbelege",
    },
    cards: {
      openExceptions: "Offene Ausnahmen",
      openExceptionsDesc: "Fehlerhafte Datensätze warten auf manuelle oder richtlinienbasierte Lösung",
      releaseBlocks: "Freigabesperren",
      releaseBlocksDesc: "Bestellungen, die vor Genehmigung oder Versand zurückgehalten werden",
      receiptQuarantine: "Eingangsquarantäne",
      receiptQuarantineDesc: "Lager- und QC-Probleme noch vor der Finanzabteilung",
      financeHolds: "Finanzsperren",
      financeHoldsDesc: "Ausstehende oder umstrittene Datensätze, die noch von der Freigabe blockiert sind",
    },
    prevention: {
      title: "Präventionsregeln aktiv",
      subtitle: "Bestellungen verlassen sich nicht auf eine reine Warn-Benutzeroberfläche. Freigabe, Empfang und Finanzen folgen nun Blockierregeln.",
      supplier: "Lieferantenfreigabe",
      supplierDesc: "Lieferanten mit Risiko 70+ bleiben vor Genehmigung oder Versand blockiert.",
      warehouse: "Lagerquarantäne",
      warehouseDesc: "Fehlerhafte oder bedingte Eingänge fließen nicht stillschweigend in den Finanzabgleich ein.",
      finance: "Deterministische Finanzen",
      financeDesc: "Zahlungsfreigabe bleibt an Bestellung, Eingang, QC und Rechnungsmathematik gebunden, anstatt nur an KI-Urteile.",
    },
    quarantine: {
      title: "Quarantäne-Warteschlange",
      subtitle: "Jeder Punkt unten erklärt, was kaputt ist, warum es blockiert ist und welcher Weg es löscht.",
      whyBlocked: "Warum es blockiert ist",
      nextAction: "Nächste Aktion",
    },
    empty: {
      title: "Derzeit keine aktiven Ausnahmen.",
      desc: "Freigabesperren, Eingangsquarantäne und Finanzsperren sind derzeit leer.",
    },
    operationalTruth: {
      title: "Operative Wahrheit",
      subtitle: "Deckungsansprüche bleiben an Live-Beweise gebunden, anstatt an pauschale Prozentsätze.",
      fxRates: "FX-Buchkurse",
      fxRatesUnavailable: "FX-Status nicht verfügbar",
      fxRatesDesc: "Aktualisierungsstatus des Berichtsbuches ist nicht verfügbar.",
      queue: "Warteschlangendruck",
      queueUnavailable: "Warteschlange nicht verfügbar",
      queueDesc: "Ausnahmedruck ist nicht verfügbar.",
    },
    escalation: {
      title: "Eskalationspfad",
      subtitle: "Abteilungseskalationen bleiben an Live-Lead-Zuordnungen aus dem Arbeitsbereichsverzeichnis gebunden.",
      desc: "Verwenden Sie das Dashboard-Eskalationspanel, wenn ein blockierter Lieferant, eine umstrittene Rechnung oder eine Lagerquarantäne schnell Finanz-, Beschaffungs- oder Betriebsverantwortung benötigt.",
      button: "Dashboard-Kanäle öffnen",
    },
    types: {
      supplierBlock: "Freigabesprerre",
      receiptQuarantine: "Eingangsquarantäne",
      invoiceDispute: "Rechnungsstreit",
      financeHold: "Finanzsperre",
    }
  },
  contracts: {
    title: "Vertragsmanagement",
    subtitle: "Überwachen Sie Compliance, Verlängerungen und Rahmenverträge.",
    cards: {
      active: "Aktive Verträge",
      activeDesc: "Derzeit in Kraft",
      expiring: "Ablaufend (60 Tage)",
      expiringDesc: "Erfordert Verlängerungsaktion",
      expired: "Abgelaufen",
      expiredDesc: "Muss verlängert oder geschlossen werden",
      value: "Gesamter Vertragswert",
      valueDesc: "Über alle Verträge hinweg"
    },
    focus: {
      title: "Befehlsleisten-Fokus aktiviert",
      desc: "Der ausgewählte Vertrag wurde nach oben verschoben, damit der Einkäufer ihn ohne erneute Suche überprüfen kann."
    },
    card: {
      val: "Wert",
      ends: "Endet",
      na: "N/V",
      expiredAgo: "Vor {days}T abgelaufen",
      daysLeft: "Noch {days}T",
      autoRenew: "Auto-Verlängerung",
      manualRenew: "Manuelle Verl."
    },
    empty: {
      title: "Keine Verträge gefunden",
      desc: "Beginnen Sie, indem Sie Ihren ersten Rahmenvertrag oder eine NDA mit einem Lieferanten erstellen."
    }
  },
  invoices: {
    title: "Rechnungsmanagement",
    subtitle: "Filtern, verfolgen und exportieren Sie Rechnungen über alle Regionen hinweg.",
    buttons: {
      exceptions: "Ausnahmen",
      upload: "Rechnung hochladen",
      refresh: "Aktualisieren",
      filters: "Filter",
      clearAll: "Alle löschen"
    },
    lens: {
      title: "Währungs- und Überprüfungsansicht",
      desc: "Die ursprünglichen Rechnungsbeträge bleiben unberührt. Die aktive Ansicht ändert die Anzeige und Zusammenfassungen, ohne Lieferantendokumente oder länderspezifische Steuernachweise umzuschreiben.",
      active: "Aktive Ansicht",
      activeReporting: "Stabile Buchkurse für Finanzberichte.",
      activeLocal: "Lokale FX-Ansicht für regionale Operatoren und Beschaffungsteams.",
      converted: "Konvertiertes Risiko",
      convertedDesc: "{covered}/{total} sichtbare Rechnungen haben in dieser Ansicht eine aktive FX-Deckung.",
      tax: "Steuer- und Freigabestatus",
      taxTitle: "Überprüfung im Ursprungsland",
      taxDesc: "MwSt., GST und regionale Nachweise bleiben an die Originalrechnung und das Lieferantenland gebunden. Überprüfen Sie das Quelldokument vor der Freigabe, wenn die Steuerabwicklung rechtlich sensibel ist."
    },
    filters: {
      title: "Erweiterte Filter",
      invoiceNo: "Rechnung #",
      status: "Status",
      continent: "Kontinent",
      country: "Land",
      region: "Region / Zone",
      currency: "Währung",
      fromDate: "Von Datum",
      toDate: "Bis Datum"
    },
    cards: {
      total: "Gesamtrechnungen",
      totalDesc: "Sichtbare Datensätze",
      pending: "Ausstehende Prüfung",
      pendingDesc: "Erwartet Aktion",
      matched: "Abgeglichen & Verifiziert",
      matchedDesc: "3-Wege-verifiziert",
      review: "Manuelle Warteschlange",
      reviewDesc: "Eskalierte oder unsichere Rechnungen",
      payable: "Gesamt zahlbar",
      payableDesc: "In Originalrechnungswährungen"
    },
    charts: {
      status: "Statusverteilung",
      region: "Betrag nach Region",
      trend: "Rechnungsvolumentrend"
    },
    ledger: {
      title: "Rechnungsbuch",
      loading: "Lade Rechnungen...",
      found: "{count} Rechnung(en) gefunden — Beträge in Originalwährung",
      empty: "Keine Rechnungen gefunden, die den aktuellen Filtern entsprechen.",
      columns: {
        invoiceNo: "Rechnung #",
        supplier: "Lieferant",
        status: "Status",
        country: "Land",
        region: "Region",
        continent: "Kontinent",
        date: "Datum",
        amount: "Betrag",
        actions: "Aktionen"
      }
    }
  },
  inventory: {
    title: "Inventar",
    subtitle: "Lagerbestände & Teileverwaltung",
    actions: {
      createRequisition: "Anforderung erstellen",
      partsCatalog: "Teilekatalog",
      export: "Exportieren",
      selectFormat: "Format auswählen",
      exportCsv: "Als CSV exportieren",
      exportJson: "Als JSON exportieren",
      adjustStock: "Bestand anpassen",
      bulkReorder: "Massen-Nachbestellung",
      reorder: "Nachbestellen",
      manage: "Verwalten",
      goToPartsCatalog: "Zum Teilekatalog gehen",
    },
    cards: {
      totalSkus: "Gesamt-SKUs",
      totalUnits: "Einheiten auf Lager",
      stockHealth: "Lagergesundheit",
      aboveReorderPoint: "SKUs über dem Nachbestellpunkt",
      reorderAlerts: "Nachbestellalarme",
      belowReorder: "SKUs unter der Nachbestellschwelle",
      outOfStock: "Nicht auf Lager",
      zeroInventory: "SKUs mit Nullbestand",
    },
    abc: {
      title: "ABC-Klassifizierung",
      desc: "Inventarwertsegmentierung",
      aDesc: "Hochwertige Artikel (Top 20% nach Ausgaben)",
      bDesc: "Mittelwertige Artikel (nächste 30% nach Ausgaben)",
      cDesc: "Geringwertige Artikel (restliche 50%)",
      noneDesc: "Nicht klassifizierte Artikel",
    },
    category: {
      title: "Kategorie-Aufschlüsselung",
      desc: "Top-Kategorien nach SKU-Anzahl",
      empty: "Keine Kategorien gefunden",
    },
    alerts: {
      title: "Nachbestellung erforderlich",
      desc: "Artikel benötigen sofortige Aufmerksamkeit",
      showing: "Zeige",
      of: "von",
      items: "Artikeln.",
      viewAll: "Alle im Teilekatalog anzeigen →",
    },
    table: {
      title: "Gesamtes Inventar",
      desc: "SKUs mit aktuellen Lagerbeständen",
      emptyTitle: "Noch keine Teile im Inventar.",
      emptyDesc: "Fügen Sie Teile über den Teilekatalog hinzu, um Bestände zu verfolgen.",
      sku: "SKU",
      partName: "Teilename",
      category: "Kategorie",
      abc: "ABC",
      onHand: "Auf Lager",
      minLevel: "Min-Level",
      reorderAt: "Nachbestellen bei",
      trend: "Trend",
      status: "Status",
      actions: "Aktionen",
    },
    messages: {
      exportSuccess: "Inventar erfolgreich exportiert",
      exportSuccessDesc: "{count} SKUs als CSV gespeichert.",
      exportFail: "Fehler beim Exportieren der Inventardaten",
      jsonComingSoon: "JSON-Export kommt bald",
      adjustModeEnabled: "Inventar-Anpassungsmodus aktiviert. Wählen Sie ein Teil zum Ändern.",
    },
    status: {
      outOfStock: "Nicht auf Lager",
      critical: "Kritisch",
      lowStock: "Niedriger Bestand",
      inStock: "Auf Lager"
    },
    trend: {
      rising: "steigend",
      falling: "fallend",
      stable: "stabil"
    }
  },
  // ── Modals & Dialogs ──
  createOrderModal: {
    trigger: "Bestellung anlegen",
    title: "Neue Bestellung anlegen",
    desc: "Erstellen Sie einen Beschaffungsentwurf mit sichtbaren Lieferantenkontrollen vor der Freigabe.",
    selectSupplier: "Lieferant auswählen",
    selectSupplierPlaceholder: "Einen Lieferanten auswählen...",
    supplierClear: "Lieferant ist derzeit für Entwurfserstellung und Freigabe-Routing freigegeben.",
    incoterms: "Incoterms",
    incotermsPlaceholder: "z.B. FOB, DAP",
    asn: "ASN-Nummer (Optional)",
    asnPlaceholder: "Vorab-Versandmitteilung",
    orderItems: "Bestellpositionen",
    addItem: "Position hinzufügen",
    noItems: "Noch keine Positionen hinzugefügt.",
    part: "Teil",
    qty: "Menge",
    estUnitPrice: "Geschätzter Einzelpreis",
    estOrderValue: "Geschätzter Bestellwert",
    cancel: "Abbrechen",
    creating: "Erstelle...",
    create: "Bestellung anlegen",
    success: "Bestellung erstellt",
    fail: "Fehler beim Erstellen der Bestellung"
  },
  createRfqModal: {
    trigger: "Neue Beschaffungsanfrage",
    title: "Beschaffungsanfrage erstellen",
    desc: "Definieren Sie Ihre Anforderungen. Unsere KI wählt automatisch die besten Lieferanten basierend auf Leistung und Risiko aus.",
    projectTitle: "Projekttitel",
    projectTitlePlaceholder: "z.B., Q1 Elektronik-Beschaffung",
    projectDesc: "Beschreibung (Optional)",
    projectDescPlaceholder: "Kurze Zusammenfassung des Projekts",
    partsQuantities: "Teile & Mengen",
    addPart: "Teil hinzufügen",
    selectPart: "Teil auswählen",
    selectPartPlaceholder: "SKU / Name",
    quantity: "Menge",
    cancel: "Abbrechen",
    creating: "Erstelle...",
    create: "Erstellen & KI-Auswahl starten",
    noPartsError: "Bitte fügen Sie mindestens ein Teil hinzu",
    success: "Anfrage erstellt! Die KI hat die besten Lieferanten ausgewählt.",
    fail: "Fehler beim Erstellen der Anfrage"
  },
  addInvoiceDialog: {
    trigger: "Rechnung hinzufügen",
    title: "Lieferantenrechnung erfassen",
    desc: "Geben Sie die Finanzdetails aus der Rechnung des Lieferanten für den Dreiecksabgleich ein.",
    invoiceNumber: "Rechnungsnummer",
    invoiceNumberPlaceholder: "INV-2024-001",
    invoiceAmount: "Rechnungsbetrag (₹)",
    amountPlaceholder: "0,00",
    cancel: "Abbrechen",
    recording: "Erfasse...",
    record: "Rechnung erfassen",
    success: "Rechnung erfolgreich erfasst",
    fail: "Fehler beim Hinzufügen der Rechnung"
  },
  recordReceiptDialog: {
    trigger: "Wareneingang erfassen",
    title: "Lieferbeleg erfassen",
    desc: "Protokollieren Sie den physischen Wareneingang im Lager für diese Bestellung.",
    qcChecklist: "Qualitätskontroll-Checkliste",
    visualInspection: "Sichtprüfung bestanden (Keine Schäden)",
    quantityVerified: "Menge bestätigt (Stimmt mit PO überein)",
    documentMatch: "Dokumente stimmen überein (Rechnung/ASN)",
    notes: "Eingangs- & QS-Notizen",
    notesPlaceholder: "z.B. 5 Kartons erhalten, keine äußeren Schäden, gegen Packliste geprüft.",
    confirm: "Lieferung & QS bestätigen",
    success: "Wareneingang erfolgreich erfasst",
    fail: "Fehler beim Erfassen des Wareneingangs"
  },
  updateLogisticsDialog: {
    trigger: "Tracking aktualisieren",
    title: "Versandverfolgung verwalten",
    desc: "Aktualisieren Sie die Spediteurdetails und die voraussichtliche Ankunft für diese Bestellung.",
    carrier: "Spediteur",
    carrierPlaceholder: "z.B. FedEx, DHL, BlueDart",
    trackingNum: "Sendungsnummer",
    trackingNumPlaceholder: "z.B. TRK123456789",
    eta: "Voraussichtliche Ankunft",
    cancel: "Abbrechen",
    updating: "Aktualisiere...",
    update: "Logistik aktualisieren",
    success: "Logistikinformationen aktualisiert",
    fail: "Fehler beim Aktualisieren der Logistik"
  },
  manualInviteDialog: {
    trigger: "Manuell einladen",
    title: "Lieferanten einladen",
    desc: "Wählen Sie manuell einen Lieferanten zur Teilnahme an diesem Beschaffungsereignis aus.",
    searchPlaceholder: "Lieferanten suchen...",
    risk: "Risiko",
    performance: "Leistung",
    invite: "Einladen",
    inviting: "Lade ein...",
    noSuppliers: "Keine geeigneten Lieferanten gefunden.",
    success: "Lieferant erfolgreich eingeladen",
    successDescFull: "Portalzugang und E-Mail-Kommunikation wurden beide gesendet.",
    successDescPartial: "Portalzugang ist aktiv. E-Mail-Status: {warning}",
    successDescPortal: "Portalzugang ist für diesen Lieferanten aktiv.",
    fail: "Fehler beim Einladen des Lieferanten",
    error: "Ein Fehler ist aufgetreten"
  },
  transactionView: {
    title: "Transaktionen",
    subtitle: "Einheitliche Ansicht von Bestellungen, Wareneingängen, Rechnungen und Verträgen in ihrer erfassten Währung.",
    tabs: {
      all: "Alle Transaktionen",
      orders: "Bestellungen",
      goodsReceipts: "Wareneingänge",
      invoices: "Rechnungen",
      contracts: "Mengenverträge"
    },
    filters: {
      search: "Transaktionen suchen...",
      exportCsv: "CSV exportieren"
    },
    table: {
      type: "Typ",
      reference: "Referenz",
      status: "Status",
      amount: "Betrag",
      date: "Datum"
    },
    types: {
      order: "Bestellung",
      invoice: "Rechnung",
      goodsReceipt: "Wareneingang",
      contract: "Mengenvertrag"
    },
    messages: {
      exported: "Transaktionen exportiert"
    }
  },
  contactView: {
    title: "Kontakte",
    subtitle: "Kontaktverzeichnis für Lieferanten und Partner verwalten.",
    stats: {
      total: "Gesamte Kontakte",
      verified: "Verifiziert",
      actionRequired: "Handlungsbedarf"
    },
    actions: {
      exportCsv: "CSV exportieren",
      addContact: "Kontakt hinzufügen"
    },
    form: {
      title: "Neuer Kontakt",
      fullName: "Vollständiger Name",
      email: "E-Mail-Adresse",
      phone: "Telefonnummer",
      company: "Unternehmen / Lieferant",
      jobTitle: "Berufsbezeichnung",
      country: "Land",
      region: "Region / Zone",
      continent: "Kontinent",
      currency: "Währung",
      notes: "Notizen",
      cancel: "Abbrechen",
      save: "Kontakt speichern",
      saving: "Speichern..."
    },
    filters: {
      search: "Kontakte suchen...",
      allStatuses: "Alle Status",
      allContinents: "Alle Kontinente"
    },
    table: {
      name: "Name",
      company: "Unternehmen & Rolle",
      contactInfo: "Kontaktinfo",
      location: "Standort",
      status: "Status",
      actions: "Aktionen",
      setStatus: "Status festlegen"
    },
    messages: {
      exported: "Kontakte exportiert",
      addSuccess: "Kontakt erfolgreich hinzugefügt",
      addFail: "Fehler beim Hinzufügen des Kontakts",
      statusUpdated: "Status aktualisiert"
    }
  },
  sustainabilityPage: {
    title: "Nachhaltigkeit & ESG",
    subtitle: "CO2-Fußabdruck / ESG-Scores / Compliance",
    suppliersTracked: "Verfolgte Lieferanten",
    carbonFootprint: "CO2-Fußabdruck (tCO2e)",
    totalEmissions: "Gesamtemissionen",
    totalEmissionsDesc: "tCO2e über alle Scopes",
    scope1: "Scope 1 (Direkt)",
    scope1Desc: "Direkte Lieferantenemissionen",
    scope2: "Scope 2 (Energie)",
    scope2Desc: "Indirekte Energieemissionen",
    scope3: "Scope 3 (Wertschöpfungskette)",
    scope3Desc: "Emissionen der Wertschöpfungskette",
    esgOverview: "Durchschnittliche ESG-Scores",
    esgOverviewDesc: "Über {count} Lieferanten",
    overallEsg: "Gesamt-ESG",
    environmental: "Umwelt",
    social: "Soziales",
    governance: "Unternehmensführung",
    renewableShare: "Erneuerbare Energien Anteil",
    complianceOverview: "Compliance-Übersicht",
    complianceDesc: "Konfliktmineralien, moderne Sklaverei & Zertifizierungen",
    compliant: "Konform",
    unknown: "Unbekannt",
    nonCompliant: "Nicht konform",
    conflictStatus: "Konfliktmineralien-Status (OECD/Dodd-Frank)",
    modernSlavery: "Erklärungen zur modernen Sklaverei",
    isoCertified: "ISO-zertifizierte Lieferanten",
    lowestCarbon: "Lieferanten mit geringstem CO2",
    lowestCarbonDesc: "Schnelle Auswahlliste für umweltfreundlichere Beschaffungsentscheidungen.",
    noCarbonData: "Noch keine CO2-Offenlegungen von Lieferanten erfasst.",
    tco2eTotal: "tCO2e gesamt",
    leaderboard: "Lieferanten-ESG-Bestenliste",
    leaderboardDesc: "Nach Gesamt-ESG-Score bewertet - Top {count} Lieferanten",
    noEsgData: "Noch keine Lieferanten-ESG-Daten.",
    noEsgDataDesc: "ESG-Scores werden ausgefüllt, wenn Lieferanten eingebunden und geprüft werden.",
    table: {
      supplier: "Lieferant",
      esg: "ESG",
      env: "Umwelt",
      renewables: "Erneuerbar",
      social: "Sozial",
      gov: "Unternehmen",
      scope: "Scope 1+2+3",
      conflict: "Konfliktmineralien",
      iso: "ISO-Zert."
    }
  },
  savingsView: {
    title: "Einsparungs-Intelligenz",
    subtitle: "Verfolgen Sie verhandelte Einsparungen, Kostenvermeidung und Beschaffungseffizienz ohne Live-FX-Konvertierung.",
    stats: {
      totalSavings: "Gesamteinsparungen",
      totalSavingsDesc: "Unterhalb des ursprünglichen Angebots verhandelt",
      actualSpend: "Tatsächliche Ausgaben",
      actualSpendDesc: "Gesamte Beschaffungsausgaben",
      savingsRate: "Einsparquote",
      savingsRateDesc: "Durchschnittlich eingesparter Prozentsatz",
      ordersWithSavings: "Bestellungen mit Einsparungen",
      ordersWithSavingsDesc: "Optimierte Transaktionen"
    },
    actions: {
      exportCsv: "Exportieren"
    },
    charts: {
      savingsBySupplier: "Einsparungen nach Lieferant",
      savingsBySupplierDesc: "Ausgaben vs. Einsparungen pro Lieferant – Lücke stellt Beschaffungseffizienz dar",
      savingsTrend: "Monatlicher Einsparungstrend",
      savingsTrendDesc: "Einsparverlauf mit Ausgabenüberlagerung",
      savingsByType: "Einsparungen nach Typ",
      savingsByTypeDesc: "Verhandlung, Mengenrabatt, strategische Beschaffung",
      spend: "Ausgaben",
      savings: "Einsparungen",
      month: "Monat"
    },
    lists: {
      topSavingsTransactions: "Top Einsparungstransaktionen",
      topSavingsTransactionsDesc: "Bestellungen mit höchsten ausgehandelten Einsparungen",
      noSavingsData: "Noch keine Einsparungsdaten. Fügen Sie Bestellungen erste Angebote hinzu, um Einsparungen zu verfolgen.",
      saved: "gespart",
      type: "Typ"
    },
    messages: {
      exported: "Einsparungsbericht exportiert"
    }
  },
  sustainabilityView: {
    title: "Nachhaltigkeit & ESG",
    subtitle: "Überwachen Sie die Umweltauswirkungen von Lieferanten, Zertifizierungen und Lieferkettenrisiken.",
    stats: {
      avgEsgScore: "Durchschnittlicher ESG-Score",
      avgEsgScoreDesc: "Über alle aktiven Lieferanten",
      certifiedSuppliers: "Zertifizierte Lieferanten",
      certifiedSuppliersDesc: "Besitzen gültige ISO/EcoVadis",
      highRisk: "Hochrisiko-Lieferanten",
      highRiskDesc: "Erfordern sofortiges Audit",
      scope3: "Scope-3-Verfolgung",
      scope3Desc: "Emissionen überwacht"
    },
    actions: {
      exportCsv: "Bericht exportieren",
      requestAudit: "Audit anfordern"
    },
    charts: {
      esgDistribution: "ESG-Score-Verteilung",
      riskCategories: "Risikokategorien",
      compliance: "Compliance-Karte"
    },
    table: {
      supplier: "Lieferant",
      esgScore: "ESG-Score",
      emissions: "Emissionen (tCO2e)",
      status: "Status",
      lastAudit: "Letztes Audit",
      compliant: "Konform",
      atRisk: "Gefährdet",
      critical: "Kritisch"
    },
    messages: {
      exported: "Nachhaltigkeitsbericht exportiert"
    }
  },
  docsPage: {
    playbook: "AXIOM PLAYBOOK",
    needExtraHelp: "Brauchen Sie zusätzliche Hilfe?",
    copilotHelpDesc1: "Verwenden Sie ",
    copilotHelpDesc2: "Axiom Copilot",
    copilotHelpDesc3: " für Echtzeit-Antworten in natürlicher Sprache zu Ihren spezifischen Daten.",
    architectedBy: "Entworfen & Entwickelt Von",
    aiExpert: "KI Experte",
    stepByStep: "Schritt-für-Schritt Workflow",
    overviewSummary: "Dieser Abschnitt bietet eine Zusammenfassung Ihrer operativen Metriken auf hoher Ebene. Verwenden Sie die Seitenleiste, um spezifische Workflow-Leitfäden zu erkunden.",
    upNext: "Als Nächstes",
    sections: {
      overview: {
        title: "Plattform Vision",
        content: "Axiom ist eine hochleistungsfähige Beschaffungsintelligenz-Plattform, die entwickelt wurde, um fragmentierte Lieferkettendaten in strategische Vorteile umzuwandeln. Sie bringt Organisationen von reaktivem 'Kaufen' zu proaktivem 'Strategischem Sourcing'.",
        steps: [
            "Sichtbarkeit — Einheitliche Datenschicht eliminiert 'Schattenausgaben', indem jede Transaktion über alle Abteilungen hinweg verfolgt wird.",
            "Intelligenz — Native KI-Integration identifiziert Risikomuster und Kosteneinsparungsmöglichkeiten in Echtzeit.",
            "Rechenschaftspflicht — Jede einzelne Änderung im System ist kryptografisch über den Audit Trail mit einem Benutzer verknüpft.",
            "Effizienz — Automatisierte Nachbestellschleifen und 3-Wege-Abgleich ersetzen manuellen Verwaltungsaufwand.",
            "Strategische Tiefe — Über Transaktionen hinausgehen, um den Lieferantenlebenszyklus, ESG-Compliance und Risiko-Kontrolltürme zu verwalten."
        ]
      },
      techStack: {
        title: "Architektur & Stack",
        content: "Modern, skalierbar und sicher. Axiom basiert auf einer 'Full-Stack TypeScript'-Philosophie für maximale Geschwindigkeit und Typsicherheit.",
        steps: [
            "Frontend — Next.js 14 (App Router) mit React Server Components für nahezu sofortige Seitenladezeiten und optimales SEO.",
            "Styling — Vanilla CSS mit Tailwind-Dienstprogrammen und Framer Motion für hochauflösende, flüssige Benutzererlebnisse.",
            "Datenbank — PostgreSQL mit Drizzle ORM für typsichere, leistungsoptimierte relationale Abfragen und Migrationen.",
            "Statusverwaltung — React Hooks und Server Actions für eine 'Zero-Client-Side-Boilerplate'-Architektur.",
            "Bereitstellung — Containerisierte (Docker) Umgebung, die identisches Verhalten in lokalen, Staging- und Produktionsumgebungen gewährleistet."
        ]
      },
      aiEngine: {
        title: "KI-Intelligenz-Engine",
        content: "Antrieb für den Axiom Copilot und automatisierte Einblicke. Wir verwenden Retrieval-Augmented Generation (RAG), um die KI in Ihrem tatsächlichen Datensnapshot zu verankern.",
        steps: [
            "LLM-Integration — Angetrieben von Google Gemini AI (2.5 Flash) für riesiges Kontextfenster und schnelle Verarbeitung.",
            "RAG-Architektur — Das System injiziert vor der KI-Verarbeitung den Live-DB-Kontext (Ausgaben, Risiken, Teile) in Prompts.",
            "Deterministische Fallbacks — Wenn die KI-API nicht erreichbar ist, halten heuristische Scraper die Kernanalysefunktionen aufrecht.",
            "Abfragen in natürlicher Sprache — 'Axiom Copilot' versteht komplexe Beschaffungsabsichten wie 'Zeige mir Lieferanten mit Risiko > 50'.",
            "Auto-Nachschub-KI — Die prädiktive Bestandsüberwachung löst Anforderungsentwürfe basierend auf dem historischen Verbrauchsverlauf aus."
        ]
      },
      traceability: {
        title: "Audit & Rückverfolgbarkeit",
        content: "In der Beschaffung sind 'Wer' und 'Wann' genauso wichtig wie 'Was'. Axiom führt eine unveränderliche Aufzeichnung jeder Aktion.",
        steps: [
            "Das Aktivitätsprotokoll — Jede Erstellungs-, Aktualisierungs- oder Löschaktion wird automatisch in der Tabelle `audit_logs` aufgezeichnet.",
            "Identitätszuordnung — Protokolleinträge erfassen Benutzer-ID, Aktionstyp, Entitäts-ID (Teil/PO/Lieferant) und eine technische Zusammenfassung.",
            "Unveränderlicher Pfad — Audit-Protokolle sind schreibgeschützt, um sicherzustellen, dass sie eine 'Wahrheitsquelle' für jährliche externe Audits bleiben.",
            "System-Telemetrie — Die Echtzeit-Leistungsüberwachung verfolgt KI-Latenz, Token-Nutzung und den Zustand der Datenbankabfragen.",
            "Datenversionierung — Möglichkeit, eine Rechnung auf die spezifische Anfrage (RFQ) und das Angebot zurückzuverfolgen, das 6 Monate zuvor erstellt wurde."
        ]
      },
      dataModeling: {
        title: "Datenmodellierung & Logik",
        content: "Transparente und robuste Datenstrukturen. Unser Schema ist für relationale Hochleistungsanalysen konzipiert.",
        steps: [
            "Relationaler Kern — Hochgradig normalisiertes Schema, das Benutzer, Lieferanten, Teile und Bestellungen mit strikten Fremdschlüsseln verknüpft.",
            "Enums & Constraints — Standardisierte Status (Aktiv/Gesperrt/Entwurf) gewährleisten die Datenintegrität auf DB-Ebene.",
            "Komplexe Joins — Optimierte Drizzle-Abfragen verarbeiten tiefe Beziehungen wie 'Bestellung -> Lieferant -> Leistungsprotokolle' effizient.",
            "Telemetrie-Streams — Eine dedizierte Tabelle verfolgt Systemereignisse, Metriken und Fehler für Dev-Ops-Sichtbarkeit.",
            "Flexible Dokumentation — Die Dokumententabelle verarbeitet Dokumente unterschiedlichen Typs (Rechnungen, Verträge), die mit beliebigen Entitäten verknüpft sind."
        ]
      },
      foundations: {
        title: "Beschaffungs-Workflows",
        content: "Axiom erzwingt branchenübliche Beschaffungszyklen, um finanzielle Disziplin und rechtliche Compliance zu gewährleisten.",
        diagram: {
            title: "End-to-End Beschaffungsablauf",
            nodes: ["Materialkatalog", "Anforderung", "RFQ (Ausschreibung)", "Bestellung", "Wareneingang", "Rechnungsabgleich", "Zahlung"]
        },
        steps: [
            "1. Materialkatalog — Definition des 'Digitalen Zwillings' für jedes Teil mit SKU, Kategorie und Benchmark-Preisen.",
            "2. Bedarfsgenerierung — Bedarfe werden als Anforderungen eingegeben. Manager genehmigen basierend auf der Live-Sichtbarkeit des Abteilungsbudgets.",
            "3. Wettbewerbsfähiges Sourcing (RFQ) — Multi-Vendor-Bidding (Dreierregel) stellt sicher, dass die Organisation die 'Beste Wahl' trifft.",
            "4. Die Verpflichtung (PO) — Gewinnerangebote werden zu rechtsverbindlichen Bestellungen, die Preis, Vorlaufzeit und Bedingungen festlegen.",
            "5. Lieferkettenausführung — Die Wareneingangsmarkierung (GRN) im Lager löst den nachgelagerten Finanzfluss aus."
        ]
      },
      compliance: {
        title: "Finanzielle Compliance",
        content: "Die 'Schleife' schließen. Die Abgleichs-Engine von Axiom verhindert Überzahlungen, Betrug und Maverick-Ausgaben.",
        diagram: {
            title: "3-Wege-Abgleich-Verifizierung",
            nodes: ["Bestellung", "Wareneingang", "Lieferantenrechnung", "Abgleichs-Engine", "Genehmigt / Umstritten"]
        },
        steps: [
            "Der 3-Wege-Abgleich — Das System markiert automatisch Abweichungen zwischen PO-Preis, GRN-Menge und Rechnungsbetrag.",
            "Konfliktmanagement — Bestellungen mit Nichtübereinstimmung (Status Gelb) werden für Zahlungen gesperrt, bis ein Einkäufer die Daten klärt.",
            "Leistungsbewertung — Lieferanten werden dynamisch nach Liefergenauigkeit (OIF) und Qualitätskonstanz bewertet.",
            "ESG-Validierung — Verfolgung der Nutzung von 'Grüner Energie' und Arbeitsrichtlinien als obligatorische Hürden im Onboarding-Prozess.",
            "Risiko-Kontrollturm — Echtzeitüberwachung von Lieferantenrisiko-Scores basierend auf finanzieller Gesundheit und Lieferhistorie."
        ]
      },
      security: {
        title: "Unternehmenssicherheit",
        content: "Mehrstufige Verteidigung für sensible Finanzdaten. Axiom priorisiert das 'Prinzip der geringsten Privilegien'.",
        steps: [
            "RBAC-Kontrolle — Rollenbasierter Zugriff (Admin/Benutzer/Lieferant) gewährleistet die eingeschränkte Sichtbarkeit von Finanz-PII.",
            "2FA-Durchsetzung — Zwei-Faktor-Authentifizierung über TOTP (Authenticator-Apps) für alle Konten mit hoher Berechtigung.",
            "Sichere Authentifizierung — Basiert auf Auth.js (NextAuth) mit branchenüblichem JWT und datenbankgestützter Sitzungslogik.",
            "Row-Level-Logik — Middleware auf Anwendungsebene verhindert Zugriffsversuche auf Daten anderer Mandanten.",
            "Verschlüsselung im Ruhezustand — Sensible Felder wie 2FA-Geheimnisse und API-Schlüssel werden mit hochgradig entropischer Verschlüsselung gespeichert."
        ]
      },
      connectivity: {
        title: "Globale Konnektivität",
        content: "Axiom ist nicht nur eine lokale App. Sie überbrückt die Lücke zwischen Ihrem Desktop und der globalen Lieferkette.",
        steps: [
            "LocalTunnel Integration — Teilen Sie Ihre lokale Entwicklungsinstanz über sichere Tunnel sofort mit Remote-Stakeholdern.",
            "Electron Framework — Tragbare `.exe` und `.dmg` Builds ermöglichen es Axiom, als native Desktop-Anwendung zu laufen.",
            "Statische Optimierung — Hochleistungsfähige Dokumentbereitstellung und Caching für große Beschaffungskataloge.",
            "Externe API-Unterstützung — Bereit für die Integration mit externen ERPs (SAP/Oracle) über standardmäßige REST-Muster."
        ]
      },
      contactsModule: {
        title: "Kontaktmodul",
        content: "Das Kontaktverzeichnis zentralisiert Lieferanten- und interne Stakeholder-Telefonbuchdaten mit durchsuchbaren Metadaten für Kontinent, Land und Region.",
        steps: [
            "Einheitliches Verzeichnis — Erfassen Sie Name, E-Mail, Telefon, Unternehmen, Position und Notizen in einer einzigen indizierten Tabelle.",
            "Regionales Tagging — Jeder Kontakt kann mit Land, Region, Kontinent und bevorzugter Währung für schnelleres Routing versehen werden.",
            "Aktionierbare Profile — In-App-Nachrichtenthreads und Statusumschalter reduzieren Übergaben zwischen Einkäufern und Category Managern.",
            "Exportierbarkeit — Kontakte können für Governance, Audits und systemübergreifende Synchronisierung als CSV exportiert werden.",
            "Datenhygiene — Aktiv/Inaktiv/Pausiert-Lebenszyklusstatus verhindern, dass veraltete Kontakte die operative Kommunikation verschmutzen."
        ]
      },
      savingsModule: {
        title: "Einsparungsintelligenz",
        content: "Einsparungsintelligenz wandelt Verhandlungsergebnisse in quantifizierte Geschäftsauswirkungen mit transparenten Formeln und Drill-Down-Analysen um.",
        steps: [
            "Basiswerterfassung — Die Plattform speichert `initialQuoteAmount` und `totalAmount` auf Bestellungs-Ebene für faktenbasierte Einsparungsmathematik.",
            "Kernformel — Realisierte Einsparungen = max(0, Summe(Erstes Angebot) - Summe(Endgültige Ausgaben)).",
            "Einsparquote — Einsparquote = Realisierte Einsparungen / Summe(Erstes Angebot), ausgedrückt als Prozentsatz.",
            "Dimensionale Einblicke — Einsparungen können nach Lieferant, Monat und Einsparungstyp (Verhandlung, Volumen, Strategisch) aufgeschlüsselt werden.",
            "Entscheidungsunterstützung — Top-Einsparungsbestellungen und lieferantenbezogene Beiträge zeigen, wo der Beschaffungsaufwand die höchsten Renditen erzielt."
        ]
      },
      transactionsModule: {
        title: "Transaktionszentrum",
        content: "Die Transaktionsseite erstellt ein einziges operatives Hauptbuch für Bestellungen, Wareneingänge, Rechnungen und Mengenverträge.",
        steps: [
            "Einheitlicher Feed — Modulübergreifende Datensätze werden in einer Zeitachse mit sortierbaren Typetiketten normalisiert.",
            "Operatives Filtern — Benutzer können nach Transaktionstyp, Datumsfenstern und Referenzsuchbegriffen filtern.",
            "Finanzielle Sichtbarkeit — Beträge werden dynamisch in INR oder EUR für multinationale Beschaffungsteams gerendert.",
            "Schnellerer Abgleich — Gemeinsame Referenzen reduzieren die Suchzeit bei Untersuchungen zum 3-Wege-Abgleich.",
            "Audit-Bereitschaft — CSV-Exporte bewahren eine punktuelle Aufzeichnung der Transaktionsaktivitäten für Compliance-Zwecke."
        ]
      },
      supportModule: {
        title: "Hilfe & Support",
        content: "Axiom enthält einen integrierten Support-Workflow mit Ticketing und Wissensdatenbank, um Ausfallzeiten und Benutzerreibung zu reduzieren.",
        steps: [
            "Ticket-Lebenszyklus — Einreichen, Verfolgen und Lösen von Anfragen über die Status Offen, In Bearbeitung, Gelöst und Geschlossen.",
            "Prioritäten-Routing — Niedrig/Mittel/Hoch/Kritisch-Priorisierung ermöglicht eine operative Triage.",
            "Support-Posteingang — Benachrichtigungen werden über `pma.axiom.support@gmail.com` für konsistente Kommunikation weitergeleitet.",
            "Wissensdatenbank — FAQ-Prompts decken Login-Wiederherstellung, Importe, Währungslogik und Modulzugriff ab.",
            "Rollen-Governance — Administratoren können alle Tickets überwachen, während Endbenutzer nur auf ihre eigene Anfragehistorie zugreifen."
        ]
      },
      currencyGeo: {
        title: "Währungs- & Regionale Unterstützung",
        content: "Länderübergreifende Beschaffung erfordert eine Lokalisierung nach Geografie und Währung; Axiom wendet dies auf Rechnungen, Kontakte und Analysen an.",
        steps: [
            "Dual-Currency UX — INR/EUR-Umschalter bieten sofortige Vergleichbarkeit für Führungskräfte und operative Mitarbeiter.",
            "Regionale Metadaten — Rechnungen und Kontakte erfassen Land, Region und Kontinent für Risiko-Heatmaps und Planung.",
            "Exportkonsistenz — CSV-Ausgaben enthalten Währung und Geografie, sodass nachgelagerte Teams den Kontext behalten.",
            "Skalierbare Standardisierung — Gemeinsame Dimensionen vereinfachen Rollups über Geschäftseinheiten in Indien und Deutschland hinweg.",
            "Zukünftige Erweiterung — Wechselkurs-Feeds können die feste Konvertierung ersetzen, wenn Treasury-Kontrollen eingeführt werden."
        ]
      },
      devops: {
        title: "Systembetrieb",
        content: "Wartung der Engine. Axiom wurde für Entwicklerfreundlichkeit und operative Stabilität entwickelt.",
        steps: [
            "Docker-Orchestrierung — Der Einzelbefehl `docker-compose up` startet Next.js, Postgres und Adminer.",
            "Next.js Standalone — Optimierte Build-Ausgabe für containerisierte Umgebungen, um die Imagegröße zu minimieren.",
            "Datenbankhygiene — Integrierte Reset-Dienstprogramme ermöglichen es Administratoren, Transaktionsdaten zu löschen, während Konfigurationen beibehalten werden.",
            "Echtzeitprotokolle — Telemetriegesteuerte Fehlerverfolgung bietet tiefe Einblicke in serverseitige Fehler.",
            "CI/CD Bereit — Integriertes Linting und Typprüfung stellen sicher, dass die Codequalität während der iterativen Entwicklung hoch bleibt."
        ]
      },
      sourcingWorkflow: {
        title: "Workflow für Sourcing-Anfragen",
        content: "Eine Sourcing-Anfrage (RFQ) ist der formelle Prozess zur Einholung von wettbewerbsfähigen Angeboten von qualifizierten Lieferanten, bevor ein Kauf zugesagt wird. Axiom führt Sie durch jeden Schritt.",
        diagram: {
            title: "Ablauf von der Anfrage zur Bestellung",
            nodes: ["Anfrage erstellen", "Lieferanten einladen", "Angebote sammeln", "Vergleichen & Bewerten", "Auftrag erteilen", "PO generieren"]
        },
        steps: [
            "Neue Sourcing-Anfrage erstellen — Navigieren Sie zu Sourcing → RFQs → Neue RFQ. Geben Sie Teil/SKU, benötigte Menge, Zieldatum für die Lieferung und angehängte Spezifikationen ein.",
            "Lieferanteneinladung — Fügen Sie der RFQ einen oder mehrere Lieferanten hinzu. Jeder Lieferant erhält eine Einladung über seine registrierte E-Mail und kann über das Lieferantenportal antworten.",
            "Angebotssammlung — Lieferanten reichen ihren Stückpreis, ihre Vorlaufzeit und ihre Gültigkeitsdauer ein. Alle Angebote werden gegen die ursprüngliche RFQ für einen vollständigen Audit-Trail verfolgt.",
            "Angebotsvergleich — Verwenden Sie die integrierte Vergleichsansicht, um Lieferanten nach Preis, Vorlaufzeit und historischem Leistungs-Score zu ordnen.",
            "Vergabeentscheidung — Wählen Sie das Gewinnerangebot aus, um automatisch eine verknüpfte Bestellung (PO) zu generieren. Die abgelehnten Lieferanten erhalten Benachrichtigungen.",
            "PO-Lebenszyklus — Die Bestellung durchläuft: Entwurf → Ausstehende Genehmigung → Genehmigt → An Lieferanten gesendet → Erfüllt (nach Wareneingang) → Geschlossen."
        ]
      },
      requisitionsWorkflow: {
        title: "Interne Anforderungen",
        content: "Interne Anforderungen ermöglichen es jedem autorisierten Benutzer, Materialien oder Dienstleistungen anzufordern. Sie durchlaufen einen Genehmigungs-Workflow, bevor sie zu einer Bestellung werden.",
        diagram: {
            title: "Genehmigungsablauf für Anforderungen",
            nodes: ["Anforderung einreichen", "Ausstehende Genehmigung", "Admin-Prüfung", "Genehmigt", "In PO umwandeln", "Lieferant erfüllt"]
        },
        steps: [
            "Anforderung einreichen — Gehen Sie zu Beschaffung → Anforderungen → Neue Anforderung. Wählen Sie Teil/SKU, Menge, Dringlichkeit und die anfordernde Abteilung.",
            "Auto-Budgetprüfung — Das System validiert die Anfrage gegen das zugewiesene Budget der Abteilung.",
            "Manager-Genehmigung — Anforderungen über einem Schwellenwert erfordern eine Genehmigung auf Managerebene. Benachrichtigungen gehen automatisch an Abteilungsleiter.",
            "PO-Umwandlung — Nach der Genehmigung kann die Beschaffung die Anforderung mit einem Klick in eine Bestellung umwandeln, wobei alle Positionen vorausgefüllt werden.",
            "Statusverfolgung — Anforderer können den Genehmigungsstatus in Echtzeit verfolgen: Entwurf → Eingereicht → In Prüfung → Genehmigt/Abgelehnt → In Bestellung umgewandelt.",
            "Bearbeitung von Ablehnungen — Abgelehnte Anforderungen werden mit Begründung an den Anforderer zurückgesandt, sodass sie korrigiert neu eingereicht werden können."
        ]
      },
      invoiceWorkflow: {
        title: "Rechnungsmanagement & 3-Wege-Abgleich",
        content: "Das Rechnungsmanagement in Axiom erzwingt einen 3-Wege-Abgleich, um betrügerische oder fehlerhafte Zahlungen zu verhindern. Jede Rechnung muss mit der Bestellung und dem Wareneingang übereinstimmen.",
        diagram: {
            title: "Lebenszyklus der Rechnung",
            nodes: ["Rechnung erhalten", "Ausstehende Prüfung", "3-Wege-Abgleich", "Abgeglichen ✓", "Zahlung freigegeben"]
        },
        steps: [
            "Rechnungseingang — Lieferanten reichen Rechnungen über das Lieferantenportal ein, oder Beschaffungsmitarbeiter protokollieren sie manuell unter Beschaffung → Rechnungsdatensätze.",
            "Währungsintegrität — Jede Rechnung behält ihre ursprüngliche Währung (INR, EUR, USD usw.) bei. Axiom konvertiert Beträge niemals automatisch — was in Rechnung gestellt wurde, wird angezeigt.",
            "3-Wege-Abgleich — Ein Admin navigiert zu Admin → Finanzabgleich. Bei jeder ausstehenden Rechnung wird Folgendes überprüft: (1) Lieferant stimmt mit Bestellung überein, (2) Mengen stimmen mit WE überein, (3) Betrag stimmt mit vereinbartem Preis überein.",
            "Abgleichsergebnis — Klicken Sie auf 'Abgleichen', um zu genehmigen (Status → Abgeglichen), oder auf 'Anfechten', um die Klärung durch den Lieferanten zu verlangen (Status → Angefochten).",
            "Zahlungsfreigabe — Nur abgeglichene Rechnungen können auf 'Bezahlt' gesetzt werden. Angefochtene Rechnungen sind gesperrt, bis der Lieferant antwortet und der Admin das Problem behebt.",
            "Audit-Vollständigkeit — Jede Statusänderung (Ausstehend → Abgeglichen → Bezahlt) wird im Audit-Trail mit Benutzer-ID, Zeitstempel und Rechnungsreferenz protokolliert."
        ]
      },
      processReorders: {
        title: "Nachbestellungen verarbeiten (Teileintelligenz)",
        content: "Die Aktion 'Nachbestellungen verarbeiten' unter Teileintelligenz löst den automatisierten Nachschub-Workflow für kritische und geringe Bestands-SKUs aus.",
        steps: [
            "Bestandsüberwachung — Axiom vergleicht kontinuierlich aktuelle Lagerbestände mit dem Mindestbestand und den Nachbestellpunktschwellen.",
            "Warnungsklassifizierung — Teile unter dem Nachbestellpunkt haben 'Geringen Bestand'; Teile unter dem Mindestbestand sind 'Kritisch' (rot markiert).",
            "Nachbestellungen verarbeiten klicken — Ein Klick auf 'Nachbestellungen verarbeiten' bei einem kritischen Teil öffnet eine vorausgefüllte Anforderung mit der empfohlenen Bestellmenge (bis zum maximalen Lagerbestand).",
            "Auto-Zuweisung — Das System schlägt den Lieferanten mit der besten Leistungsbewertung und dem zuletzt angebotenen Preis für die SKU vor.",
            "Schnellgenehmigung — Nachbestellanforderungen, die über der kritischen Schwelle liegen, können durch Admin-Richtlinien für eine verzögerungsfreie Beschaffung automatisch genehmigt werden.",
            "Nachschleife — Sobald die Bestellung erfüllt ist und die Waren eingegangen sind, werden die Lagerbestände automatisch aktualisiert und die Warnungen gelöscht."
        ]
      },
      supplierData: {
        title: "Lieferantendaten: Stufe, ESG, Finanzen, Compliance",
        content: "Lieferanten-Scorecards in Axiom werden dynamisch aus Transaktionshistorie, Leistungsprotokollen und Compliance-Ereignissen berechnet — nicht durch manuelle Eingabe.",
        steps: [
            "Stufenklassifizierung — Tier 1 (Strategisch), Tier 2 (Bevorzugt), Tier 3 (Transaktional). Von Beschaffungsmanagern basierend auf Ausgabenvolumen und Beziehungstiefe aktualisiert.",
            "Finanzielle Gesundheitsbewertung — Berechnet aus: pünktlicher Zahlungsrate, Rechnungskonfliktrate, Auftragserfüllungsrate und externen Kreditsignalen (manuell eingegeben oder über API).",
            "ESG-Score — Index für Umwelt, Soziales und Governance. Aktualisiert über Leistungsprotokolleinträge, die als ESG-Ereignisse markiert sind (z. B. 'ISO 14001 Audit bestanden', 'CSR-Bericht eingereicht').",
            "Compliance-Status — Verfolgt Ablaufdaten von Zertifizierungen (ISO, SOC2, DSGVO, lokale Vorschriften). Der Admin kann Compliance-Meilensteine über die Lieferantenleistungsprotokolle protokollieren.",
            "Automatisierte Verschlechterung — Wiederholte Konflikte, verspätete Lieferungen oder nicht bestandene Qualitätsprüfungen senken den Leistungsscore nach und nach automatisch.",
            "Manuelle Überschreibungen — Der Admin kann Scores direkt festlegen, wenn externe Auditberichte verbindliche Daten liefern, die nicht in den Transaktionsprotokollen erfasst sind."
        ]
      },
      riskIntelligence: {
        title: "Risiko-Intelligenz",
        content: "Risiko-Intelligenz bietet eine Echtzeit-Sicht auf Schwachstellen in der Lieferkette in geopolitischen, finanziellen und operativen Dimensionen.",
        steps: [
            "Risiko-Score-Berechnung — Der Risiko-Score jedes Lieferanten (0–100) wird abgeleitet aus: finanzieller Gesundheit, ESG-Leistung, Lieferzuverlässigkeit, Compliance-Status und geografischem Risiko.",
            "Geografische Risikokarte — Länder sind farbcodiert: Grün = Lieferanten mit geringem Risiko (<45), Gelb = moderat (45–70), Rot = hohes Risiko (>70). Nur Länder mit tatsächlichen Lieferanten werden hervorgehoben.",
            "Risikokategorien — Operatives Risiko (Lieferausfälle), Finanzielles Risiko (niedriger Gesundheits-Score), ESG-Risiko (Non-Compliance), Geopolitisches Risiko (Länderrisikoindex).",
            "Interventionsaktionen — Für jeden Hochrisikolieferanten kann der Admin: eine Sourcing-Anfrage öffnen, um eine Dual-Source aufzubauen, ein Leistungsprotokoll hinzufügen oder den Lieferanten auf die Watchlist setzen.",
            "Watchlist & Warnungen — Lieferanten, die Risikoschwellenwerte überschreiten, generieren automatisch Warnungen, die im Panel für Risikointelligenz und im Benachrichtigungscenter sichtbar sind.",
            "Zuverlässigkeit der Scores — Risiko-Scores sind so zuverlässig wie die eingegebenen Daten. Das aktuelle Halten von Leistungsprotokollen, QS-Datensätzen und Compliance-Daten verbessert die Genauigkeit direkt."
        ]
      },
      aiAgents: {
        title: "KI-Agenten",
        content: "Die KI-Agenten von Axiom sind belastbare, kontextbewusste autonome Mitarbeiter, die Ihre Live-Beschaffungsdaten analysieren und verwertbare Erkenntnisse liefern.",
        steps: [
            "Ausfallsicheres Design — Jeder Agent hat einen deterministischen Fallback-Pfad: Wenn die Gemini API nicht verfügbar ist oder einen Fehler zurückgibt, berechnen heuristische Algorithmen die gleiche Ausgabe unter Verwendung einer regelbasierten Logik.",
            "Kontext-Injektion — Vor jedem Agentenlauf injiziert das System einen Snapshot der relevanten Datenbankdatensätze (Lieferanten, Bestellungen, Ausgaben, Risiko) in den Prompt, um fundierte Antworten zu erhalten.",
            "Verfügbare Agenten — (1) Ausgabenoptimierer: findet Kostensenkungsmöglichkeiten, (2) Risikodetektor: deckt neue Lieferantenrisiken auf, (3) Bedarfsplaner: prognostiziert Nachbestelldaten.",
            "Agenten-Ausführungsprotokoll — Jeder Agentenlauf wird in `agent_executions` mit Dauer, Erfolgsstatus und Ausgabezusammenfassung zur vollständigen Rückverfolgbarkeit aufgezeichnet.",
            "Manueller Auslöser vs. Auto — Agenten können vom Admin manuell ausgelöst oder über das Admin → Agenten-Panel so eingestellt werden, dass sie nach einem Zeitplan (täglich/wöchentlich) ausgeführt werden.",
            "Ausgabeaktionen — Agentenerkenntnisse werden als Benachrichtigungen angezeigt und, wo anwendbar, Anforderungsentwürfe oder Risikowarnungen zur Admin-Prüfung automatisch erstellt."
        ]
      },
      accountManagement: {
        title: "Kontoverwaltung & Rollen",
        content: "Axiom verwendet ein rollenbasiertes Zugriffskontrollsystem (RBAC). Die Kontoerstellung liegt ausschließlich in der Verantwortung des Administrators.",
        steps: [
            "Admin-Rolle — Voller Zugriff: kann alle Module sehen, erstellen, bearbeiten und löschen. Kann Benutzer verwalten, Einstellungen konfigurieren, den Finanzabgleich ausführen und Daten bereinigen.",
            "Benutzer-Rolle — Operativer Zugriff: kann alle Abschnitte anzeigen und tägliche Aktionen ausführen (Bestellungen erstellen, Wareneingänge protokollieren, Tickets einreichen). Hat keinen Zugriff auf Admin-Einstellungen, Benutzerverwaltung oder Finanzabgleich.",
            "Lieferanten-Rolle — Zugriff nur auf das Portal: kann seine RFQs einsehen, Angebote abgeben, Rechnungen hochladen und Bestellungen verfolgen. Hat keinen Zugriff auf interne Beschaffungsdaten.",
            "Kontoerstellung — Nur der Admin kann Benutzerkonten über Admin → Benutzerverwaltung erstellen. Die Selbstregistrierung ist aus Sicherheitsgründen deaktiviert.",
            "Passwortrichtlinie — Alle Passwörter sind bcrypt-gehasht (12 Runden). Benutzer können Passwörter über Admin-Einstellungen → Sicherheit ändern. Admins können Benutzerpasswörter zurücksetzen.",
            "2FA-Durchsetzung — Für alle Anmeldungen ist eine Zwei-Faktor-Authentifizierung (TOTP-basiert) erforderlich. Admins aktivieren/verwalten den 2FA-Status über Admin-Einstellungen → Sicherheit."
        ]
      }
    }
  },
  supportPage: {
    title: "Hilfe & Support",
    subtitle: "Durchsuchen Sie allgemeine Anleitungen und Support-Kontakte in einem gemeinsamen Help-Center.",
    supportGuide: "Support-Leitfaden",
    supportGuideDesc: "Häufig gestellte Fragen bleiben für jeden verfügbar, während die Ticketverwaltung auf Administratoren beschränkt ist.",
    needAdditionalHelp: "Benötigen Sie zusätzliche Hilfe?",
    needAdditionalHelpDesc: "Verwenden Sie diese Seite, um zuerst Produktanleitungen zu finden. Wenn Ihre Frage noch offen ist, kontaktieren Sie Ihren Administrator oder nutzen Sie den oben angezeigten Support-Posteingang für Rückfragen.",
    ticketAccess: "Ticket-Zugang",
    ticketAccessDescAdmin: "Support-Tickets und Ticketübersichtsdaten sind nur in der Admin-Supportkonsole sichtbar. Sie können sie direkt über die obige Schaltfläche öffnen.",
    ticketAccessDescUser: "Support-Tickets und Ticketübersichtsdaten sind nur in der Admin-Supportkonsole sichtbar. Nicht-Admin-Benutzer können diese Seite weiterhin als gemeinsamen Wissensleitfaden verwenden.",
    faqTitle: "Häufig gestellte Fragen",
    faqDesc: "Schnelle Antworten auf die häufigsten Fragen.",
    supportTicketConsole: "Support-Ticket Konsole",
    faqs: {
      password: {
        q: "Wie setze ich ein verlorenes Passwort zurück?",
        a: "Wenn Sie sich nicht anmelden können, wenden Sie sich an Ihren Systemadministrator. Axiom unterstützt aus Sicherheitsgründen keine Self-Service-Passwort-Rücksetzungen. Administratoren können Passwörter über das Bedienfeld 'Benutzerverwaltung' zurücksetzen."
      },
      imports: {
        q: "Warum ist mein CSV-Datenimport fehlgeschlagen?",
        a: "Importe schlagen fehl, wenn sie nicht dem erforderlichen Spaltenformat entsprechen oder wenn sie die referenzielle Integrität verletzen (z. B. wenn versucht wird, eine Bestellung für eine nicht existierende Lieferanten-ID zu importieren). Verwenden Sie immer die genauen Header aus den Beispieldateien und stellen Sie sicher, dass übergeordnete Datensätze vorhanden sind."
      },
      currency: {
        q: "Warum zeigen einige Berichte andere Währungssymbole an als die von mir eingegebenen?",
        a: "Axiom behält ursprüngliche Transaktionswährungen (wie EUR oder GBP) bei, wandelt sie jedoch dynamisch unter Verwendung der Basiswechselkurse um, wenn aggregierte Dashboards wie Ausgabenanalysen angezeigt werden, um einen Äpfel-mit-Äpfeln-Vergleich sicherzustellen."
      },
      portal: {
        q: "Wie greifen Lieferanten auf das Portal zu?",
        a: "Lieferanten erhalten eine automatische E-Mail-Einladung, wenn sie zu einer RFQ hinzugefügt werden oder wenn manuell ein Konto für sie erstellt wird. Sie melden sich unter derselben URL wie interne Benutzer an, aber RBAC stellt sicher, dass sie nur das Lieferantenportal sehen."
      },
      adminOnly: {
        q: "Warum kann ich die Felder für Admin-Einstellungen oder Finanzabgleich nicht sehen?",
        a: "Der Zugriff auf Systemkonfiguration, Benutzerverwaltung und kritische finanzielle Abgleichs-Workflows ist auf Benutzer mit der Rolle 'admin' beschränkt. Wenn Sie Zugriff auf diese Funktionen benötigen, fordern Sie bitte ein Rollen-Upgrade bei Ihrem Administrator an."
      },
      matching: {
        q: "Was bedeutet der Status 'Gelb' im Finanzabgleich?",
        a: "Gelb zeigt eine Diskrepanz zwischen der Bestellung, dem Wareneingang und der Lieferantenrechnung an (z. B. weichen Mengen oder Preise ab). Diese Rechnungen sind für die Zahlungsfreigabe gesperrt, bis ein Admin das Problem behebt."
      },
      telemetry: {
        q: "Welche Informationen werden im Audit-Trail protokolliert?",
        a: "Jede Erstellungs-, Aktualisierungs- und Löschaktion wird mit Benutzer-ID, Zeitstempel, betroffener Entität und Aktionstyp aufgezeichnet. Diese Protokolle sind unveränderlich und wurden entwickelt, um externe Compliance-Audits zu unterstützen."
      }
    }
  },
  adminFraudAlertsPage: {
    title: "Betrugserkennung Warnungen",
    subtitle: "KI-erkannte Anomalien, die untersucht werden müssen",
    critical: "Kritisch",
    high: "Hoch",
    total: "Gesamt",
    allClear: "Alles in Ordnung!",
    allClearDesc: "Keine Betrugswarnungen erkannt. Ihre Transaktionen sehen gesund aus.",
    indicators: "Indikatoren",
    suggestedAction: "Vorgeschlagene Maßnahme",
    recently: "Kürzlich",
    alertTypes: {
      duplicate_invoice: "Doppelte Rechnung",
      zero_value_order: "Bestellung mit Nullwert",
      unusual_amount: "Ungewöhnlicher Betrag",
      new_vendor_high_value: "Neuer Anbieter mit hohem Wert",
      round_number_pattern: "Runde-Zahlen-Muster",
      segregation_violation: "Verletzung der Funktionstrennung"
    }
  },
  adminTelemetryPage: {
    title: "Systemintelligenz & Telemetrie",
    subtitle: "Tiefgreifende Überwachung von KI-Leistung, API-Latenzen und technischem Zustand.",
    technicalErrors: "Technische Fehler",
    technicalErrorsDesc: "Protokolliert in den letzten 30 Tagen",
    avgAiLatency: "Durchschn. KI-Latenz",
    avgAiLatencyDesc: "End-to-End Antwortzeit",
    totalDataPoints: "Gesamte Datenpunkte",
    totalDataPointsDesc: "Aktive Instrumentierungsabdeckung",
    systemLoad: "Systemlast",
    stable: "Stabil",
    systemLoadDesc: "Metriken zum operativen Zustand",
    recentTelemetry: "Aktueller Telemetriestrom",
    recentTelemetryDesc: "Echtzeit-technische Protokolle und Leistungsereignisse.",
    table: {
      type: "Typ",
      scopeKey: "Gültigkeitsbereich / Schlüssel",
      value: "Wert",
      user: "Benutzer",
      time: "Zeit",
      na: "N/A",
      noData: "Noch keine Telemetriedaten verfügbar."
    }
  },
  adminFinancialMatchingPage: {
    title: "Finanzieller Abgleich",
    subtitle: "Admin-Konsole - Führen Sie eine deterministische 3-Wege-Prüfung zwischen PO, Eingang und Rechnung vor jeder Freigabe durch.",
    exceptions: "Ausnahmen",
    invoiceRecords: "Rechnungsdatensätze",
    refresh: "Aktualisieren",
    awaitingReview: "Ausstehende Prüfung",
    awaitingReviewDesc: "Rechnungen, die auf den 3-Wege-Abgleich warten",
    matchedPaid: "Abgeglichen / Bezahlt",
    matchedPaidDesc: "3-Wege-Abgleich verifiziert",
    disputed: "Umstritten",
    disputedDesc: "Erfordert Klärung",
    manualReviewQueue: "Warteschlange für manuelle Prüfung",
    manualReviewQueueDesc: "Blockiert, bis ein Mensch unterzeichnet",
    totalInvoices: "Gesamte Rechnungen",
    totalInvoicesDesc: "Im aktuellen Filter",
    dualApprovalQueue: "Warteschlange für duale Genehmigungsübersteuerung",
    dualApprovalQueueDesc: "Ein Anforderer kann seine eigene Finanzüberschreibung nicht genehmigen. Halte- und Zahlungsstornierungen erfordern einen zweiten Genehmiger, bevor sich der Rechnungsstatus ändern kann.",
    noOverrides: "Es warten keine Rechnungsüberschreibungen auf einen zweiten Genehmiger.",
    invoice: "Rechnung",
    requestedBy: "Angefordert von",
    approve: "Genehmigen",
    reject: "Ablehnen",
    requestTypes: {
      place_hold: "Sperre verhängen",
      clear_hold: "Sperre aufheben",
      payment_reversal: "Zahlungsrückbuchung"
    },
    all: "Alle",
    pending: "Ausstehend",
    matched: "Abgeglichen",
    paid: "Bezahlt",
    searchPlaceholder: "Rechnungs-Nr. suchen...",
    loading: "Wird geladen...",
    invoiceMatchingQueue: "Warteschlange für Rechnungsabgleich",
    invoiceMatchingQueueDesc: "{count} Rechnung(en). Führen Sie Regeln aus, bevor Sie Statusaktualisierungen vornehmen, streiten Sie Ausnahmen ab und markieren Sie eine Rechnung erst nach einem sauberen Abgleich als bezahlt.",
    table: {
      invoiceNum: "Rechnungsnr.",
      supplier: "Lieferant",
      amount: "Betrag",
      status: "Status",
      confidence: "Vertrauen",
      date: "Datum",
      controlActions: "Kontrollaktionen",
      na: "N/A",
      noBlockers: "Keine offenen Überprüfungsblocker.",
      runRules: "Regeln ausführen",
      dispute: "Anfechten",
      escalate: "Eskalieren",
      holdActive: "Halt aktiv",
      locked: "Gesperrt",
      approvalPending: "Genehmigung ausstehend",
      requestHoldRelease: "Aufhebung des Halts anfordern",
      requestHold: "Halt anfordern",
      markPaid: "Als bezahlt markieren",
      reversed: "Storniert",
      archived: "Archiviert",
      requestReversal: "Stornierung anfordern",
      noInvoicesTitle: "Keine Rechnungen entsprechen den aktuellen Filtern.",
      noInvoicesDesc: "Der Finanzabgleich verarbeitet nur Lieferantenrechnungen. Wareneingänge schalten die Überprüfung des 3-Wege-Abgleichs frei, sie erscheinen jedoch erst in dieser Warteschlange, wenn eine Rechnung für die Bestellung erfasst wurde.",
      openInvoiceRecords: "Rechnungsdatensätze öffnen",
      reviewSourceOrders: "Quellbestellungen überprüfen"
    },
    howItWorks: {
      title: "Wie der 3-Wege-Abgleich funktioniert",
      po: "1. Bestellung (PO)",
      poDesc: "Überprüfen Sie, ob Lieferant, Artikel und Mengen der Rechnung mit der ursprünglich in Axiom genehmigten Bestellung übereinstimmen.",
      gr: "2. Wareneingang",
      grDesc: "Bestätigen Sie, dass die physischen Waren vom Lager erfasst wurden und alle QA/QC-Prüfpunkte bestanden haben.",
      inv: "3. Rechnung & Mathematik",
      invDesc: "Validieren Sie, dass die Gesamtsummen der Lieferantenrechnung mathematisch mit der Bestellung und der erhaltenen Ware übereinstimmen."
    },
    dialogs: {
      recordOverride: "Überschreibungsgrund erfassen",
      recordOverrideDesc: "Geben Sie den Grund für {action} für diese Rechnung ein. Dies wird im Prüfprotokoll protokolliert.",
      reasonLabel: "Grund",
      reasonPlaceholder: "Beschreiben Sie die geschäftliche Begründung...",
      cancel: "Abbrechen",
      submitRequest: "Anfrage einreichen",
      notes: "Notizen",
      notesPlaceholder: "Entscheidungsnotizen...",
      reversalRef: "Stornierungsreferenz / Journal-ID",
      reversalRefPlaceholder: "z.B. JV-2024-001",
      submitDecision: "Entscheidung einreichen",
      approveTitle: "Überschreibungsanfrage genehmigen",
      rejectTitle: "Überschreibungsanfrage ablehnen",
      approveDesc: "Geben Sie eine Notiz für diese Genehmigung an. Sie wird im Audit-Trail aufgezeichnet.",
      rejectDesc: "Geben Sie einen Grund für diese Ablehnung an."
    },
    toasts: {
      runMatchFailed: "Fehler beim Ausführen des deterministischen Abgleichs",
      matchPassed: "Deterministischer Abgleich erfolgreich",
      matchPassedDesc: "Bestellung, Wareneingang, Qualitätskontrolle und Rechnungsbelege stimmen jetzt überein.",
      matchBlocked: "Rechnung bleibt blockiert",
      matchBlockedDesc: "Die Regel-Engine hat diese Rechnung in der Prüfung belassen.",
      disputeFailed: "Fehler beim Verschieben der Rechnung in den Konfliktstatus",
      disputed: "Rechnung als umstritten markiert - Lieferant wird benachrichtigt",
      markPaidFailed: "Fehler beim Markieren der Rechnung als bezahlt",
      markedPaid: "Rechnung als bezahlt markiert",
      escalateFailed: "Fehler bei der Weiterleitung der Rechnung zur manuellen Prüfung",
      reviewRefreshed: "Prüfungsaufgabe aktualisiert",
      reviewRefreshedDesc: "Eine bestehende Rechnungsprüfungsaufgabe wurde in der Warteschlange wieder geöffnet.",
      escalated: "Zur Prüfung eskaliert",
      escalatedDesc: "Eine manuelle Validierungsaufgabe blockiert nun die Statusänderung, bis die Prüfungsaufgabe abgeschlossen ist.",
      updateFailed: "Fehler beim Aktualisieren der Rechnung",
      overrideRequestFailed: "Fehler bei der Weiterleitung der Überschreibungsanfrage",
      dualApprovalSubmitted: "Anfrage zur doppelten Genehmigung eingereicht",
      dualApprovalSubmittedDesc: "Ein zweiter Finanzgenehmiger muss diese Anfrage nun genehmigen oder ablehnen.",
      reviewOverrideFailed: "Fehler bei der Prüfung der Überschreibungsanfrage",
      dualApprovalRecorded: "Doppelte Genehmigung aufgezeichnet",
      overrideRejected: "Überschreibungsanfrage abgelehnt"
    }
  },
  invoiceReviewDialog: {
    reviewOriginal: "Original überprüfen",
    title: "Rechnungsprüfung für",
    desc: "Die Side-by-Side-Überprüfung hält das Quelldokument vor der finanziellen Freigabe, der Beilegung von Streitigkeiten oder der Zahlungsgenehmigung sichtbar.",
    confidence: "Vertrauen",
    supplier: "Lieferant",
    unknownSupplier: "Unbekannter Lieferant",
    invoiceAmount: "Rechnungsbetrag",
    country: "Land",
    region: "Region",
    unspecified: "Nicht spezifiziert",
    recordedAt: "Erfasst am",
    unknown: "Unbekannt",
    reviewPosture: "Überprüfungshaltung",
    fraudAlerts: "Betrugswarnungen",
    humanTasks: "Menschliche Aufgaben",
    currentSignals: "Aktuelle Überprüfungssignale",
    noBlockers: "An diese Rechnung sind derzeit keine aktiven Überprüfungsblocker angehängt.",
    lineItems: "Positionen",
    line: "Zeile",
    qty: "Menge",
    unit: "Einheit",
    total: "Gesamt",
    noStructuredItems: "Strukturierte Positionsdaten sind dieser Rechnung noch nicht beigefügt.",
    originalDocument: "Originaldokument",
    originalDocumentDesc: "Überprüfen Sie immer die Quelle, bevor Sie Zahlungen freigeben oder einen Streitfall beilegen.",
    openRawFile: "Rohe Datei öffnen",
    noDocument: "Es ist noch kein Originaldokument angehängt. Laden Sie die Quelldatei des Lieferanten hoch oder verlinken Sie sie, bevor Sie diese Rechnung für nachgelagerte Freigabeentscheidungen verwenden."
  },
  adminRiskPage: {
    title: "Risiko- & Compliance-Intelligenz",
    subtitle: "Echtzeit-Überwachung von ESG, finanziellen und operativen Lieferkettenrisiken.",
    criticalRisks: "Kritische Risiken",
    requiringAttention: "Erfordert sofortige Aufmerksamkeit",
    networkHealth: "Netzwerk-Gesundheitsbewertung",
    stable: "Stabil",
    avgEsg: "Durchschn. ESG-Leistung",
    portfolioTarget: "Portfolio ESG-Ziel: 75+",
    complianceRate: "Compliance-Rate",
    avgPortfolioScore: "Durchschn. Portfolio ESG-Score",
    esgTracking: "ESG-Tracking (Nachhaltigkeit)",
    esgTrackingDesc: "Überwachung von Umwelt- und sozialen Wirkungsbewertungen.",
    activeMonitoring: "Aktive Überwachung",
    allSuppliersMeetEsg: "Alle Lieferanten erfüllen die ESG-Benchmarks.",
    financialWatchlist: "Finanzielle Gesundheitsüberwachungsliste",
    financialWatchlistDesc: "Live-Kreditüberwachung und Liquiditätsrisikobewertung.",
    creditActive: "Kredit Aktiv",
    financialHealth: "Finanzielle Gesundheit:",
    exceptional: "Außergewöhnlich",
    strong: "Stark",
    fair: "Ausreichend",
    distressed: "Notleidend",
    score: "Punktzahl:",
    liquidity: "Liquidität:",
    volatile: "Flüchtig",
    aiRiskIntelligence: "KI-gesteuerte Risiko-Intelligenz",
    activeAnalysis: "Aktive Analyse",
    noCriticalRisk: "Keine kritischen Risikostörungen im aktiven Lieferantennetzwerk erkannt.",
    strategicInsight: "Strategischer Einblick",
    portfolioDiversification: "Portfolio-Diversifizierung",
    portfolioDiversificationDesc: "Axiom hat {count} Lieferanten in Hochrisikozonen erkannt. Empfehlung: Prüfen Sie alternative Beschaffungsoptionen.",
    exploreSourcing: "Beschaffung erkunden",
    environmentalCompliance: "Überprüfung der Umwelteinhaltung aktiv."
  },
  telemetry: {
    values: {
      error: "Fehler",
      event: "Ereignis",
      metric: "Metrik",

      Security: "Sicherheit",
      ClientErrorBoundary: "Client-Fehlergrenze",
      Sourcing: "Beschaffung",
      OrderManagement: "Auftragsverwaltung",
      SpendAnalysis: "Ausgabenanalyse",
      AxiomCopilot: "Axiom Copilot",
      SupplierManagement: "Lieferantenmanagement",
      FinancialCompliance: "Finanzielle Compliance",
      AgentOrchestrator: "Agenten-Orchestrator",
      AgentExecution: "Agenten-Ausführung",
      AgentRecommendation: "Agenten-Empfehlung",
      RecommendationReview: "Empfehlungsprüfung",

      root: "Wurzel",
      Login_Success: "Anmeldung erfolgreich",
      login_success: "Anmeldung erfolgreich",
      login_failed_user_not_found: "Anmeldung fehlgeschlagen (Benutzer nicht gefunden)",
      login_failed_supplier_portal_locked: "Anmeldung fehlgeschlagen (Lieferantenportal gesperrt)",
      login_failed_invalid_2fa: "Anmeldung fehlgeschlagen (Ungültige 2FA)",
      login_failed_wrong_password: "Anmeldung fehlgeschlagen (Falsches Passwort)",
      oauth_blocked_2fa_enabled: "OAuth blockiert (2FA erforderlich)",

      rfq_conversion_value: "RFQ-Konvertierungswert",
      rfq_conversion_competitive_savings: "RFQ-Konvertierung Wettbewerbseinsparungen",
      rfq_conversion_should_cost_savings: "RFQ-Konvertierung Soll-Kosten-Einsparungen",
      rfq_converted_successfully: "RFQ erfolgreich konvertiert",
      rfq_conversion_failed: "RFQ-Konvertierung fehlgeschlagen",

      validateThreeWayMatch: "Drei-Wege-Abgleich validieren",
      three_way_match_success: "Drei-Wege-Abgleich erfolgreich",
      three_way_match_pending: "Drei-Wege-Abgleich ausstehend",
      match_validation_error: "Fehler bei der Abgleichsvalidierung",

      analyzeSpend: "Ausgaben analysieren",
      potential_savings: "Potenzielle Einsparungen",

      processQuery: "Abfrage verarbeiten",
      meta_answer: "Meta-Antwort",
      invoice_lookup: "Rechnungssuche",
      workspace_answer: "Arbeitsbereich-Antwort",
      knowledge_answer: "Wissens-Antwort",
      fallback_answer: "Fallback-Antwort",
      function_call_success: "Funktionsaufruf erfolgreich",
      query_success: "Abfrage erfolgreich",
      query_failed: "Abfrage fehlgeschlagen",
      document_function_call: "Dokument-Funktionsaufruf",
      document_parsed: "Dokument geparst",
      document_parse_failed: "Dokument parsen fehlgeschlagen",

      abc_analysis_completed: "ABC-Analyse abgeschlossen",
      abc_analysis_failed: "ABC-Analyse fehlgeschlagen",

      unknown_route: "Unbekannte Route",
    }
  },
  adminTasksPage: {
    title: "Aufgaben-Posteingang",
    subtitle: "Workflow-Aufgaben, Zuweisungen, Eskalationen und SLA-Verfolgung über Beschaffungsobjekte hinweg.",
    queueSafeView: "Die warteschlangensichere Ansicht lädt zuerst die Zusammenfassungszählungen und dann die neuesten 200 Aufgaben, damit hoher Administratorverkehr kein vollständiges Tabellen-Rendering erzwingt.",
    openTasks: "Offene Aufgaben",
    inProgress: "In Bearbeitung",
    overdue: "Überfällig",
    completed: "Abgeschlossen",
    loadWindow: "Ladefenster",
    loadWindowDesc: "Neueste 200 Aufgaben pro Anfrage",
    hotPath: "Hot Path",
    hotPathDesc: "Sortierung nach Priorität + Fälligkeitsdatum bleibt serverseitig",
    opNote: "Betriebshinweis",
    opNoteDesc: "Verwenden Sie die Zusammenfassungszählungen für die allgemeine Backlog-Gesundheit, nicht die rohe Listenlänge.",
    allTasks: "Alle Aufgaben",
    noTasks: "Noch keine Aufgaben. Aufgaben werden automatisch aus Workflow-Aktionen erstellt.",
    activeQueue: "Aktive Warteschlange",
    noActiveTasks: "Nach der Abstimmung verbleiben keine aktiven Aufgaben.",
    resolvedRecently: "Kürzlich gelöst",
    noResolvedTasks: "Noch keine gelösten Aufgaben.",
    toAssignee: "an",
    due: "Fällig:",
    next: "Nächste:"
  },
  compliancePolicyPacks: {
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
  },
  adminCompliancePage: {
    title: "Compliance-Intelligenz",
    subtitle: "Fristgerechte Compliance-Verpflichtungen, Nachweisverfolgung und Lieferantenbescheinigungen",
    taskInbox: "Aufgaben-Posteingang",
    expiringSoon: "Läuft bald ab",
    expired: "Abgelaufen",
    missingEvidence: "Fehlender Nachweis",
    regionalPolicyPack: "Regionale Richtlinienpaket-Abdeckung",
    complianceObligations: "Compliance-Verpflichtungen",
    noObligations: "Noch keine Compliance-Verpflichtungen konfiguriert.",
    supplier: "Lieferant",
    owner: "Besitzer",
    region: "Region",
    expires: "Läuft ab:",
    evidenceMissing: "Nachweis fehlt",
    evidenceSubmitted: "Nachweis eingereicht",
    openSupplier: "Lieferant öffnen",
    reviewTasks: "Aufgaben überprüfen",
    openEvidence: "Nachweis öffnen",
    awaitingEvidence: "Warten auf Nachweis"
  },
  adminUsersPage: {
    title: "Zugriff & Rollen",
    subtitle: "Rollenbasierte Zugriffskontrolle und regionale Geltungsbereich-Governance",
    addAccount: "Konto hinzufügen",
    totalAccounts: "Gesamtkonten",
    totalAccountsDesc: "Autorisierte Plattformidentitäten",
    admins: "Administratoren",
    adminsDesc: "Control-Plane-Konten",
    internalUsers: "Interne Benutzer",
    internalUsersDesc: "Operative Workspace-Konten",
    regionalScope: "Regionaler Geltungsbereich",
    regionalScopeDesc: "Länder- oder regionengefilterte Operatoren",
    supplierLogins: "Lieferanten-Logins",
    supplierLoginsDesc: "Nur-Portal externer Zugriff",
    directory: "Verzeichnis",
    directoryDesc: "Rollenzuweisungen, benannte Zugriffsprofile und Workspace-Geltungsbereich",
    headers: {
      name: "Name",
      email: "E-Mail",
      accessScope: "Zugriffsbereich",
      department: "Abteilung",
      role: "Rolle",
      created: "Erstellt",
      actions: "Aktionen"
    },
    supplierMappingRequired: "Lieferantenzuordnung erforderlich",
    edit: "Bearbeiten",
    delete: "Löschen",
    noUsers: "Keine Benutzer gefunden.",
    createAccount: "Zugangskonto erstellen",
    createAccountDesc: "Stellen Sie ein benanntes Zugriffsprofil für einen internen oder lieferantenorientierten Workspace bereit.",
    editAccount: "Zugangskonto bearbeiten",
    editAccountDesc: "Aktualisieren Sie Profildetails, Zugriffsstatus oder Portalzuordnung für {name}.",
    form: {
      fullName: "Vollständiger Name",
      email: "E-Mail",
      employeeId: "Mitarbeiter-ID",
      password: "Passwort",
      newPassword: "Neues Passwort (leer lassen, um aktuelles beizubehalten)",
      department: "Abteilung",
      selectDepartment: "Abteilung auswählen",
      role: "Rolle",
      internalUser: "Interner Benutzer",
      admin: "Administrator",
      supplier: "Lieferant",
      linkedSupplier: "Verknüpfter Lieferant",
      selectSupplier: "Lieferant auswählen",
      supplierLoginInfo: "Lieferanten-Logins sind portalbeschränkt und müssen einem vorhandenen Lieferantendatensatz zugeordnet werden.",
      accessProfile: "Zugriffsprofil",
      countryScope: "Länderbereich",
      regionScope: "Regionalbereich",
      createBtn: "Konto erstellen",
      updateBtn: "Änderungen speichern",
      placeholders: {
        fullName: "Max Mustermann",
        email: "max@unternehmen.de",
        employeeId: "EMP001",
        password: "Mindestens 6 Zeichen",
        countryScope: "DE, IN, US...",
        regionScope: "EMEA, APAC, Bayern..."
      }
    },
    departments: {
      FinanceBudgeting: "Finanzen & Budgetierung",
      SupplierOperations: "Lieferantenbetrieb",
      ProcurementTeam: "Beschaffungsteam",
      InventoryControl: "Bestandskontrolle",
      ITAdmin: "IT & Verwaltung",
      ExecutiveLeadership: "Geschäftsführung"
    },
    toasts: {
      created: "Zugangskonto erstellt.",
      createFailed: "Fehler beim Erstellen des Benutzers",
      updated: "Zugangskonto aktualisiert.",
      updateFailed: "Fehler beim Aktualisieren des Benutzers",
      deleted: "Zugangskonto entfernt.",
      deleteFailed: "Fehler beim Löschen des Benutzers",
      confirmDelete: "Sind Sie sicher, dass Sie dieses Zugangskonto löschen möchten?"
    }
  },
  adminSupportPage: {
    title: "Support-Ticket-Konsole",
    subtitle: "Multi-Admin-Warteschlange — Änderungen von jedem Administrator werden in Echtzeit angezeigt. Geschlossene Tickets werden aus der aktiven Benutzeransicht archiviert.",
    refreshQueue: "Warteschlange aktualisieren",
    kpis: {
      open: "Offen",
      inProgress: "In Bearbeitung",
      resolved: "Gelöst",
      closed: "Geschlossen",
      criticalOpen: "Kritisch Offen"
    },
    adminQueue: "Admin-Warteschlange",
    adminQueueDesc: "Aktualisieren Sie den Status und fügen Sie eine Lösungsnotiz hinzu. Der Ticketbesitzer wird bei Aktualisierung per E-Mail benachrichtigt. Das Schließen eines Tickets entfernt es aus der aktiven Benutzeransicht.",
    searchPlaceholder: "Tickets suchen...",
    allStatuses: "Alle Status",
    allPriorities: "Alle Prioritäten",
    priorities: {
      critical: "Kritisch",
      high: "Hoch",
      medium: "Mittel",
      low: "Niedrig"
    },
    headers: {
      ticket: "Ticket",
      subjectDescription: "Betreff / Beschreibung",
      priority: "Priorität",
      status: "Status",
      resolution: "Lösung",
      actions: "Aktionen"
    },
    closeAndArchive: "Schließen & Archivieren",
    addResolution: "Lösungsnotizen hinzufügen (werden dem Benutzer per E-Mail gesendet)",
    buttons: {
      saving: "Speichern",
      close: "Schließen",
      update: "Aktualisieren"
    },
    emptyStates: {
      noTickets: "Keine Support-Tickets im System.",
      noMatch: "Keine Tickets entsprechen den aktuellen Filtern."
    },
    showing: "Zeige {filtered} von {total} Ticket(s)",
    statusFilterText: "Status: ",
    priorityFilterText: "Priorität: ",
    toasts: {
      updated: "Ticket {num} wurde auf \"{status}\" aktualisiert.",
      closed: "Ticket {num} ist jetzt geschlossen — es wird aus der Benutzeransicht archiviert.",
      updateFailed: "Fehler beim Aktualisieren von {num}."
    }
  },
  adminAuditPage: {
    accessDenied: {
      title: "Zugriff verweigert",
      desc: "Der Prüfpfad ist auf Finanz- und Super-Admin-Zugriffsprofile beschränkt. Wenn Sie einen Export oder einen Untersuchungs-Schnappschuss benötigen, wenden Sie sich an Ihren Plattformadministrator.",
      returnBtn: "Zurück zum Arbeitsbereich",
      contactBtn: "Administrator kontaktieren"
    },
    title: "Globaler Prüfpfad",
    subtitle: "Unveränderliche Aufzeichnung aller systemweiten Aktionen für Compliance und Forensik.",
    wormEnforced: "WORM-Erzwungen",
    storagePending: "Speicherhärtung ausstehend",
    kpis: {
      totalActions: "Gesamte erfasste Aktionen",
      lastEvent: "Letztes Ereignis protokolliert ",
      activeAuditors: "Aktive Prüfer",
      authorizedAdmins: "Autorisierte Systemadministratoren",
      entityCoverage: "Entitätsabdeckung",
      objectTypes: "Arten von nachverfolgten Objekten",
      tamperSurface: "Manipulationsfläche",
      locked: "Gesperrt",
      appOnly: "Nur App",
      lockedDesc: "Aktualisieren, Löschen und Abschneiden sind auf Datenbankebene für Überwachungsprotokolle blockiert.",
      appOnlyDesc: "Die App ist nur Lese- und Exportmodus, aber die harte Sperre der Datenbank ist noch nicht verifiziert."
    },
    view: {
      searchPlaceholder: "Suchen nach Entität, Benutzer oder Details...",
      actionsFilter: "Aktionen Filter",
      entitiesFilter: "Entitäten Filter",
      exportBtn: "Bericht exportieren",
      exportingBtn: "Exportieren...",
      selected: "{count} ausgewählt",
      clearFilters: "Filter zurücksetzen",
      headers: {
        timestamp: "Zeitstempel (UTC)",
        action: "Aktion",
        entity: "Entität",
        details: "Details",
        user: "Benutzer"
      },
      noLogs: "Noch keine Prüfereignisse erfasst.",
      noMatch: "Keine Prüfprotokolle entsprechen den aktuellen Filtern.",
      showing: "Zeige {filtered} von {total} Ereignissen",
      actionTypes: {
        create: "Dateneingabe",
        update: "Änderung",
        delete: "Entfernung",
        other: "Systemereignis"
      },
      verified: "Verifiziert"
    },
    export: {
      title: "Axiom Globaler Prüfpfad - Compliance-Nachweisbericht",
      generatedOn: "Erstellt am:",
      reportScope: "Berichtsumfang:",
      allActions: "Alle Aktionen",
      entityFilter: "Entitätenfilter:",
      allEntities: "Alle Entitäten",
      recordCount: "Anzahl Datensätze:",
      headers: {
        serial: "Laufende Nr.",
        auditId: "Prüfungs-ID",
        actionType: "Aktionstyp",
        entityType: "Entitätstyp",
        entityId: "Entitäts-ID",
        description: "Beschreibung",
        performedBy: "Durchgeführt von",
        timestamp: "Zeitstempel (UTC)",
        date: "Datum",
        time: "Zeit",
        category: "Kategorie",
        complianceStatus: "Compliance-Status"
      }
    },
    time: {
      noEvents: "Noch keine Ereignisse erfasst",
      minsAgo: "vor {mins} Min.",
      hoursAgo: "vor {hours} Std.",
      daysAgo: "vor {days} Tg."
    }
  },
  adminImportPage: {
    toasts: {
      loadError: "SAP-Konnektor-Status konnte nicht geladen werden",
      emptyCsv: "Bitte laden Sie eine CSV-Datei hoch oder fügen Sie CSV-Inhalte ein.",
      dryRunSuccess: "Probelauf abgeschlossen",
      dryRunSuccessDesc: "{valid} gültige Zeilen, {invalid} ungültige Zeilen",
      dryRunError: "Probelauf fehlgeschlagen",
      importSuccess: "Import abgeschlossen",
      importSuccessDesc: "Eingefügt: {inserted}, Aktualisiert: {updated}, Übersprungen: {skipped}",
      importError: "Import fehlgeschlagen"
    },
    title: "Kontrollierter Datenimport",
    subtitle: "Nur-Admin-CSV-Aufnahme mit Probelauf-Validierung, Blockierung verdächtiger Eingaben, referenziellen Prüfungen und Post-Import-Intelligence-Synchronisierung.",
    adminOnly: "Nur Admin",
    features: {
      validation: "Schema-Validierung",
      validationDesc: "Kopfzeilen, numerische Bereiche, Währungscodes und verdächtige Tabellenkalkulationsformeln werden vor der Übernahme geprüft.",
      referential: "Referenzielle Prüfungen",
      referentialDesc: "Rechnungsimporte verifizieren verknüpfte Bestellungen und Lieferanten, damit fehlerhafte Datensätze nicht in Live-Workflows gelangen.",
      sync: "Post-Import-Synchronisierung",
      syncDesc: "Erfolgreiche Importe lösen eine nachgelagerte Aktualisierung aus, damit Dashboards, Warnungen und Wiederherstellungsrouten abgestimmt bleiben."
    },
    sapStatus: {
      title: "SAP-Konnektor-Status",
      subtitle: "Axiom kann die SAP-Konnektivität testen, OData-Felder zuordnen, Importe probeweise durchführen und übernommene Synchronisationen mit Jobverlauf verfolgen.",
      refreshBtn: "Status aktualisieren",
      config: "Konfiguration",
      configReady: "Bereit",
      configMissing: "Fehlende Umgebungseinstellungen",
      authMethod: "Authentifizierungsmethode",
      unknown: "Unbekannt",
      lastSync: "Letzte erfolgreiche Synchronisation",
      noSync: "Noch keine erfolgreiche SAP-Synchronisation",
      recentJobs: "Aktuelle SAP-Jobs",
      trackedRuns: "{count} verfolgte Ausführungen",
      syncType: "{type} Synchronisation",
      manual: "manuell",
      rowsApplied: "{success}/{total} Zeilen angewendet",
      inProgress: "In Bearbeitung",
      noJobs: "Bisher werden keine SAP-Synchronisationsjobs verfolgt. Sobald Sie einen SAP-gestützten Import durchführen, zeichnet Axiom den Lauf hier mit Zeilenanzahlen und Abschlussstatus auf."
    },
    config: {
      title: "Import-Konfiguration",
      subtitle: "Unterstützte Datensätze: Lieferanten, Teile, Rechnungen. Führen Sie zuerst den Probelauf durch und übernehmen Sie dann nur die Zeilen, die die Validierung bestehen.",
      dataset: "Datensatz",
      suppliers: "Lieferanten",
      parts: "Teile",
      invoices: "Rechnungen",
      upload: "CSV hochladen",
      chooseFile: "Datei auswählen",
      csvContent: "CSV-Inhalt",
      csvPlaceholder: "Fügen Sie hier CSV-Inhalte ein...",
      expectedHeaders: "Erwartete Kopfzeilen für {type}: ",
      rejectionWarning: "Dateien mit doppelten Kopfzeilen, überdimensionalen Nutzdaten oder verdächtigen Tabellenkalkulationsformeln werden vor der Übernahme abgelehnt.",
      runDryRunBtn: "Probelauf starten",
      runningDryRunBtn: "Probelauf läuft...",
      commitBtn: "Import übernehmen",
      importingBtn: "Wird importiert..."
    },
    summary: {
      title: "Probelauf-Zusammenfassung",
      totalRows: "Gesamte Zeilen",
      validRows: "Gültige Zeilen",
      invalidRows: "Ungültige Zeilen"
    },
    validationIssues: {
      title: "Validierungsprobleme",
      headerIssue: "⚠ Kopfzeilenproblem: ",
      rowIssue: "Zeile {row}: ",
      noIssues: "Keine Probleme gefunden."
    },
    preview: {
      title: "Vorschau (erste 10 Zeilen)",
      noPreview: "Keine Vorschau verfügbar."
    }
  },
  adminSettingsPage: {
    toasts: {
      updateSuccess: "Admin-Einstellungen erfolgreich aktualisiert.",
      updateError: "Fehler beim Aktualisieren der Einstellungen",
      flushAuthSuccess: "Autorisierungscache geleert. Neue Rollenregeln sind jetzt aktiv."
    },
    accessDenied: {
      title: "Admin-Zugriff erforderlich",
      desc: "Nur Administratoren können auf die Systemeinstellungen zugreifen."
    },
    title: "Admin-Einstellungen",
    subtitle: "Sichere Konfiguration, Wiederherstellungssteuerungen und Wartung der Demo-Umgebung.",
    configGuardrail: {
      title: "Konfigurationsleitplanke",
      subtitle: "Verhindern Sie versehentliche Änderungen bei Demos und Überprüfungen.",
      settingsLock: "Einstellungssperre",
      desc: "Wenn die Sperre aktiviert ist, bleiben die operativen Einstellungen eingefroren, damit die Demo-Oberfläche bei Übergaben oder Live-Präsentationen nicht abweicht."
    },
    security: {
      title: "Sicherheit & Zugriff",
      subtitle: "Authentifizierungsrichtlinien und Berechtigungs-Aktualisierungssteuerelemente.",
      sessionPolicy: {
        title: "Sitzungsrichtlinie",
        window: "30-minütiges Server-Sitzungsfenster",
        desc: "Die Sitzungsdauer wird serverseitig erzwungen. Diese Seite zeigt die aktive Richtlinie an, legt jedoch keine Low-Level-Authentifizierungskonfiguration zur Bearbeitung im Browser offen."
      },
      twoFactor: {
        title: "Zwei-Faktor-Authentifizierung"
      },
      flushAuth: {
        title: "Autorisierungscache leeren",
        desc: "Validiert serverseitig gerenderte Berechtigungsprüfungen nach Rollenänderungen, 2FA-Updates oder Korrekturen der Zugriffsrichtlinien neu, damit die Benutzeroberfläche sofort den neuesten Sicherheitsstatus widerspiegelt.",
        btn: "Auth-Cache leeren"
      },
      deploymentBoundary: {
        title: "Bereitstellungsgrenze",
        subtitle: "Identität, Sitzungssteuerung und Überprüfungsprotokolle werden in der App erzwungen.",
        desc: "Verschlüsselung der Produktions-Cloud, Zertifikatsbereich und Infrastrukturbescheinigungen bleiben Bereitstellungskontrollen außerhalb dieses Admin-Panels, daher meldet dieser Bildschirm nur die App-seitigen Kontrollen, die wir hier nachweisen können."
      }
    },
    twoFactorComponent: {
      toasts: {
        setupError: "Starten des 2FA-Setups fehlgeschlagen",
        unexpectedError: "Ein unerwarteter Fehler ist aufgetreten",
        enableSuccess: "2FA erfolgreich aktiviert",
        verifyError: "Überprüfung fehlgeschlagen",
        disableConfirm: "Sind Sie sicher, dass Sie 2FA deaktivieren möchten? Dadurch wird Ihr Konto weniger sicher.",
        disableSuccess: "2FA deaktiviert",
        disableError: "Deaktivieren von 2FA fehlgeschlagen"
      },
      badges: {
        active: "Aktiv",
        disabled: "Deaktiviert"
      },
      labels: {
        authApp: "Authenticator-App",
        desc: "Sichern Sie Ihr Konto mit TOTP (Google/Microsoft Authenticator).",
        manageBtn: "2FA verwalten",
        setupBtn: "2FA einrichten"
      },
      dialog: {
        title: "Zwei-Faktor-Authentifizierung",
        descManage: "Verwalten Sie Ihre Einstellungen für den zweiten Faktor.",
        descSetup: "Fügen Sie Ihrem Konto eine zusätzliche Sicherheitsebene hinzu."
      },
      protected: {
        title: "2FA ist geschützt",
        desc: "Ihr Konto ist mit einer Authenticator-App gesichert.",
        disableBtn: "2FA-Schutz deaktivieren"
      },
      stepInitial: {
        desc: "Verwenden Sie eine Authenticator-App wie Microsoft Authenticator, um Bestätigungscodes zu generieren.",
        btn: "Konfiguration beginnen"
      },
      stepSetup: {
        qrBlocked: "QR-Generator blockiert",
        qrBlockedDesc: "Ihr Netzwerk blockiert den QR-Generator. Bitte verwenden Sie stattdessen den unten stehenden Einrichtungsschlüssel.",
        step1Title: "Schritt 1: QR-Code scannen",
        step1DescFallback: "Da das Bild blockiert ist, fügen Sie in Ihrer App manuell ein neues Konto hinzu.",
        step1Desc: "Scannen Sie das Bild oben mit Ihrer Authenticator-App.",
        manualKey: "Manueller Einrichtungsschlüssel",
        priorityFallback: "Prioritäts-Rückfall",
        nextBtn: "Weiter: Code überprüfen"
      },
      stepVerify: {
        step2Title: "Schritt 2: 6-stelligen Code eingeben",
        step2Desc: "Geben Sie den in Ihrer Authenticator-App angezeigten Code ein.",
        placeholder: "000000",
        verifyBtn: "Überprüfen & aktivieren",
        backBtn: "Zurück zum QR-Code"
      }
    },
    finance: {
      title: "Finanzkonsole",
      subtitle: "Normalisieren Sie die Beschaffungsberichte mit festen Buchkursen, während Sie Live-FX-Feeds für lokale Linsen beibehalten.",
      functionalCurrency: "Funktionale Währung",
      reportingCurrency: "Berichtswährung",
      bookRateCadence: "Buchkurs-Rhythmus",
      effectiveFrom: "Gültig ab",
      monthly: "Monatlich",
      quarterly: "Vierteljährlich",
      bookRateLabel: "{currency} Buchkurs",
      bookRateInput: "1 {currency} in {reporting}",
      reportingFormula: {
        title: "Berichtsformel",
        formula: "Lokale Ausgaben x fester Buchkurs = {reporting} Berichtsansicht",
        desc: "Verwenden Sie feste Periodenkurse, damit die Einsparungen während der Überprüfung nicht mit dem täglichen FX-Rauschen driften."
      },
      liveFx: {
        title: "Live FX-Schnappschuss",
        noRates: "Noch keine Live-Kurse erfasst",
        desc: "Der tägliche EZB-Feed bleibt intakt und koexistiert nun mit der CFO-Buchkurs-Ebene, anstatt sie zu überschreiben."
      },
      appLens: {
        title: "App-Linse",
        subtitle: "Kopfzeilen-Umschalter wechselt zwischen lokalen und Berichtswährungsansichten",
        desc: "Interne Benutzer können von der benutzer-lokalen Währungsumrechnung zu festen Berichtsbuchkursen wechseln, ohne die Quelldaten zu ändern."
      },
      activeCurrencies: {
        title: "Aktive Hauptbuchwährungen",
        noCurrencies: "Noch keine gebuchten Rechnungswährungen",
        desc: "Originalrechnungswährungen bleiben intakt, anstatt in ein einziges regionales Buch abgeflacht zu werden."
      },
      coverage: {
        title: "USD / EUR / GBP Abdeckung",
        missing: "Buchkurse fehlen",
        desc: "Buchkursabdeckung für die globalen Hauptberichtswährungen, die in Executive-Rollups verwendet werden."
      },
      breathTest: {
        title: "Globaler Atemtest",
        covered: "USD-, EUR- und GBP-Wege sind abgedeckt",
        incomplete: "Globale Drei-Währungs-Abdeckung ist noch unvollständig",
        desc: "Dies ist die schnellste Prüfung, ob sich die Finanzen wie ein globales System verhalten und nicht wie eine Einzelwährungshülle."
      },
      sourceOfTruth: {
        title: "Quelle der Wahrheit",
        subtitle: "Gebuchte Rechnungen behalten ihre ursprüngliche Währung.",
        desc: "Das Wechseln der App-Linse überschreibt niemals Rechnungs-, Bestell- oder Vertragsdatensätze. Es ändert nur, wie die Zahlen angezeigt und aufgerollt werden."
      },
      userLocalLens: {
        title: "Benutzer-lokale FX-Linse",
        subtitle: "Am besten für Einkäufer, Werksbenutzer und regionale Betreiber.",
        desc: "Der Kopfzeilen-Umschalter konvertiert Anzeigewerte mit der lokalen Ansicht in die Betriebswährung des Benutzers. Dies hilft bei der täglichen Überprüfung, ohne Quelldatensätze abzuflachen."
      },
      reportingLens: {
        title: "Berichtsbuch-Linse",
        subtitle: "Am besten für Finanzen, Controller und Executive-Rollups.",
        desc: "Die Buchansicht verwendet feste {period}-Kurse in {reporting}. Es hält die Einsparungen und Ausgabenberichte über den Abrechnungszeitraum stabil."
      },
      operationalBottleneck: {
        title: "Operativer Engpass",
        fresh: "Halten Sie die Buchkurse aktuell, bevor Sie globale Gesamtsummen verwenden.",
        untrustworthy: "Vertrauen Sie globalen Gesamtsummen nicht, bis Buchkurse geladen sind.",
        desc: "Wenn Buchkurse veraltet sind oder fehlen, besteht der sicherste Rückfall darin, für operative Entscheidungen in den Quellwährungs- oder lokalen Ansichten zu bleiben und die Finanzeinstellungen vor der Executive-Berichterstattung zu aktualisieren."
      }
    },
    ai: {
      title: "KI-Anmeldeinformationsstatus",
      subtitle: "Die Präsenz von Anmeldeinformationen ist sichtbar, aber rohe Schlüssel werden niemals im Browser gerendert.",
      ready: "KI Bereit",
      missing: "KI-Anmeldeinformationen fehlen",
      sourceCount: "{count} Anmeldeinformationsquelle{s} erkannt",
      secureStorage: {
        title: "Sicherer Speicher",
        desc: "Anmeldeinformationsdatensätze werden serverseitig gespeichert."
      },
      envSources: {
        title: "Umgebungsquellen",
        desc: "Server-Umgebungsvariablen, die der Laufzeit zur Verfügung stehen."
      },
      hiddenWarning: "Sensible Werte werden absichtlich verborgen. Bereitstellung und Rotation sollten über eine sichere Serverkonfiguration erfolgen, nicht über für den Browser sichtbare Admin-Formulare."
    },
    maintenance: {
      title: "Systemwartung",
      subtitle: "Demo-Daten zurücksetzen, ohne den Admin-Zugriff zu verlieren.",
      cleanupTitle: "Arbeitsbereichs-Bereinigung",
      cleanupDesc: "Verwenden Sie dies nur, wenn Sie vor einem neuen Präsentationslauf Demo-Daten, veraltete KI-Ausgaben und operative Datensätze aus der Umgebung entfernen müssen.",
      seedDemoData: {
        trigger: "Demo-Arbeitsbereich laden",
        title: "Demo-Daten neu aufbauen",
        desc: "Dies ersetzt die aktuellen Arbeitsbereichsdaten durch einen stabilen Demo-Datensatz über Lieferanten, Beschaffung, Rechnungen, Einsparungen, Risiken, Compliance, Support und KI-Dashboards. Admin-Zugriff und sichere Plattform-Einstellungen bleiben erhalten.",
        cancel: "Abbrechen",
        confirm: "JA, DEMO-DATEN LADEN",
        success: "Demo-Arbeitsbereich geladen.",
        error: "Fehler beim Laden des Demo-Arbeitsbereichs",
        unexpectedError: "Ein unerwarteter Fehler ist bei der Vorbereitung des Demo-Arbeitsbereichs aufgetreten."
      },
      clearInventory: {
        trigger: "Nur Inventar löschen",
        title: "Inventar-Bereinigungs-Schutz",
        desc1: "Dies entfernt den gesamten Teilekatalog und die verknüpften Bedarfsplanungsdaten. Es ist absichtlich vom Live-Inventar-Bildschirm ausgeblendet, um versehentlichen Verlust während des Betriebs zu vermeiden.",
        desc2: 'Geben Sie DELETE ein, um diese Admin-Aktion zu bestätigen.',
        label: "Bestätigungsphrase",
        placeholder: 'Geben Sie "DELETE" ein',
        deleteWord: "DELETE",
        errorEmpty: 'Geben Sie "DELETE" ein, um die Inventarbereinigung zu bestätigen.',
        cancel: "Abbrechen",
        confirm: "Inventar löschen",
        success: "{count} Teile und verknüpfte Inventardatensätze wurden gelöscht.",
        error: "Fehler beim Löschen des Inventars",
        unexpectedError: "Ein unerwarteter Fehler ist beim Löschen des Inventars aufgetreten."
      },
      resetDatabase: {
        trigger: "Demo-Daten löschen",
        title: "Gefahrenzone: Irreversible Aktion",
        desc1: "Dies wird Demo-Daten des Arbeitsbereichs dauerhaft löschen, einschließlich Lieferanten, Transaktionen, Beschaffungsdaten, Warnungen und generierten KI-Artefakten. Admin-Konten und sichere Systemeinstellungen bleiben erhalten, damit Sie nach der Bereinigung wieder Zugriff haben.",
        desc2: "Diese Aktion kann nicht rückgängig gemacht werden.",
        cancel: "Abbrechen",
        confirm: "JA, ALLES LÖSCHEN",
        success: "Arbeitsbereich-Demo-Daten wurden gelöscht.",
        error: "Zurücksetzen fehlgeschlagen",
        unexpectedError: "Ein unerwarteter Fehler ist aufgetreten"
      }
    },
    buttons: {
      reset: "Zurücksetzen",
      apply: "Änderungen anwenden",
      applying: "Wird angewendet..."
    }
  },
  adminScenariosPage: {
    toasts: {
      runFailed: "Szenariolauf fehlgeschlagen",
      runFailedEngine: "Die Engine konnte die Analyse nicht abschließen.",
      runFailedUnexpected: "Die Analyse-Engine ist auf einen unerwarteten Fehler gestoßen.",
      modeled: "Szenario modelliert",
      modeledDesc: "{title} wurde aus den Live-Arbeitsbereichs-Basislinien neu erstellt.",
      queueFailed: "Fehler beim Einreihen des Anwendungsplans",
      queueFailedAxiom: "Axiom konnte das verwaltete Ausführungspaket nicht erstellen.",
      queueFailedPacket: "Das verwaltete Ausführungspaket konnte nicht erstellt werden.",
      stagedReused: "Anwendungsplan bereits vorbereitet",
      stagedQueued: "Verwalteter Anwendungsplan eingereiht",
      stagedDesc: "{ownerName} besitzt nun das Ausführungspaket im Posteingang für Aufgaben."
    },
    header: {
      title: "Szenariomodellierung",
      desc: "Deterministische Szenarioanalyse über Live-Auftrags-, Lieferanten-, Rechnungs- und FX-Basislinien. Axiom gibt nicht vor, den Markt durch Magie zu kennen: Sie definieren den Schock, die Engine zeigt die Exposition, Annahmen und operativen Konsequenzen."
    },
    badges: {
      engine: "Deterministische Engine",
      baselines: "Live-Arbeitsbereichs-Basislinien",
      operator: "Marktschock ist bedienerdefiniert"
    },
    controls: {
      title: "Szenariosteuerung",
      desc: "Wählen Sie die Betriebsbelastung, die Sie testen möchten, und führen Sie sie gegen die aktuelle Beschaffungsbasislinie aus.",
      scenarioType: "Szenariotyp",
      businessFraming: "Geschäftsrahmen",
      businessFramingPlaceholder: "Beschreiben Sie das operative Ereignis, das Sie testen.",
      priceMovement: "Preisbewegung (%)",
      volumeMovement: "Volumenbewegung (%)",
      impactedSpend: "Betroffener Ausgabenanteil (%)",
      leadTimeMovement: "Vorlaufzeitbewegung (Tage)",
      impactedOrder: "Betroffener Bestellanteil (%)",
      exposedCurrency: "Exponierte Währung",
      fxMove: "FX-Bewegung (%)",
      shiftedSpend: "Verschobener Ausgabenanteil (%)",
      costDelta: "Kosten-Delta (%)",
      currentRisk: "Aktuelles Lieferantenrisiko",
      alternateRisk: "Alternatives Lieferantenrisiko",
      modelDiscipline: "Modelldisziplin",
      rule1: "Verwendet offene Bestellungen, Lieferantenrisikopositionen, Rechnungswährungsexpositionen und Finanzeinstellungen.",
      rule2: "Schreibt Rechnungen, Bestellungen oder Buchkurse nicht um. Dies ist nur eine Simulationsebene.",
      rule3: "Gibt nicht vor, Live-Rohstoff- oder Markt-Feeds aufzunehmen, es sei denn, diese Daten sind explizit verbunden.",
      btnRun: "Analyse ausführen",
      btnRunning: "Wird ausgeführt...",
      btnReset: "Zurücksetzen"
    },
    playbooks: {
      title: "Szenario-Playbooks",
      desc: "Laden Sie einen ernsthaften Startpunkt und passen Sie dann die Belastungseingaben an, bevor Sie ihn ausführen."
    },
    empty: {
      title: "Es wurde noch kein Szenario ausgeführt",
      desc: "Diese Seite behandelt Szenarien nun als operative Entscheidungen, nicht als dekorative Vorlagen. Führen Sie eines aus, und Axiom zeigt die Live-Auftragsbuchbasis, Rechnungswährungsexposition, FX-Aktualität, explizite Annahmen und Kontrollauswirkungen hinter der Projektion.",
      method1Title: "Was es verwendet",
      method1Body: "Offene Bestellungen, Lieferantenrisikopositionen, Rechnungsexposition nach Währung und konfigurierte Finanzeinstellungen.",
      method2Title: "Was fest bleibt",
      method2Body: "Quellrechnungen und gebuchte Datensätze bleiben unberührt. Nur die Berichtsansicht und die Projektion ändern sich.",
      method3Title: "Was es nicht vortäuscht",
      method3Body: "Es wird kein externer Live-Preis- oder Markt-Feed impliziert, es sei denn, diese Daten sind tatsächlich verbunden."
    },
    scenario: {
      applyPlanQueued: "Anwendungsplan eingereiht",
      confidence: "Konfidenz",
      btnQueue: "Verwalteten Anwendungsplan einreihen",
      btnQueuing: "Anwendungsplan wird eingereiht...",
      btnQueued: "Anwendungsplan eingereiht",
      governedRoute: "Verwaltete Anwendungsroute",
      governedDesc: "{ownerName} besitzt das Ausführungspaket.",
      governedSubDesc: "Das Szenario wurde in eine verfolgte Empfehlung und ein Überprüfungselement im Posteingang für Aufgaben umgewandelt, anstatt die Live-Beschaffung blind zu mutieren.",
      due: "Fällig {date} | Empfehlung {rec} | Aufgabe {task}",
      btnOpenTask: "Posteingang für Aufgaben öffnen",
      openOrderBasis: "Basis offener Bestellungen",
      orders: "Bestellungen",
      supplierRisk: "Lieferantenrisiko",
      highRiskSuppliers: "Hochrisiko-Lieferanten",
      avg: "Ø",
      invoiceExposure: "Rechnungsexposition",
      invoices: "Rechnungen",
      noInvoiceCurrencies: "Keine Rechnungswährungen",
      fxPosture: "FX-Haltung",
      bookView: "Buchansicht",
      inputsTitle: "Szenarioeingaben",
      signalsTitle: "Marktsignale",
      assumptionsTitle: "Annahmen",
      projectedTitle: "Projizierte Ergebnisse",
      projectedSubTitle: "Aktuell vs projiziert",
      noDelta: "Kein Delta berechnet",
      recommendationsTitle: "Empfehlungen",
      riskFactorsTitle: "Risikofaktoren",
      currencyBasisTitle: "Währungsexpositionsbasis",
      share: "Anteil",
      source: "Quelle",
      reporting: "Bericht",
      noExposure: "Es wurde noch keine Rechnungsexposition gebucht."
    },
    scenarioMeta: {
      price_change: {
        title: "Preisschock",
        description: "Belasten Sie das Live-Auftragsbuch mit einer Kategorie- oder Marktpreisbewegung."
      },
      volume_change: {
        title: "Volumenverschiebung",
        description: "Schieben Sie eine Bedarfssteigerung oder -senkung durch den Beschaffungsfluss und beobachten Sie Ausgaben / Belastung."
      },
      lead_time: {
        title: "Vorlaufzeitdrift",
        description: "Modellieren Sie, wie Lieferverzögerungen oder -verbesserungen den operativen und Kostendruck verändern."
      },
      supplier_switch: {
        title: "Lieferantenwechsel",
        description: "Vergleichen Sie Risiko, Freigabeblockadehaltung und Ausgaben auf einer verschobenen Lieferantenspur."
      },
      currency_fluctuation: {
        title: "Währungsschwankung",
        description: "Messen Sie, wie FX-Bewegungen die Berichtsbuch-Exposition verändern, ohne Quellrechnungen zu berühren."
      }
    },
    playbooksList: {
      commoditySpike: {
        label: "Rohstoffspitze",
        summary: "14% Preisanstieg über 45% der aktuellen Spur offener Bestellungen.",
        description: "Rohstoffspitze auf kritischen Spuren."
      },
      eurFxShock: {
        label: "EUR FX-Schock",
        summary: "6% negative Bewegung bei EUR-Rechnungsexposition im Berichtsbuch.",
        description: "EUR wird gegenüber der Berichtswährung bei exponierten Rechnungen stärker."
      },
      delayWave: {
        label: "Hafenverzögerungswelle",
        summary: "9-Tage-Rutsch über 30% der aktiven Spuren.",
        description: "Hafen- und Spediteurverzögerung über aktuelle eingehende Bestellungen."
      },
      alternateSource: {
        label: "Alternative Quelle",
        summary: "Verschieben Sie 25% der Ausgaben von Risiko 78 auf Risiko 46 zu einem Kostenaufschlag von 3%.",
        description: "Erzwungene alternative Quelle weg von einem Hochrisikolieferanten."
      },
      demandSurge: {
        label: "Nachfrageschub",
        summary: "22% Nachfragesteigerung durch 40% der aktuellen Spur offener Bestellungen.",
        description: "Nachfrageschub über die aktuelle Freigabe-Pipeline."
      }
    }
  },
  adminEcosystemPage: {
    toasts: {
      failedMap: "Fehler beim Zuordnen des Lieferanten-Ökosystems",
      noDataToExport: "Keine Daten des Lieferanten-Ökosystems zum Exportieren verfügbar",
      reportDownloaded: "Lieferanten-Leistungsbericht heruntergeladen",
    },
    loading: "Lieferanten-Ökosystem wird zugeordnet...",
    errorState: {
      title: "Lieferanten-Ökosystem konnte nicht neu erstellt werden",
      desc: "{error}. Axiom erstellt diese Seite aus den aktuellen Lieferanten-, Bestell-, Vertrags- und Teiledaten neu, sodass ein erneuter Versuch sofort aktuelle Datensätze aufnimmt.",
      btnRetry: "Zuordnung wiederholen",
      btnOpenSuppliers: "Lieferanten öffnen",
      btnLoadData: "Lieferantendaten laden",
    },
    emptyState: {
      title: "Warten auf Live-Lieferantennetzwerkdaten",
      desc: "Derzeit sind keine aktiven Lieferanten in der Ökosystemansicht zugeordnet. Sobald Lieferanten-, Bestell- oder Vertragsdaten hinzugefügt werden, organisiert sich diese Seite beim nächsten Neuaufbau anhand der neuen Live-Datensätze neu.",
      btnRebuild: "Netzwerk neu aufbauen",
    },
    noInputState: {
      title: "Lieferanten-Ökosystem wartet auf Live-Eingaben",
      desc: "Diese Route organisiert sich aus den aktuellen Lieferanten-, Bestell-, Vertrags- und Teiledaten neu. Bauen Sie das Netzwerk neu auf, nachdem neue Daten hinzugefügt wurden, wenn Sie die neueste Partnerkarte sofort möchten.",
    },
    header: {
      title: "Lieferanten-Ökosystem",
      healthScore: "Gesundheitsfaktor {score}/100",
      desc: "Diese Seite konzentriert sich nun auf Partner-Resilienz, Leistungshaltung, Backup-Abdeckung und Aktionsrouten. Sie behandelt Lieferanten als operatives Netzwerk, nicht als statisches Adressbuch.",
      btnRebuild: "Netzwerk neu aufbauen",
      btnGenerateReport: "Leistungsbericht erstellen",
      btnOpenSuppliers: "Lieferanten öffnen",
      btnOpenRisk: "Risk Intelligence öffnen",
    },
    metrics: {
      mappedTitle: "Partner zugeordnet",
      mappedDesc: "Aktive Lieferanten mit Live-Bestell-, Vertrags- und Leistungssignalen.",
      backupTitle: "Backup-Abdeckung",
      backupDesc: "Lieferanten mit einer zugeordneten Backup-Spur innerhalb des aktuellen Netzwerkmodells.",
      expiringTitle: "Auslaufende Verträge",
      expiringDesc: "Strategische Partner, deren kommerzielle Absicherung Erneuerungsaufmerksamkeit erfordert.",
      hotspotsTitle: "Kritische Hotspots",
      hotspotsDesc: "Expositionspunkte, an denen Konzentration, Risiko oder fehlende Alternativen den Fluss unterbrechen können."
    },
    routes: {
      title: "Lieferanten-Partnerschaftsrouten",
      desc: "Die Zusammenarbeit mit Lieferanten ist in Axiom bereits durch portalgesteuerten Self-Service vorhanden, nicht nur durch E-Mail-Hin-und-Her.",
      onboardingTitle: "Self-Service-Onboarding",
      onboardingDesc: "Lieferanten können Profildaten, Kategorien, Land, Kontakt-E-Mail, Zertifizierungen und ESG-Erklärungen bereits im Portal verwalten.",
      collaborationTitle: "Angebots- und Bestellzusammenarbeit",
      collaborationDesc: "RFQ-Einladungen, aktive Bestellungen, Dokumente und Anfragen sind im lieferantenseitigen Arbeitsbereich bereits sichtbar.",
      boundaryTitle: "Aktuelle Bereitschaftsgrenze",
      boundaryDesc: "Mehrstufige Offenlegung von Unterlieferanten und von Lieferanten geteilte Prognosezusagen sind im Datenmodell noch nicht live. Diese Seite zeigt die Lücke auf, anstatt vorzutäuschen, dass bereits eine tiefe vorgelagerte Sichtbarkeit besteht.",
      btnReview: "Lieferantendatensätze überprüfen",
      btnCompliance: "Compliance öffnen"
    },
    performance: {
      title: "Leistungsbeobachtung",
      desc: "Echte Lieferanten, nach aktueller Leistung und Risiko eingestuft, bereit für die nächste Überprüfung oder Verhandlung.",
      general: "Allgemein",
      orders: "Bestellungen",
      risk: "Risiko",
      perfLabel: "Leistung",
      empty: "Derzeit befindet sich kein Lieferant außerhalb der aktiven Schwellenwerte für die Leistungsbeobachtung."
    },
    dependency: {
      title: "Abhängigkeitsdruck",
      desc: "Aktuelle blinde Flecken, Single-Source-Spuren und Wiederherstellungsrouten aus der Live-Ökosystemkarte.",
      watchlistTitle: "Single-Source-Beobachtungsliste",
      watchlistDesc: "{count} Lieferantenspuren haben Live-Ausgaben, aber noch keine zugeordnete Backup-Beziehung.",
      empty: "In der aktuellen Lieferantenkarte wurde keine offene Single-Source-Konzentration festgestellt.",
      btnScenario: "Szenario-Labor",
      btnRisk: "Risiko-Routen"
    },
    hotspot: {
      title: "Hotspot-Feed",
      desc: "Finanzielle Exposition und der erste Wiederherstellungsschritt für jeden aktuellen Risiko-Hotspot.",
      exposed: "exponiert",
      fallback: "Bauen Sie eine Wiederherstellungsroute vor dem nächsten Freigabezyklus auf.",
      empty: "Derzeit ist kein aktiver Hotspot im Lieferantennetzwerk markiert."
    },
    network: {
      title: "Netzwerkform",
      desc: "Live-Verteilung von Lieferanten-Clustern und aktueller Hotspot-Exposition.",
      clusterDensity: "Cluster-Dichte",
      hotspotExposure: "Hotspot-Exposition"
    },
    recommendations: {
      title: "Strategische Empfehlungen",
      desc: "Empfehlungen, die aus der aktuellen Lieferantenkarte abgeleitet wurden, nicht aus statischem Platzhaltertext.",
      empty: "Aus dem aktuellen Lieferantennetzwerk wurde keine Live-Empfehlung generiert."
    },
    csv: {
      supplier: "Lieferant",
      category: "Kategorie",
      riskScore: "Risiko-Score",
      performanceScore: "Leistungs-Score",
      orderVolume: "Bestellvolumen",
      orderValue: "Bestellwert",
      contractStatus: "Vertragsstatus",
      backupCovered: "Backup abgedeckt",
      partCategories: "Teilekategorien",
      yes: "Ja",
      no: "Nein",
      general: "Allgemein"
    }
  },

  
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
      agentCatalog: "Agenten-Katalog",
    },
    catalog: {
      openWorkspace: "Workspace öffnen",
      running: "Wird ausgeführt...",
      adminRun: "Admin-Ausführung",
      run: "Ausführen"
    },
    trace: {
      title: "Agentenausführungs-Trace",
      runningNow: "LÄUFT_JETZT",
      workspaceIdle: "WORKSPACE_LEERLAUF",
      runs24h: "LÄUFE_24H",
      noActivity: "Keine aktuelle Agentenaktivität",
      noActivityDesc: "Warten Sie auf den geplanten Dispatcher oder starten Sie manuell einen Agenten.",
      exec: "EXEC",
      payload: "NUTZLAST",
      state: "STATUS",
      noExecutions: "Es wurden noch keine Agentenausführungen aufgezeichnet. Führen Sie einen Agenten aus dem Katalog aus, und dieser Trace wird aus der Live-Datenbank gefüllt."
    }
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
    },
  operationalFreshness: {
    dataLastSynced: "Zuletzt synchronisiert",
    thisSurfaceRenders: "Diese Oberfläche wird aus geschützten Serveraktionen gerendert. Erzwingen Sie eine Aktualisierung, wenn Sie vor der Präsentation einen neuen Lesevorgang benötigen.",
    liveRoute: "Live-Route",
    degradedPosture: "Eingeschränkter / zwischengespeicherter Status",
    autoRefreshPaused: "Automatische Aktualisierung bei schwacher oder Offline-Verbindung pausiert",
    forceRefresh: "Aktualisieren erzwingen",
    unknownAge: "Unbekanntes Alter",
    ago: "vor {time}",

    telemetry: {
      offline: {
        title: "Telemetrie-Heartbeat offline",
        detail: "Es ist kein aktueller Telemetrie-Heartbeat verfügbar, daher sollte die Überwachungsabdeckung als unvollständig betrachtet werden."
      },
      stale: {
        title: "Telemetrie-Heartbeat veraltet",
        detail: "Letztes Signal {age}. Überprüfen Sie die Telemetrie, bevor Sie auf Abdeckungsbehauptungen vertrauen."
      },
      live: {
        title: "Telemetrie-Heartbeat live",
        detail: "Letztes Signal {age} über die überwachten Routen."
      }
    },
    fxRates: {
      missing: {
        title: "Wechselkurse fehlen",
        detail: "Reporting-Book-Kurse sind noch nicht geladen, daher sollten globale Rollups in der Quellwährungsansicht bleiben."
      },
      stale: {
        title: "Wechselkurse müssen aktualisiert werden",
        detail: "Letzte Kursaktualisierung {age}. Aktualisieren Sie die Buchkurse, bevor Sie sich auf globale Ausgabensummen verlassen."
      },
      staleNoDate: {
        title: "Wechselkurse müssen aktualisiert werden",
        detail: "FX-Updates sind noch nicht mit einem Zeitstempel versehen."
      },
      fresh: {
        title: "Wechselkurse geladen",
        detail: "Reporting-Book-Kurse {age} aktualisiert."
      }
    }
  }
} as const;
