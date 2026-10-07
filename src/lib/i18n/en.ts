/**
 * English translation dictionary
 * Keys are organized by component area for maintainability.
 */
export const en = {
  // ── Sidebar ──
  sidebar: {
    procurementOS: "Procurement OS",
    workspace: "Workspace",
    adminConsole: "Admin Console",
    supplierPortal: "Supplier Portal",
    internalWorkspace: "Internal Workspace",
    adminConsoleDesc: "Platform controls, approvals, intelligence, and operating oversight",
    supplierPortalDesc: "Vendor-facing workspace for bids, orders, documents, and requests",
    internalWorkspaceDesc: "Operational sourcing, requisitions, and invoice coordination",
    suppliers: "Suppliers",
    axiomCopilot: "Axiom Copilot",
    aiAgents: "AI Agents",
    analyticsStudio: "Analytics Studio",

    // Section titles
    // Section titles
    sourcing: "Sourcing",
    finance: "Finance",
    resources: "Resources",
    intelligence: "Intelligence",
    operations: "Operations",
    vendorPortal: "Vendor Portal",
    adminControl: "Admin Control",

    // Sourcing links
    partsCatalog: "Parts Catalog",
    sourcingRequests: "Sourcing Requests",
    requisitions: "Requisitions",
    orders: "Orders",
    goodsReceipts: "Goods Receipts",
    exceptionManagement: "Exception Management",
    contracts: "Contracts",
    invoiceRecords: "Invoice Records",
    agreements: "Agreements",

    // Finance links
    invoices: "Invoices",
    inventory: "Inventory",
    transactions: "Transactions",
    contacts: "Contacts",
    savings: "Savings",
    sustainability: "Sustainability",

    // Resources links
    axiomPlaybook: "Axiom Playbook",
    helpSupport: "Help & Support",

    // Admin priority links
    fraudAlerts: "Fraud Alerts",
    telemetry: "Telemetry",
    financialMatching: "Financial Matching",
    spendIntelligence: "Spend Intelligence",
    riskIntelligence: "Risk Intelligence",

    // Admin operational links
    taskInbox: "Task Inbox",
    compliance: "Compliance",
    userManagement: "User Management",
    supportTickets: "Support Tickets",
    auditTrail: "Audit Trail",
    importData: "Import Data",
    adminSettings: "Admin Settings",
    scenarioModeling: "Scenario Modeling",
    supplierEcosystem: "Supplier Ecosystem",

    // Supplier portal links
    myPortal: "My Portal",
    incomingBids: "Incoming Bids",
    activeOrders: "Active Orders",
    myDocuments: "My Documents",
    requestsTasks: "Requests & Tasks",
  },

  // ── Header ──
  header: {
    adminConsole: "Admin Console",
    supplierPortal: "Supplier Portal",
    operationsWorkspace: "Operations Workspace",
    adminSubtitle: "Platform intelligence, controls, approvals, and operating oversight",
    supplierSubtitle: "Vendor-facing RFQs, orders, documents, and requests",
    internalSubtitle: "Internal procurement execution workspace",
    adminConsoleBadge: "Admin Console Session",
    internalUserBadge: "Internal User Session",
  },

  // ── Dashboard ──
  dashboard: {
    adminCommandCenter: "Admin Command Center",
    operationsWorkspace: "Operations Workspace",
    adminSubtitle: "Platform intelligence, approvals, and operational control",
    internalSubtitle: "Operational sourcing and requisition workspace",

    // Stat cards
    purchaseRequests: "Purchase Requests",
    request: "Request",
    internalWorkflow: "Internal workflow",
    submitForApproval: "Submit for approval",
    viewRequisitions: "View Requisitions",
    verifiedNetwork: "Verified Network",
    activeGlobalSuppliers: "Active global suppliers",
    viewSuppliers: "View Suppliers",
    add: "Add",
    activeFunnel: "Active Funnel",
    fulfilled: "Fulfilled",
    active: "Active",
    viewOrders: "View Orders",
    track: "Track",
    warehouseLoad: "Warehouse Load",
    inventoryBtn: "Inventory",
    reorder: "Reorder",

    // Quick actions
    openHelpdesk: "Open Helpdesk",
    supportQueueEscalations: "Support queue and escalations",
    activeLabel: "active",
    allSuppliers: "All Suppliers",
    classificationOnboarding: "Classification, onboarding, and compliance",
    tracked: "tracked",
    openFindings: "Open Findings",
    riskWatchlist: "Risk watchlist and intervention routes",
    critical: "critical",
    allTasks: "All Tasks",
    workflowInbox: "Workflow inbox and approvals",
    open: "open",

    // Risk section
    criticalOpsWatch: "Critical Operations Watch",
    supplierAlert: "supplier alert",
    supplierAlerts: "supplier alerts",
    impactNeedsAttention: "Impact needs attention now.",
    openRiskIntelligence: "Open Risk Intelligence",
    exceptionQueue: "Exception Queue",
    scenarioLab: "Scenario Lab",
    aiFleet: "AI Fleet",

    // Global Operating Controls
    globalOperatingControls: "Global Operating Controls",
    globalControlsDesc: "Multi-currency finance, regional compliance context, and guarded data movement are part of the operating layer, not an afterthought.",
    multiCurrencySpend: "Multi-currency spend",
    multiCurrencyDesc: "Original invoice currency stays intact while user-local FX views and reporting-book rates stay in sync.",
    openFinanceConsole: "Open finance console",
    regionalCompliance: "Regional compliance",
    regionalComplianceDesc: "Policy packs, region tags, evidence coverage, and approval controls stay attached to supplier and contract records.",
    supplierRecordsCompliance: "supplier records can carry compliance scope and evidence.",
    openComplianceRoutes: "Open compliance routes",
    deterministicMatching: "Deterministic matching",
    deterministicMatchingDesc: "Payment release stays tied to PO, receipt, QC, and invoice math before any downstream approval.",
    financeHold: "finance hold",
    financeHolds: "finance holds",
    currentlyNeedReview: "currently need review.",
    openMatchingQueue: "Open matching queue",
    guardedImports: "Guarded imports",
    guardedImportsDesc: "Admin-only dry runs, schema validation, referential checks, and post-import resync protect the operating dataset.",
    useDryRun: "Use dry-run first, then commit only the rows that clear validation.",
    openControlledImport: "Open controlled import",
    operationalTruth: "Operational truth",

    // AI Fleet section
    sharedDispatcher: "Shared dispatcher and recovery routes",
    aiExecutionDesc: "AI execution and route recovery live in the main workspace.",
    launchAgentDesc: "Launch agent runs, coordinated recovery bundles, and linked follow-up routes without leaving the dashboard.",
    openAIFleet: "Open AI Fleet",
    riskConsole: "Risk Console",

    // Bottom sections
    operationalWorkspace: "Operational Workspace",
    operationalWorkspaceDesc: "Use requisitions for internal purchasing and the shared support center for help.",
    openRequisitions: "Open Requisitions",
    helpSupportBtn: "Help & Support",
    enterpriseAnalyticsNote: "Enterprise spend analytics, telemetry, and supplier risk monitoring remain limited to admin sessions.",
    recentProcurement: "Recent Procurement",
    recentProcurementDesc: "Latest purchase orders and status updates.",
    riskIntelligenceTitle: "Risk Intelligence",
    highPriorityInterventions: "High-priority interventions required.",
    interventionNeeded: "Intervention needed",
    criticality: "Criticality",
    warningRange: "Warning range",
    monitorClosely: "Monitor closely",
    allSuppliersWithinLimits: "All suppliers within safe risk limits.",
  },

  // ── Mobile Navigation ──
  mobileNav: {
    navigation: "Navigation",
    subtitle: "Everything stays reachable on laptop widths.",
    openNavigation: "Open navigation",
  },

  // ── Common ──
  common: {
    financeSettingsReview: "Finance settings review required",
    telemetryPending: "Telemetry evidence pending",
    telemetryNotAvailable: "Telemetry freshness is not available yet.",
    fxNotAvailable: "FX reporting-book freshness is not available yet.",
    aiDependencyNotAvailable: "AI dependency posture is not available yet.",
  },
  copilot: {
    welcomeMessage: "Hello! I answer from Axiom's live workspace, seeded operating knowledge, and uploaded PDF, CSV, TXT, JSON, or Excel files.",
    welcomeMessageShort: "Hello! Ask about live Axiom data, operating workflows, or upload a document to parse.",
    fileTooLarge: "File too large. Maximum size is 10 MB.",
    unsupportedFileType: "Unsupported file type. Upload PDF, CSV, TSV, TXT, JSON, XLSX, or XLS files.",
    failedToReadFile: "Failed to read file. Please try again.",
    failedToRespond: "Copilot failed to respond. Please try again.",
    failedToRespondDetailed: "Axiom Copilot could not complete that request cleanly. Please retry, or ask a narrower question and I will answer from the current workspace snapshot.",
    title: "Axiom Copilot",
    subtitle: "Ask grounded questions against suppliers, parts, contacts, invoices, orders, and parsed business documents.",
    clearSession: "Clear Session",
    analyzingData: "Copilot is analyzing your data...",
    inputPlaceholder: "Ask about Axiom workflows, live data, or upload a file to analyze...",
  },
  suppliers: {
    workspaceTitle: "Supplier Workspace",
    workspaceSubtitle: "Classification, onboarding, compliance coverage, and supplier risk in one operating view.",
    refreshAbc: "Refresh ABC",
    openEcosystem: "Open Ecosystem",
    addNew: "Add new",
    searchPlaceholder: "Search by supplier name, country, ABC class, or score...",
    allCountries: "All countries",
    allAttentionLevels: "All attention levels",
    requiresAction: "Requires action",
    goodStanding: "Good standing",
    table: {
      supplier: "Supplier",
      abc: "ABC",
      risk: "Risk",
      performance: "Performance",
      spend: "Spend (YTD)",
      compliance: "Compliance",
      status: "Status",
      actions: "Actions",
    },
    sections: {
      general: "General Overviews",
      classification: "Classification",
      classificationDesc: "Volume, ABC, and trust posture.",
      certificates: "Certificates & Documents",
      certificatesDesc: "Compliance coverage and record quality.",
      performance: "Performance",
      performanceDesc: "OTIF, quality, and active order load.",
      onboarding: "Onboarding",
      potential: "Potential Suppliers",
      potentialDesc: "Prospects not yet qualified.",
      qualification: "In Qualification",
      qualificationDesc: "Suppliers in onboarding flow.",
      onboarded: "Onboarded Suppliers",
      onboardedDesc: "Approved network ready to transact.",
      suspended: "Suspended / Rejected",
      suspendedDesc: "Stopped or rejected relationships.",
      riskEsg: "Risk & ESG",
      riskDevelopment: "Risk Development",
      riskDevelopmentDesc: "Operational and financial exposure.",
      watchlist: "Suspicious Suppliers",
      watchlistDesc: "High-risk or low-trust suppliers.",
      incidents: "Public Incidents",
      incidentsDesc: "Suppliers above critical risk threshold.",
    },
    cards: {
      volume: "Current year volume",
      volumeDesc: "Live order value in the current filtered workspace.",
      onboarding: "Onboarding queue",
      onboardingDesc: "Suppliers still moving through qualification and onboarding.",
      highRisk: "High-risk watchlist",
      highRiskDesc: "Suppliers currently above the intervention threshold.",
      compliance: "Compliance gaps",
      complianceDesc: "Suppliers with thin certification or control coverage.",
    },
    controlTable: {
      title: "Supplier control table",
      description: "Filter by lifecycle, risk, geography, and compliance without leaving the supplier workspace.",
      rows: "rows",
      searchPlaceholder: "Search suppliers, email, code, or category...",
      allCountries: "All countries",
      allViews: "All views",
      reset: "Reset",
      emptyTitle: "No suppliers match this view",
      emptyDesc: "Adjust the workspace section or clear filters to broaden the supplier set.",
      headers: {
        supplier: "SUPPLIER",
        country: "COUNTRY",
        orderVolume2024: "ORDER VOLUME 2024",
        orderVolume2025: "ORDER VOLUME 2025",
        abc: "ABC",
        trustCompliance: "TRUST & COMPLIANCE",
        lifecycle: "LIFECYCLE",
        actions: "ACTIONS",
      },
      badges: {
        unassigned: "Unassigned",
        prospect: "Prospect",
        active: "Active",
        suspended: "Suspended",
        terminated: "Terminated",
      }
    }
  },
  rfqs: {
    title: "Sourcing Requests (RFQs)",
    subtitle: "Manage quotations, supplier invitations, and sourcing progress with quick filters.",
    searchLabel: "Search",
    searchPlaceholder: "Title, description, supplier",
    statusLabel: "Status",
    statusOptions: {
      all: "All statuses",
      draft: "Draft",
      open: "Open",
      closed: "Closed",
      cancelled: "Cancelled",
    },
    suppliersLabel: "Suppliers",
    suppliersOptions: {
      all: "All RFQs",
      invited: "With suppliers",
      unassigned: "Without suppliers",
    },
    sortLabel: "Sort",
    sortOptions: {
      newest: "Newest first",
      oldest: "Oldest first",
      title: "Title A-Z",
      items: "Most items",
      suppliers: "Most suppliers",
    },
    reset: "Reset",
    results: "results",
    result: "result",
    created: "Created",
    archivedItemDetail: "archived item detail unavailable",
    items: "items",
    item: "item",
    suppliersCount: "suppliers",
    supplierCount: "supplier",
    emptyTitle: "No sourcing requests found",
    emptyDesc: "Create your first RFQ to start automated supplier selection.",
    emptyFilterDesc: "Adjust the filters to widen the result set.",
    newRequest: "New Sourcing Request",
    viewDetails: "View Details",
    noDescription: "No description provided.",
    aiSuppliers: "AI Selected Suppliers:",
    unknown: "Unknown",
    noneInvited: "None invited yet",
    liveBidMode: "Live bid mode keeps supplier identities masked here until award or closure.",
  },
  rfqActions: {
    launchTitle: "Launch Sourcing Event",
    launching: "Launching...",
    launchSuccess: "Sourcing event launched",
    launchEmailSent: "Invited suppliers can now submit live quotes in the portal and receive the launch email.",
    launchWarning: "Suppliers can now quote in the portal. Email status: {warning}",
    launchError: "Failed to launch sourcing event",
    compare: "Compare",
    prepTitle: "Prep Negotiation",
    preparing: "Preparing...",
    prepSuccess: "Negotiation workbench prepared",
    prepDesc: "Workflow task created with {gap} still open against should-cost.",
    prepError: "Unable to prepare the negotiation workflow",
  },
  orders: {
    title: "Procurement Orders",
    subtitle: "Manage purchase orders and RFQs.",
    activeOrders: "Active Orders",
    activeOrdersDesc: "Recent purchase orders and their fulfillment status.",
    headers: {
      orderId: "Order ID",
      supplier: "Supplier",
      status: "Status",
      amount: "Amount",
      action: "Action",
    },
    empty: "No orders found.",
    unknownSupplier: "Unknown Supplier",
    na: "N/A",
  },
  orderDetail: {
    back: "Back to Orders",
    title: "Order Details",
    id: "ID",
    supplierInfo: {
      title: "Supplier Information",
      framework: "Framework Agreement"
    },
    summary: {
      title: "Order Summary",
      placedOn: "Placed On",
      na: "N/A",
      source: "Source",
      requisition: "Requisition",
      standardTitle: "Standard",
      standardDesc: "Global Procurement Standard Compliant",
      totalAmount: "Total Amount"
    },
    logistics: {
      title: "Logistics & Tracking",
      carrier: "Carrier",
      tracking: "Tracking",
      eta: "Estimated Arrival",
      noTracking: "No tracking information provided."
    },
    items: {
      title: "Items Ordered",
      partName: "Part Name",
      sku: "SKU",
      quantity: "Quantity",
      unitPrice: "Unit Price",
      avgPrice: "Avg Price",
      subtotal: "Subtotal"
    }
  },
  orderActions: {
    operations: "Order Operations",
    viewDetails: "View Details",
    submitApproval: "Submit for Approval",
    sendSupplier: "Send to Supplier",
    cancelOrder: "Cancel Order",
    recordReceipt: "Record Receipt",
    addInvoice: "Add Invoice",
    deleteOrder: "Delete Order",
    deleteCaution: "Caution: Deleting an order is permanent and removes all associated items. Continue?",
    successUpdate: "Order status updated",
    successDelete: "Order deleted",
    errorUpdate: "Failed to update",
    errorDelete: "Failed to delete"
  },
  enterpriseReadiness: {
    loading: "Loading enterprise readiness...",
    title: "Enterprise Readiness",
    description: "Supplier network quality, integration health, governance coverage, and proof of operational reliability.",
    refresh: "Refresh Audit",
    overall: "Overall",
    overallSubtitle: "suppliers tracked",
    network: "Supplier Network",
    networkSubtitle: "onboarding suppliers are ready for approval",
    integrations: "Integrations",
    integrationsSubtitle: "active endpoints | {count} source systems",
    governance: "Governance",
    governanceSubtitle: "approval policies | {count} tolerances",
    reliability: {
      title: "Reliability Proof",
      dataConfidence: "Data Confidence",
      dataConfidenceSub: "average supplier intelligence confidence",
      webhook: "Webhook Reliability",
      webhookSub: "recent deliveries observed",
      import: "Import Reliability",
      importSub: "recent import job(s)",
      compliance: "Compliance evidence coverage",
      expired: "Expired or overdue obligations",
      overdue: "Overdue supplier requests"
    },
    priorityActions: {
      title: "Priority Actions",
      none: "No priority gaps were detected in the latest audit."
    },
    gaps: {
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
      lowWebhookReliability: "Webhook delivery failure rate suggests underlying connectivity issues.",
      missingContact: "Primary supplier contact is missing.",
      missingCategories: "Supply categories have not been classified.",
      missingLocation: "Location coverage is incomplete.",
      missingComplianceMarkers: "No certification or human-rights attestation is recorded.",
      missingFinancialBaseline: "Financial baseline has not been established.",
      missingPerformanceBaseline: "Performance baseline has not been established.",
      missingDocuments: "No supplier documents have been uploaded.",
      complianceWithoutEvidence: "Compliance obligations exist without evidence.",
      overdueRequestsCount: "{count} supplier request(s) are overdue.",
      overdueComplianceCount: "{count} compliance obligation(s) are overdue.",
      escalatedTasksCount: "{count} workflow task(s) are escalated.",
    },
    attentionSuppliers: {
      title: "Suppliers Needing Attention",
      confidence: "Confidence"
    }
  },
  parts: {
    title: "Parts Intelligence",
    subtitle: "Strategic inventory management and market trend analysis.",
    cards: {
      totalInventory: "Total Inventory",
      lowStock: "Low Stock",
      critical: "Critical",
      categories: "Categories",
    },
    linkedCoverage: "Linked Transaction Coverage",
    orderLinks: "Order Links",
    invoiceLinks: "Invoice Links",
    topLinkedParts: "Top Linked Parts",
    orders: "Orders",
    invoices: "Invoices",
    rfqs: "RFQs",
    table: {
      title: "Parts Inventory",
      subtitle: "Review stock health, benchmark pricing signals, and linked sourcing activity in one place.",
      searchPlaceholder: "Search by part, SKU, or category...",
      sku: "SKU",
      partName: "PART NAME",
      category: "CATEGORY",
      stock: "STOCK",
      currentPrice: "CURRENT PRICE",
      marketTrend: "MARKET TREND",
      status: "STATUS",
      actions: "ACTIONS",
      emptyTitle: "No parts found",
      emptyDesc: "Try adjusting your search or filters.",
    },
  },
  requisitions: {
    titleAdmin: "Internal Requisitions",
    titleUser: "My Requisitions",
    subtitleAdmin: "P2P Workflow: Manage internal purchase requests and approvals.",
    subtitleUser: "Track the purchase requests you have raised and their current approval state.",
    cards: {
      totalAdmin: "Total Requests",
      totalUser: "My Requests",
      totalAdminDesc: "Across all departments",
      totalUserDesc: "Raised by your account",
      pending: "Pending Approval",
      pendingAdminDesc: "Awaiting budget verification",
      pendingUserDesc: "Waiting for admin review",
      approved: "Approved Volume",
      approvedDesc: "Ready for conversion to PO",
    },
    table: {
      title: "Requisition Ledger",
      subtitle: "Comprehensive audit trail of internal procurement requests.",
      id: "ID",
      titleDept: "Title / Department",
      estAmount: "Est. Amount",
      status: "Status",
      requestedOn: "Requested On",
      actions: "Actions",
      unassigned: "Unassigned",
      empty: "No requisitions found. Start by creating an internal request.",
    },
  },
  adminAnalytics: {
    title: "Procurement analytics board",
    subtitle: "Live spend, category concentration, and sourcing geography from the current operating dataset.",
    spendVolume: "Spend volume",
    spendVolumeDesc: "Monthly posted order value across the live operating dataset.",
    spendEmpty: "Spend analytics will unlock once posted orders are available.",
    categoryVolume: "Category volume",
    categoryVolumeDesc: "Current portfolio concentration across spend categories.",
    categoryEmpty: "Category concentration appears once order lines are mapped.",
    countryVolume: "Country volume",
    countryVolumeDesc: "Top geographies ranked by sourced order volume.",
    ordersCount: "orders",
    countryEmpty: "Country-level sourcing volume will appear once supplier geography is populated.",
    openAnalytics: "Open analytics",
  },
  adminAnalyticsHub: {
    title: "Intelligence Hub",
    subtitle: "Enterprise procurement analytics with recorded-value reporting and multi-dimensional filtering",
    initializing: "Initializing Intelligence Hub...",
    filters: "Filters",
    export: "Export",
    apply: "Apply",
    reset: "Reset",
    trendMonthly: "monthly",
    trendQuarterly: "quarterly",
    trendYearly: "yearly",
    clearAll: "Clear all",
    noOptions: "No options",
    filterLabels: {
      from: "From",
      to: "To",
      region: "Region",
      supplier: "Supplier",
      category: "Category",
      invoiceStatus: "Invoice Status",
      orderStatus: "Order Status",
      invoiceStatuses: {
        pending: "Pending",
        matched: "Matched",
        disputed: "Disputed",
        paid: "Paid"
      },
      orderStatuses: {
        draft: "Draft",
        pending_approval: "Pending Approval",
        approved: "Approved",
        rejected: "Rejected",
        sent: "Sent",
        fulfilled: "Fulfilled",
        cancelled: "Cancelled"
      }
    },
    kpis: {
      totalSpend: "Total Spend",
      savings: "Savings",
      savingsRate: "Savings Rate",
      avgOrder: "Avg Order",
      suppliers: "Suppliers",
      orders: "Orders",
      invoices: "Invoices",
      categories: "Categories",
      ordersSubtitle: "orders",
      rateSubtitle: "rate",
      savingsRateSubtitle: "of initial quotes",
      suppliersSubtitle: "active in period",
      categoriesSubtitle: "tracked",
    },
    charts: {
      spendTrend: "Spend & Savings Trend",
      spendTrendDesc: "{view} spend trajectory with savings overlay",
      categoryDist: "Category Distribution",
      categoryDistDesc: "Spend concentration across categories",
      topSuppliers: "Top Suppliers",
      bySpend: "by spend",
      invoiceStatus: "Invoice Status",
      invoiceStatusDesc: "Distribution by status",
      orderStatus: "Order Status",
      orderStatusDesc: "Procurement order distribution",
      spendByRegion: "Spend by Region",
      spendByRegionDesc: "Geographic spend distribution",
      priceVariance: "Price Variance Analysis",
      priceVarianceDesc: "Average initial quote vs actual price over time — gap represents negotiation savings",
      savingsBreakdown: "Savings Breakdown",
      savingsBreakdownDesc: "By negotiation strategy type",
      supplierRisk: "Supplier Risk vs Performance",
      supplierRiskDesc: "Bubble size = spend volume. Top 50 suppliers by spend.",
      scatter: "scatter",
      top5Compare: "Top 5 Supplier Comparison",
      top5CompareDesc: "Multi-dimensional score overlay",
      spendByCountry: "Spend by Country",
      spendByCountryDesc: "Top procurement destinations",
      invoiceVolume: "Invoice Volume by Region",
      invoiceVolumeDesc: "Regional invoice concentration",
      topParts: "Top Articles by Spend",
      topPartsDesc: "Highest value parts with volume and price metrics",
      top15: "Top 15",
      contractPortfolio: "Contract Portfolio",
      contractPortfolioDesc: "Value distribution by contract type",
    },
    footer: "Intelligence Hub — {categories} categories · {suppliers} suppliers · {periods} periods tracked",
    footerFilterActive: " · {count} filter active",
    footerFiltersActive: " · {count} filters active"
  },
  riskIntelligence: {
    aiAssessment: "AI Assessment",
    runDeepDive: "Run Risk Deep-Dive",
    currentRisk: "Current Risk Score: ",
    keyAlerts: "Key Alerts",
    mitigationStrategy: "Mitigation Strategy",
    unrunDesc: "Run the AI deep-dive to analyze performance data, ESG compliance, and financial stability signals.",
    success: "Risk intelligence analysis complete for {name}.",
    fail: "Failed to analyze risk profile",
    error: "An error occurred during risk analysis",
    levels: {
      low: "Low",
      medium: "Medium",
      high: "High",
      critical: "Critical"
    },
    riskSuffix: "Risk"
  },
  geoRiskMap: {
    title: "Global Risk Control Tower",
    monitoringFrom: "Monitoring from",
    noSuppliers: "No supplier geo points available.",
    riskScore: "Risk Score",
    geographicDist: "Geographic Distribution",
    totalSuppliers: "Total Suppliers",
    atRiskClusters: "At Risk Clusters",
    homeCountry: "Home Country",
    baseCurrency: "Base Currency",
    topHotspot: "Top Hotspot",
    regionsAtRisk: "{count} Regions at Risk",
    noActiveHotspots: "No Active Hotspots",
    riskByRegion: "Risk By Region",
    high: "high",
    countryHotspots: "Country Hotspots",
    noCountryData: "No country risk data.",
    legendHome: "Home Base",
    legendLow: "Suppliers (Low Risk)",
    legendMod: "Moderate Risk",
    legendHigh: "High Risk"
  },
  goodsReceipts: {
    title: "Goods Receiving Log",
    subtitle: "Warehouse intake, QC inspection, and three-way match readiness in one place.",
    openException: "Open Exception Management",
    cards: {
      total: "Total Receipts",
      totalDesc: "All receiving events logged",
      passed: "QC Passed",
      passedDesc: "Ready for downstream matching",
      pending: "Pending Review",
      pendingDesc: "Awaiting warehouse or QC follow-up",
      failed: "QC Failed",
      failedDesc: "Requires return, rework, or escalation",
    },
    warehouseLight: "Warehouse Light View",
    warehouseLightDesc: "Compact cards keep receiving usable on smaller laptop widths and on-the-floor screens.",
    inboundLedger: "Inbound Ledger",
    inboundLedgerDesc: "Verified log of deliveries received with inspection outcomes and PO traceability.",
    table: {
      reference: "Reference",
      supplier: "Supplier",
      receivedBy: "Received By",
      timestamp: "Timestamp",
      inspection: "Inspection",
      notes: "Notes",
      action: "Action",
      orderRef: "Order Ref",
      unknownSupplier: "Unknown supplier",
      warehouseNotes: "Warehouse Notes",
      defaultNote: "Receipt verified at warehouse.",
    },
    empty: {
      title: "Zero receiving events logged for this period.",
      desc: "Use \"Record New Delivery\" to log incoming stock and kick off QC.",
    },
    workflow: {
      title: "Receiving Workflow",
      step1: "1. Receive Goods",
      step1Desc: "Log the incoming delivery and connect it to the purchase order the warehouse is unloading.",
      step2: "2. QC Inspection",
      step2Desc: "Warehouse or QA marks the intake as passed, failed, or conditional with notes that procurement can see instantly.",
      step3: "3. Match Readiness",
      step3Desc: "The system validates PO, receipt, and invoice alignment so finance is not guessing later.",
      step4: "4. Payment Release",
      step4Desc: "Only a clean receiving trail should move into matched status and payment release.",
    },
    status: {
      passed: "Passed",
      failed: "Failed",
      conditional: "Conditional",
      pending: "Pending",
    }
  },
  exceptions: {
    title: "Exception Management",
    subtitle: "Quarantine dirty operational records before they become payment errors, supplier failures, or silent data drift.",
    buttons: {
      risk: "Risk intelligence",
      receipts: "Goods receipts",
      invoices: "Invoice records",
    },
    cards: {
      openExceptions: "Open Exceptions",
      openExceptionsDesc: "Dirty records waiting for human or policy resolution",
      releaseBlocks: "Release Blocks",
      releaseBlocksDesc: "Orders held before approval or dispatch",
      receiptQuarantine: "Receipt Quarantine",
      receiptQuarantineDesc: "Warehouse and QC issues still upstream of finance",
      financeHolds: "Finance Holds",
      financeHoldsDesc: "Pending or disputed records still blocked from release",
    },
    prevention: {
      title: "Prevention Rules Live",
      subtitle: "Orders do not rely on warning-only UI. Release, receiving, and finance now follow blocking rules.",
      supplier: "Supplier release",
      supplierDesc: "Suppliers at risk 70+ stay blocked before approval or dispatch.",
      warehouse: "Warehouse quarantine",
      warehouseDesc: "Failed or conditional receipts do not flow quietly into finance matching.",
      finance: "Deterministic finance",
      financeDesc: "Payment release stays tied to PO, receipt, QC, and invoice math instead of AI-only judgment.",
    },
    quarantine: {
      title: "Quarantine Queue",
      subtitle: "Every item below explains what broke, why it is blocked, and which route clears it.",
      whyBlocked: "Why it is blocked",
      nextAction: "Next action",
    },
    empty: {
      title: "No live exceptions right now.",
      desc: "Release blocks, receipt quarantine, and finance holds are currently clear.",
    },
    operationalTruth: {
      title: "Operational Truth",
      subtitle: "Coverage claims stay tied to live evidence instead of blanket percentages.",
      fxRates: "FX book rates",
      fxRatesUnavailable: "FX status unavailable",
      fxRatesDesc: "Reporting-book refresh status is not available.",
      queue: "Queue pressure",
      queueUnavailable: "Queue unavailable",
      queueDesc: "Exception pressure is not available.",
    },
    escalation: {
      title: "Escalation Path",
      subtitle: "Department escalations stay attached to live lead mappings from the workspace directory.",
      desc: "Use the dashboard escalation panel when a blocked supplier, disputed invoice, or warehouse quarantine needs finance, procurement, or ops ownership fast.",
      button: "Open dashboard channels",
    },
    types: {
      supplierBlock: "Release block",
      receiptQuarantine: "Receipt quarantine",
      invoiceDispute: "Invoice dispute",
      financeHold: "Finance hold",
    }
  },
  contracts: {
    title: "Contract Management",
    subtitle: "Monitor compliance, renewals, and framework agreements.",
    cards: {
      active: "Active Contracts",
      activeDesc: "Currently in force",
      expiring: "Expiring (60 days)",
      expiringDesc: "Requires renewal action",
      expired: "Expired",
      expiredDesc: "Needs renewal or closing",
      value: "Total Contract Value",
      valueDesc: "Across all contracts"
    },
    focus: {
      title: "Command bar focus enabled",
      desc: "The selected contract has been moved to the top so the buyer can inspect it without another search."
    },
    card: {
      val: "Val",
      ends: "Ends",
      na: "N/A",
      expiredAgo: "Expired {days}d ago",
      daysLeft: "{days}d left",
      autoRenew: "Auto-renew",
      manualRenew: "Manual renew"
    },
    empty: {
      title: "No contracts found",
      desc: "Get started by creating your first framework agreement or NDA with a supplier."
    }
  },
  invoices: {
    title: "Invoice Management",
    subtitle: "Filter, track and export invoices across all regions.",
    buttons: {
      exceptions: "Exceptions",
      upload: "Upload Invoice",
      refresh: "Refresh",
      filters: "Filters",
      clearAll: "Clear all"
    },
    lens: {
      title: "Currency and review lens",
      desc: "Source invoice amounts stay untouched. The active lens changes display and rollups without rewriting supplier documents or country-specific tax evidence.",
      active: "Active lens",
      activeReporting: "Stable reporting-book rates for finance rollups.",
      activeLocal: "User-local FX view for regional operators and procurement teams.",
      converted: "Converted exposure",
      convertedDesc: "{covered}/{total} visible invoices have active FX coverage in this lens.",
      tax: "Tax and release posture",
      taxTitle: "Source-country review",
      taxDesc: "VAT, GST, and regional evidence stay tied to the original invoice and supplier country. Review the source document before release when tax handling is jurisdiction-sensitive."
    },
    filters: {
      title: "Advanced Filters",
      invoiceNo: "Invoice #",
      status: "Status",
      continent: "Continent",
      country: "Country",
      region: "Region / Zone",
      currency: "Currency",
      fromDate: "From Date",
      toDate: "To Date"
    },
    cards: {
      total: "Total Invoices",
      totalDesc: "Visible records",
      pending: "Pending Review",
      pendingDesc: "Awaiting action",
      matched: "Matched & Verified",
      matchedDesc: "3-way verified",
      review: "Manual Review Queue",
      reviewDesc: "Escalated or low-confidence invoices",
      payable: "Total Payable",
      payableDesc: "In original invoice currencies"
    },
    charts: {
      status: "Status Distribution",
      region: "Amount by Region",
      trend: "Invoice Volume Trend"
    },
    ledger: {
      title: "Invoice Ledger",
      loading: "Loading invoices...",
      found: "{count} invoice(s) found — amounts shown in their original currency",
      empty: "No invoices found matching the current filters.",
      columns: {
        invoiceNo: "Invoice #",
        supplier: "Supplier",
        status: "Status",
        country: "Country",
        region: "Region",
        continent: "Continent",
        date: "Date",
        amount: "Amount",
        actions: "Actions"
      }
    }
  },
  inventory: {
    title: "Inventory",
    subtitle: "Stock Levels & Parts Management",
    actions: {
      createRequisition: "Create Requisition",
      partsCatalog: "Parts Catalog",
      export: "Export",
      selectFormat: "Select Format",
      exportCsv: "Export as CSV",
      exportJson: "Export as JSON",
      adjustStock: "Adjust Stock",
      bulkReorder: "Bulk Reorder",
      reorder: "Reorder",
      manage: "Manage",
      goToPartsCatalog: "Go to Parts Catalog",
    },
    cards: {
      totalSkus: "Total SKUs",
      totalUnits: "total units on hand",
      stockHealth: "Stock Health",
      aboveReorderPoint: "SKUs above reorder point",
      reorderAlerts: "Reorder Alerts",
      belowReorder: "SKUs below reorder threshold",
      outOfStock: "Out of Stock",
      zeroInventory: "SKUs with zero inventory",
    },
    abc: {
      title: "ABC Classification",
      desc: "Inventory value segmentation",
      aDesc: "High-value items (top 20% by spend)",
      bDesc: "Mid-value items (next 30% by spend)",
      cDesc: "Low-value items (remaining 50%)",
      noneDesc: "Unclassified items",
    },
    category: {
      title: "Category Breakdown",
      desc: "Top categories by SKU count",
      empty: "No categories found",
    },
    alerts: {
      title: "Reorder Required",
      desc: "items need immediate attention",
      showing: "Showing",
      of: "of",
      items: "items.",
      viewAll: "View all in Parts Catalog →",
    },
    table: {
      title: "Full Inventory",
      desc: "SKUs with current stock levels",
      emptyTitle: "No parts in inventory yet.",
      emptyDesc: "Add parts via the Parts Catalog to track stock levels.",
      sku: "SKU",
      partName: "Part Name",
      category: "Category",
      abc: "ABC",
      onHand: "On Hand",
      minLevel: "Min Level",
      reorderAt: "Reorder At",
      trend: "Trend",
      status: "Status",
      actions: "Actions",
    },
    messages: {
      exportSuccess: "Inventory exported successfully",
      exportSuccessDesc: "{count} SKUs saved to CSV.",
      exportFail: "Failed to export inventory data",
      jsonComingSoon: "JSON export coming soon",
      adjustModeEnabled: "Inventory adjustment mode enabled. Select a part to modify.",
    },
    status: {
      outOfStock: "Out of Stock",
      critical: "Critical",
      lowStock: "Low Stock",
      inStock: "In Stock"
    },
    trend: {
      rising: "rising",
      falling: "falling",
      stable: "stable"
    }
  },
  // ── Modals & Dialogs ──
  createOrderModal: {
    trigger: "Create Order",
    title: "Create New Order",
    desc: "Build a procurement draft with supplier controls visible before release.",
    selectSupplier: "Select Supplier",
    selectSupplierPlaceholder: "Select a supplier...",
    supplierClear: "Supplier is currently clear for draft creation and release routing.",
    incoterms: "Incoterms",
    incotermsPlaceholder: "e.g. FOB, DAP",
    asn: "ASN Number (Optional)",
    asnPlaceholder: "Advance Shipping Notice",
    orderItems: "Order Items",
    addItem: "Add Item",
    noItems: "No items added yet.",
    part: "Part",
    qty: "Qty",
    estUnitPrice: "Est. Unit Price",
    estOrderValue: "Estimated Order Value",
    cancel: "Cancel",
    creating: "Creating...",
    create: "Create Order",
    success: "Order created",
    fail: "Failed to create order"
  },
  createRfqModal: {
    trigger: "New Sourcing Request",
    title: "Create Sourcing Request",
    desc: "Define your requirements. Our AI will automatically select the best suppliers based on performance and risk.",
    projectTitle: "Project Title",
    projectTitlePlaceholder: "e.g., Q1 Electronics Sourcing",
    projectDesc: "Description (Optional)",
    projectDescPlaceholder: "Short summary of the project",
    partsQuantities: "Parts & Quantities",
    addPart: "Add Part",
    selectPart: "Select Part",
    selectPartPlaceholder: "SKU / Name",
    quantity: "Quantity",
    cancel: "Cancel",
    creating: "Creating...",
    create: "Create & Run AI Selection",
    noPartsError: "Please add at least one part",
    success: "RFQ created! AI has selected the best suppliers.",
    fail: "Failed to create RFQ"
  },
  addInvoiceDialog: {
    trigger: "Add Invoice",
    title: "Log Supplier Invoice",
    desc: "Enter the financial details from the supplier's invoice for Three-Way Matching.",
    invoiceNumber: "Invoice Number",
    invoiceNumberPlaceholder: "INV-2024-001",
    invoiceAmount: "Invoice Amount (₹)",
    amountPlaceholder: "0.00",
    cancel: "Cancel",
    recording: "Recording...",
    record: "Record Invoice",
    success: "Invoice recorded successfully",
    fail: "Failed to add invoice"
  },
  recordReceiptDialog: {
    trigger: "Record Receipt",
    title: "Record Delivery Receipt",
    desc: "Log physical arrival of goods at the warehouse for this order.",
    qcChecklist: "Quality Control Checklist",
    visualInspection: "Visual Inspection Passed (No damage)",
    quantityVerified: "Quantity Verified (Matches PO)",
    documentMatch: "Documents Match (Invoice/ASN)",
    notes: "Receiving & QC Notes",
    notesPlaceholder: "e.g. 5 boxes received, no external damage, verified against packing list.",
    confirm: "Confirm Delivery & QC",
    success: "Goods receipt recorded successfully",
    fail: "Failed to record receipt"
  },
  updateLogisticsDialog: {
    trigger: "Update Tracking",
    title: "Manage Shipment Tracking",
    desc: "Update carrier details and estimated arrival for this order.",
    carrier: "Carrier",
    carrierPlaceholder: "e.g. FedEx, DHL, BlueDart",
    trackingNum: "Tracking Number",
    trackingNumPlaceholder: "e.g. TRK123456789",
    eta: "Estimated Arrival",
    cancel: "Cancel",
    updating: "Updating...",
    update: "Update Logistics",
    success: "Logistics information updated",
    fail: "Failed to update logistics"
  },
  manualInviteDialog: {
    trigger: "Manual Invite",
    title: "Invite Suppliers",
    desc: "Manually select a supplier to participate in this sourcing event.",
    searchPlaceholder: "Search suppliers...",
    risk: "Risk",
    performance: "Performance",
    invite: "Invite",
    inviting: "Inviting...",
    noSuppliers: "No eligible suppliers found.",
    success: "Supplier invited successfully",
    successDescFull: "Portal access and email communication were both sent.",
    successDescPartial: "Portal access is live. Email status: {warning}",
    successDescPortal: "Portal access is live for this supplier.",
    fail: "Failed to invite supplier",
    error: "An error occurred"
  },
  transactionView: {
    title: "Transactions",
    subtitle: "Unified view of Orders, Goods Receipts, Invoices, and Contracts in their recorded currency.",
    tabs: {
      all: "All Transactions",
      orders: "Orders",
      goodsReceipts: "Goods Receipts",
      invoices: "Invoices",
      contracts: "Quantity Contracts"
    },
    filters: {
      search: "Search transactions...",
      exportCsv: "Export CSV"
    },
    table: {
      type: "Type",
      reference: "Reference",
      status: "Status",
      amount: "Amount",
      date: "Date"
    },
    types: {
      order: "Order",
      invoice: "Invoice",
      goodsReceipt: "Goods Receipt",
      contract: "Quantity Contract"
    },
    messages: {
      exported: "Transactions exported"
    }
  },
  contactView: {
    title: "Contacts",
    subtitle: "Manage supplier and partner contact directory.",
    stats: {
      total: "Total Contacts",
      verified: "Verified",
      actionRequired: "Action Required"
    },
    actions: {
      exportCsv: "Export CSV",
      addContact: "Add Contact"
    },
    form: {
      title: "New Contact",
      fullName: "Full Name",
      email: "Email Address",
      phone: "Phone Number",
      company: "Company / Supplier",
      jobTitle: "Job Title",
      country: "Country",
      region: "Region / Zone",
      continent: "Continent",
      currency: "Currency",
      notes: "Notes",
      cancel: "Cancel",
      save: "Save Contact",
      saving: "Saving..."
    },
    filters: {
      search: "Search contacts...",
      allStatuses: "All Statuses",
      allContinents: "All Continents"
    },
    table: {
      name: "Name",
      company: "Company & Role",
      contactInfo: "Contact Info",
      location: "Location",
      status: "Status",
      actions: "Actions",
      setStatus: "Set Status"
    },
    messages: {
      exported: "Contacts exported",
      addSuccess: "Contact added successfully",
      addFail: "Failed to add contact",
      statusUpdated: "Status updated"
    }
  },
  sustainabilityPage: {
    title: "Sustainability & ESG",
    subtitle: "Carbon Footprint / ESG Scores / Compliance",
    suppliersTracked: "Suppliers Tracked",
    carbonFootprint: "Carbon Footprint (tCO2e)",
    totalEmissions: "Total Emissions",
    totalEmissionsDesc: "tCO2e across all scopes",
    scope1: "Scope 1 (Direct)",
    scope1Desc: "Direct supplier emissions",
    scope2: "Scope 2 (Energy)",
    scope2Desc: "Indirect energy emissions",
    scope3: "Scope 3 (Value Chain)",
    scope3Desc: "Value chain emissions",
    esgOverview: "Average ESG Scores",
    esgOverviewDesc: "Across {count} suppliers",
    overallEsg: "Overall ESG",
    environmental: "Environmental",
    social: "Social",
    governance: "Governance",
    renewableShare: "Renewable Share",
    complianceOverview: "Compliance Overview",
    complianceDesc: "Conflict minerals, modern slavery & certifications",
    compliant: "Compliant",
    unknown: "Unknown",
    nonCompliant: "Non-Compliant",
    conflictStatus: "Conflict Minerals Status (OECD/Dodd-Frank)",
    modernSlavery: "Modern Slavery Statements",
    isoCertified: "ISO Certified Suppliers",
    lowestCarbon: "Lowest Carbon Suppliers",
    lowestCarbonDesc: "Fast shortlist for greener sourcing decisions.",
    noCarbonData: "No supplier carbon disclosures have been captured yet.",
    tco2eTotal: "tCO2e total",
    leaderboard: "Supplier ESG Leaderboard",
    leaderboardDesc: "Ranked by overall ESG score - top {count} suppliers",
    noEsgData: "No supplier ESG data yet.",
    noEsgDataDesc: "ESG scores are populated when suppliers are onboarded and audited.",
    table: {
      supplier: "Supplier",
      esg: "ESG",
      env: "Env",
      renewables: "Renewables",
      social: "Social",
      gov: "Gov",
      scope: "Scope 1+2+3",
      conflict: "Conflict Minerals",
      iso: "ISO Certs"
    }
  },
  savingsView: {
    title: "Savings Intelligence",
    subtitle: "Track negotiated savings, cost avoidance, and procurement efficiency without live FX conversion.",
    stats: {
      totalSavings: "Total Savings",
      totalSavingsDesc: "Negotiated below initial quote",
      actualSpend: "Actual Spend",
      actualSpendDesc: "Total procurement spend",
      savingsRate: "Savings Rate",
      savingsRateDesc: "Average percentage saved",
      ordersWithSavings: "Orders w/ Savings",
      ordersWithSavingsDesc: "Transactions optimized"
    },
    actions: {
      exportCsv: "Export"
    },
    charts: {
      savingsBySupplier: "Savings by Supplier",
      savingsBySupplierDesc: "Spend vs savings per supplier — gap represents procurement efficiency",
      savingsTrend: "Monthly Savings Trend",
      savingsTrendDesc: "Savings trajectory with spend overlay",
      savingsByType: "Savings by Type",
      savingsByTypeDesc: "Negotiation, volume discount, strategic sourcing",
      spend: "Spend",
      savings: "Savings",
      month: "Month"
    },
    lists: {
      topSavingsTransactions: "Top Savings Transactions",
      topSavingsTransactionsDesc: "Orders with highest negotiated savings",
      noSavingsData: "No savings data yet. Add initial quotes to orders to track savings.",
      saved: "saved",
      type: "Type"
    },
    messages: {
      exported: "Savings report exported"
    }
  },
  sustainabilityView: {
    title: "Sustainability & ESG",
    subtitle: "Monitor supplier environmental impact, certifications, and supply chain risks.",
    stats: {
      avgEsgScore: "Average ESG Score",
      avgEsgScoreDesc: "Across all active suppliers",
      certifiedSuppliers: "Certified Suppliers",
      certifiedSuppliersDesc: "Hold valid ISO/EcoVadis",
      highRisk: "High Risk Suppliers",
      highRiskDesc: "Require immediate audit",
      scope3: "Scope 3 Tracking",
      scope3Desc: "Emissions monitored"
    },
    actions: {
      exportCsv: "Export Report",
      requestAudit: "Request Audit"
    },
    charts: {
      esgDistribution: "ESG Score Distribution",
      riskCategories: "Risk Categories",
      compliance: "Compliance Map"
    },
    table: {
      supplier: "Supplier",
      esgScore: "ESG Score",
      emissions: "Emissions (tCO2e)",
      status: "Status",
      lastAudit: "Last Audit",
      compliant: "Compliant",
      atRisk: "At Risk",
      critical: "Critical"
    },
    messages: {
      exported: "Sustainability report exported"
    }
  },
  docsPage: {
    playbook: "AXIOM PLAYBOOK",
    needExtraHelp: "Need extra help?",
    copilotHelpDesc1: "Use the ",
    copilotHelpDesc2: "Axiom Copilot",
    copilotHelpDesc3: " for real-time natural language answers about your specific data.",
    architectedBy: "Architected & Developed By",
    aiExpert: "AI Expert",
    stepByStep: "Step-by-Step Workflow",
    overviewSummary: "This section provides a high-level summary of your operational metrics. Navigate using the sidebar to explore specific workflow guides.",
    upNext: "Up Next",
    sections: {
      overview: {
        title: "Platform Vision",
        content: "Axiom is a high-performance Procurement Intelligence platform designed to turn fragmented supply chain data into strategic leverage. It moves organizations from reactive 'buying' to proactive 'Strategic Sourcing'.",
        steps: [
            "Visibility — Unified data layer eliminates 'Shadow Spend' by tracking every transaction across all departments.",
            "Intelligence — Native AI integration identifies risk patterns and cost-saving opportunities in real-time.",
            "Accountability — Every single change in the system is cryptographically linked to a user via the Audit Trail.",
            "Efficiency — Automated reorder loops and 3-way matching replace manual administrative overhead.",
            "Strategic Depth — Move beyond transactions to manage Supplier Lifecycle, ESG compliance, and Risk Control Towers."
        ]
      },
      techStack: {
        title: "Architecture & Stack",
        content: "Modern, scalable, and secure. Axiom is built on a 'Full-Stack TypeScript' philosophy for maximum speed and type safety.",
        steps: [
            "Frontend — Next.js 14 (App Router) with React Server Components for near-instant page loads and optimal SEO.",
            "Styling — Vanilla CSS with Tailwind utilities and Framer Motion for high-fidelity, fluid user experiences.",
            "Database — PostgreSQL with Drizzle ORM for type-safe, performance-optimized relational queries and migrations.",
            "State Management — React Hooks and Server Actions for a 'zero-client-side-boilerplate' architecture.",
            "Deployment — Dockerized environment ensuring identical behavior across Local, Staging, and Production environments."
        ]
      },
      aiEngine: {
        title: "AI Intelligence Engine",
        content: "Powering the Axiom Copilot and Automated Insights. We use Retrieval-Augmented Generation (RAG) to keep AI grounded in your actual data snapshot.",
        steps: [
            "LLM Integration — Powered by Google Gemini AI (2.5 Flash) for massive context window and rapid processing.",
            "RAG Architecture — The system injects live DB context (Spend, Risks, Parts) into prompts before AI processing.",
            "Deterministic Fallbacks — If the AI API is unreachable, heuristic-based scrapers maintain core analysis functionality.",
            "Natural Language Queries — 'Axiom Copilot' understands complex procurement intents like 'Show me suppliers with risk > 50'.",
            "Auto-Replenishment AI — Predictive stock monitoring triggers Requisition Drafts based on historical consumption velocity."
        ]
      },
      traceability: {
        title: "Audit & Traceability",
        content: "In procurement, 'Who' and 'When' are as important as 'What'. Axiom maintains an immutable record of every action.",
        steps: [
            "The Activity Log — Every Create, Update, or Delete action is recorded in the `audit_logs` table automatically.",
            "Identity Mapping — Log entries capture User ID, Action Type, Entity ID (Part/PO/Supplier), and a technical summary.",
            "Immutable Trail — Audit logs are write-only to ensure they remains a 'Source of Truth' for annual external audits.",
            "System Telemetry — Real-time performance monitoring tracks AI latency, token usage, and database query health.",
            "Data Versioning — Ability to trace back an Invoice to the specific RFQ and Quote that originated 6 months prior."
        ]
      },
      dataModeling: {
        title: "Data Modeling & Logic",
        content: "Transparent and robust data structures. Our schema is designed for high-performance relational analytics.",
        steps: [
            "Relational Core — Highly normalized schema linking Users, Suppliers, Parts, and Orders with strict Foreign Keys.",
            "Enums & Constraints — Standardized statuses (Active/Blacklisted/Draft) ensure data integrity at the DB level.",
            "Complex Joins — Optimized Drizzle queries handle deep relations like 'Order -> Supplier -> Performance Logs' efficiently.",
            "Telemetry Streams — A dedicated table tracks System Events, Metrics, and Errors for dev-ops visibility.",
            "Flexible Documentation — Documents table handles multi-type attachments (Invoices, Contracts) linked to any entity."
        ]
      },
      foundations: {
        title: "Procurement Workflows",
        content: "Axiom enforces industry-standard procurement cycles to ensure financial discipline and legal compliance.",
        diagram: {
            title: "End-to-End Procurement Flow",
            nodes: ["Material Catalog", "Requisition", "RFQ (Bidding)", "Purchase Order", "Goods Receipt", "Invoice Match", "Payment"]
        },
        steps: [
            "1. Material Catalog — Defining the 'Digital Twin' of every part with SKU, Category, and Benchmark Pricing.",
            "2. Demand Generation — Needs enter as Requisitions. Managers approve based on live department budget visibility.",
            "3. Competitive Sourcing (RFQ) — Multi-vendor bidding (Rule of Three) ensures the organization gets the 'Best Pick'.",
            "4. The Commitment (PO) — Winning quotes become legal Purchase Orders, locking in price, lead time, and terms.",
            "5. Supply Chain Execution — Goods Receipt (GRN) marking at the warehouse triggers the financial downstream flow."
        ]
      },
      compliance: {
        title: "Financial Compliance",
        content: "Closing 'The Loop'. Axiom's matching engine prevents overpayment, fraud, and maverick spend.",
        diagram: {
            title: "3-Way Match Verification",
            nodes: ["Purchase Order", "Goods Receipt", "Supplier Invoice", "Match Engine", "Approved / Disputed"]
        },
        steps: [
            "The 3-Way Match — The system automatically flags discrepancies between PO Price, GRN Quantity, and Invoice Amount.",
            "Dispute Management — Orders with mismatch (Amber status) are locked from payment until a Buyer resolves the data.",
            "Performance Scoring — Suppliers are dynamically graded on delivery accuracy (OIF) and quality consistency.",
            "ESG Validation — Tracking 'Green Energy' usage and Labor Compliance as mandatory gates in the onboarding process.",
            "Risk Control Tower — Real-time monitoring of supplier risk scores based on financial health and delivery history."
        ]
      },
      security: {
        title: "Enterprise Security",
        content: "Multi-layered defense for sensitive financial data. Axiom prioritizes the 'Principle of Least Privilege'.",
        steps: [
            "RBAC Control — Role-Based Access (Admin/User/Supplier) ensures restricted visibility of financial PII.",
            "2FA Enforcement — Two-Factor Authentication via TOTP (Authenticator Apps) for all high-authority accounts.",
            "Secure Auth — Built on Auth.js (NextAuth) using industry-standard JWT and database-backed session logic.",
            "Row-Level Logic — Application-level middleware prevents cross-tenant data access attempts.",
            "Encryption at Rest — Sensitive fields like 2FA secrets and API keys are stored with high-entropy encryption."
        ]
      },
      connectivity: {
        title: "Global Connectivity",
        content: "Axiom isn't just a local app. It bridges the gap between your desktop and the global supply chain.",
        steps: [
            "LocalTunnel Integration — Instantly share your local development instance with remote stakeholders via secure tunnels.",
            "Electron Framework — Portable `.exe` and `.dmg` builds allow Axiom to run as a native desktop application.",
            "Static Optimization — High-performance document serving and caching for large-scale procurement catalogs.",
            "External API Support — Ready for integration with external ERPs (SAP/Oracle) via standard REST patterns."
        ]
      },
      contactsModule: {
        title: "Contacts Module",
        content: "The Contacts directory centralizes supplier-side and internal stakeholder phonebook data with searchable metadata for continent, country, and region.",
        steps: [
            "Unified Directory — Capture Name, Email, Phone, Company, Job Title, and notes in a single indexed table.",
            "Regional Tagging — Every contact can be tagged by Country, Region, Continent, and preferred Currency for faster routing.",
            "Actionable Profiles — In-app messaging threads and status switches reduce handoffs between buyers and category managers.",
            "Exportability — Contacts can be exported to CSV for governance, audits, and cross-system synchronization.",
            "Data Hygiene — Active/Inactive/On Hold lifecycle states keep stale contacts from polluting operational communication."
        ]
      },
      savingsModule: {
        title: "Savings Intelligence",
        content: "Savings Intelligence transforms negotiation outcomes into quantified business impact with transparent formulas and drill-down analytics.",
        steps: [
            "Baseline Capture — The platform stores `initialQuoteAmount` and `totalAmount` at order level for factual savings math.",
            "Core Formula — Realized Savings = max(0, Sum(Initial Quote) - Sum(Final Spend)).",
            "Savings Rate — Savings Rate = Realized Savings / Sum(Initial Quote), expressed as a percentage.",
            "Dimensional Insights — Savings can be sliced by Supplier, Month, and Savings Type (negotiation, volume, strategic).",
            "Decision Support — Top savings orders and supplier-level contribution reveal where sourcing effort yields highest returns."
        ]
      },
      transactionsModule: {
        title: "Transactions Hub",
        content: "The Transactions page creates a single operational ledger for Orders, Goods Receipts, Invoices, and Quantity Contracts.",
        steps: [
            "Unified Feed — Cross-module records are normalized into one timeline with sortable type labels.",
            "Operational Filtering — Users can filter by transaction type, date windows, and reference search terms.",
            "Financial Visibility — Amounts render dynamically in INR or EUR for multinational procurement teams.",
            "Faster Reconciliation — Shared references reduce lookup time during three-way match investigations.",
            "Audit Readiness — CSV exports preserve a point-in-time trail of transactional activity for compliance."
        ]
      },
      supportModule: {
        title: "Help & Support",
        content: "Axiom includes a built-in support workflow with ticketing and knowledge guidance to reduce downtime and user friction.",
        steps: [
            "Ticket Lifecycle — Submit, track, and resolve requests through Open, In Progress, Resolved, and Closed states.",
            "Priority Routing — Low/Medium/High/Critical prioritization enables operational triage.",
            "Support Inbox — Notifications are routed through `pma.axiom.support@gmail.com` for consistent communication.",
            "Knowledge Base — FAQ prompts cover login recovery, imports, currency logic, and module access.",
            "Role Governance — Admins can oversee all tickets while end users only access their own request history."
        ]
      },
      currencyGeo: {
        title: "Currency & Regional Support",
        content: "Cross-region procurement requires localization by geography and currency; Axiom applies this across invoices, contacts, and analytics.",
        steps: [
            "Dual Currency UX — INR/EUR toggles provide immediate executive and operational comparability.",
            "Regional Metadata — Invoices and contacts capture Country, Region, and Continent for risk heatmaps and planning.",
            "Export Consistency — CSV outputs include currency and geography so downstream teams retain context.",
            "Scalable Standardization — Shared dimensions simplify rollups across India and Germany business units.",
            "Future Extension — Exchange-rate feeds can replace fixed conversion when treasury controls are introduced."
        ]
      },
      devops: {
        title: "System Operations",
        content: "Maintaining the engine. Axiom is designed for developer ease and operational stability.",
        steps: [
            "Docker Orchestration — Single-command `docker-compose up` spins up Next.js, Postgres, and Adminer.",
            "Next.js Standalone — Optimized build output for containerized environments to minimize image size.",
            "Database Hygiene — Integrated Reset Utilities allow admins to clear transactional data while preserving configurations.",
            "Real-time Logs — Telemetry-driven error tracking provides deep visibility into server-side failures.",
            "CI/CD Ready — Built-in linting and type-checking ensure code quality remains high during iterative development."
        ]
      },
      sourcingWorkflow: {
        title: "Sourcing Request Workflow",
        content: "A Sourcing Request (RFQ) is the formal process of inviting competitive quotes from qualified suppliers before committing to a purchase. Axiom walks you through each step.",
        diagram: {
            title: "RFQ to PO Flow",
            nodes: ["Create RFQ", "Invite Suppliers", "Collect Quotes", "Compare & Rank", "Award Winner", "Generate PO"]
        },
        steps: [
            "Create New Sourcing Request — Navigate to Sourcing → RFQs → New RFQ. Fill in the Part/SKU, required quantity, target delivery date, and attached specifications.",
            "Supplier Invitation — Add one or more suppliers to the RFQ. Each supplier receives an invitation via their registered email and can respond through the Supplier Portal.",
            "Quote Collection — Suppliers submit their unit price, lead time, and validity period. All quotes are tracked against the original RFQ for a full audit trail.",
            "Quote Comparison — Use the built-in comparison view to rank suppliers by price, lead time, and historical performance score.",
            "Award Decision — Select the winning quote to auto-generate a linked Purchase Order (PO). The rejected suppliers receive notifications.",
            "PO Lifecycle — The PO moves through: Draft → Pending Approval → Approved → Sent to Supplier → Fulfilled (after goods receipt) → Closed."
        ]
      },
      requisitionsWorkflow: {
        title: "Internal Requisitions",
        content: "Internal Requisitions allow any authorized user to request materials or services. They go through an approval workflow before becoming a PO.",
        diagram: {
            title: "Requisition Approval Flow",
            nodes: ["Submit Request", "Pending Approval", "Admin Review", "Approved", "Convert to PO", "Supplier Fulfills"]
        },
        steps: [
            "Submit Requisition — Go to Sourcing → Requisitions → New Requisition. Select the Part/SKU, quantity, urgency, and the department making the request.",
            "Auto-Budget Check — The system validates the request against the department's allocated budget envelope.",
            "Manager Approval — Requisitions above a threshold require manager-level approval. Notifications go to department leads automatically.",
            "PO Conversion — Once approved, Procurement can convert the requisition to a PO with a single click, pre-filling all line items.",
            "Status Tracking — Requisitioners can track approval status in real-time: Draft → Submitted → Under Review → Approved/Rejected → Converted to PO.",
            "Rejection Handling — Rejected requisitions return to the requester with the reason noted, allowing resubmission with corrections."
        ]
      },
      invoiceWorkflow: {
        title: "Invoice Management & 3-Way Match",
        content: "Invoice management in Axiom enforces 3-way matching to prevent fraudulent or erroneous payments. Each invoice must align with its PO and Goods Receipt.",
        diagram: {
            title: "Invoice Lifecycle",
            nodes: ["Invoice Received", "Pending Review", "3-Way Match", "Matched ✓", "Payment Released"]
        },
        steps: [
            "Invoice Receipt — Suppliers submit invoices via the Supplier Portal, or procurement staff manually logs them in Sourcing → Invoice Records.",
            "Currency Integrity — Every invoice preserves its original currency (INR, EUR, USD, etc.). Axiom never auto-converts amounts — what was invoiced is what is shown.",
            "3-Way Match — Admin navigates to Admin → Financial Matching. For each pending invoice, verify: (1) Supplier matches PO, (2) Quantities match GR, (3) Amount matches agreed price.",
            "Match Outcome — Click 'Match' to approve (status → Matched), or 'Dispute' to flag for supplier clarification (status → Disputed).",
            "Payment Release — Only Matched invoices can be moved to 'Paid'. Disputed invoices are frozen until the supplier responds and the admin resolves.",
            "Audit Completeness — Every status change (Pending → Matched → Paid) is logged in the Audit Trail with user ID, timestamp, and invoice reference."
        ]
      },
      processReorders: {
        title: "Process Reorders (Parts Intelligence)",
        content: "The 'Process Reorders' action in Parts Intelligence triggers the automated replenishment workflow for critical and low-stock SKUs.",
        steps: [
            "Stock Monitoring — Axiom continuously compares current stock levels against Min Stock Level and Reorder Point thresholds.",
            "Alert Classification — Parts below Reorder Point are 'Low Stock'; parts below Min Stock Level are 'Critical' (highlighted in red).",
            "Process Reorders Click — Clicking 'Process Reorders' on a critical part opens a pre-filled Requisition with the recommended order quantity (up to max stock level).",
            "Auto-Assignment — The system suggests the supplier with the best performance score and last quoted price for the SKU.",
            "Approval Fast-Track — Reorder requisitions above critical threshold can be auto-approved by admin policy for zero-delay procurement.",
            "Replenishment Loop — Once the PO is fulfilled and goods are received, stock levels automatically update and alerts clear."
        ]
      },
      supplierData: {
        title: "Supplier Data: Tier, ESG, Financial, Compliance",
        content: "Supplier scorecards in Axiom are dynamically computed from transaction history, performance logs, and compliance events — not manual entry.",
        steps: [
            "Tier Classification — Tier 1 (Strategic), Tier 2 (Preferred), Tier 3 (Transactional). Updated by procurement managers based on spend volume and relationship depth.",
            "Financial Health Score — Calculated from: on-time payment rate, invoice dispute rate, order fulfillment rate, and external credit signals (manually entered or API-fed).",
            "ESG Score — Environment, Social, Governance index. Updated via performance log entries tagged as ESG events (e.g., 'Passed ISO 14001 audit', 'CSR Report submitted').",
            "Compliance Status — Tracks certification expiry dates (ISO, SOC2, GDPR, local regulations). Admin can log compliance milestones via Supplier Performance Logs.",
            "Automated Degradation — Repeated disputes, late deliveries, or failed QC inspections progressively lower the performance score automatically.",
            "Manual Overrides — Admin can set scores directly when external audit reports provide authoritative data not captured in transaction logs."
        ]
      },
      riskIntelligence: {
        title: "Risk Intelligence",
        content: "Risk Intelligence gives a real-time view of supply chain vulnerabilities across geopolitical, financial, and operational dimensions.",
        steps: [
            "Risk Score Computation — Each supplier's risk score (0–100) is derived from: financial health, ESG performance, delivery reliability, compliance status, and geographic risk.",
            "Geographic Risk Map — Countries are color-coded: Green = suppliers with low risk (<45), Amber = moderate (45–70), Red = high risk (>70). Only countries with actual suppliers are highlighted.",
            "Risk Categories — Operational Risk (delivery failures), Financial Risk (low health score), ESG Risk (non-compliance), Geopolitical Risk (country risk index).",
            "Intervention Actions — For any high-risk supplier, admin can: open a Sourcing Request to dual-source, add a Performance Log, or place the supplier on watchlist.",
            "Watchlist & Alerts — Suppliers crossing risk thresholds auto-generate alerts visible in the Risk Intelligence panel and the Notification Center.",
            "Reliability of Scores — Risk scores are as reliable as the data entered. Keeping supplier performance logs, QC records, and compliance dates updated directly improves accuracy."
        ]
      },
      aiAgents: {
        title: "AI Agents",
        content: "Axiom's AI agents are resilient, context-aware autonomous workers that analyze your live procurement data and surface actionable intelligence.",
        steps: [
            "Resilience Design — Every agent has a deterministic fallback path: if the Gemini API is unavailable or returns an error, heuristic algorithms compute the same output using rule-based logic.",
            "Context Injection — Before each agent run, the system injects a snapshot of relevant DB records (suppliers, orders, spend, risk) into the prompt for grounded responses.",
            "Available Agents — (1) Spend Optimizer: finds cost-reduction opportunities, (2) Risk Detector: surfaces new supplier risks, (3) Demand Forecaster: predicts reorder dates.",
            "Agent Execution Log — Every agent run is recorded in `agent_executions` with duration, success status, and output summary for full traceability.",
            "Manual Trigger vs Auto — Agents can be manually triggered by admin or set to run on a schedule (daily/weekly) via the Admin → Agents panel.",
            "Output Actions — Agent insights are surfaced as notifications and, where applicable, auto-draft Requisitions or Risk Alerts for admin review."
        ]
      },
      accountManagement: {
        title: "Account Management & Roles",
        content: "Axiom uses a role-based access control (RBAC) system. Account creation is exclusively the admin's responsibility.",
        steps: [
            "Admin Role — Full access: can see, create, edit, and delete across all modules. Can manage users, configure settings, run financial matching, and purge data.",
            "User Role — Operational access: can view all sections and perform day-to-day actions (create orders, log receipts, submit tickets). Cannot access Admin Settings, User Management, or Financial Matching.",
            "Supplier Role — Portal-only access: can view their RFQs, submit quotes, upload invoices, and track purchase orders. Cannot access internal procurement data.",
            "Account Creation — Only the admin can create user accounts via Admin → User Management. Self-registration is disabled for security.",
            "Password Policy — All passwords are bcrypt-hashed (12 rounds). Users can change passwords via Admin Settings → Security. Admins can reset user passwords.",
            "2FA Enforcement — Two-Factor Authentication (TOTP-based) is required for all logins. Admins enable/manage 2FA status from Admin Settings → Security."
        ]
      }
    }
  },
  supportPage: {
    title: "Help & Support",
    subtitle: "Browse common guidance and support contacts in one shared help center.",
    supportGuide: "Support Guide",
    supportGuideDesc: "Frequently asked questions stay available to everyone, while ticket management is restricted to admins.",
    needAdditionalHelp: "Need additional help?",
    needAdditionalHelpDesc: "Use this page to find product guidance first. If your question is still open, contact your administrator or use the support inbox shown above for follow-up.",
    ticketAccess: "Ticket access",
    ticketAccessDescAdmin: "Support tickets and ticket overview data are only visible in the admin support console. You can open it directly from the button above.",
    ticketAccessDescUser: "Support tickets and ticket overview data are only visible in the admin support console. Non-admin users can continue using this page as the shared knowledge guide.",
    faqTitle: "Frequently Asked Questions",
    faqDesc: "Quick answers to the most common questions.",
    supportTicketConsole: "Support Ticket Console",
    faqs: {
      password: {
        q: "How do I reset a lost password?",
        a: "If you cannot log in, contact your system administrator. Axiom does not support self-service password resets for security compliance. Admins can reset passwords via the User Management panel."
      },
      imports: {
        q: "Why did my CSV data import fail?",
        a: "Imports fail if they do not match the required column format or if they violate referential integrity (e.g., trying to import an order for a supplier ID that doesn't exist). Always use the exact headers provided in the sample files and ensure parent records exist."
      },
      currency: {
        q: "Why do some reports show different currency symbols than what I entered?",
        a: "Axiom preserves original transactional currencies (like EUR or GBP) but converts them dynamically using base exchange rates when viewing aggregated dashboards like Spend Analytics, ensuring apples-to-apples comparisons."
      },
      portal: {
        q: "How do suppliers access the portal?",
        a: "Suppliers receive an automated email invitation when they are added to an RFQ or when an account is manually created for them. They log in at the same URL as internal users, but RBAC ensures they only see the Supplier Portal."
      },
      adminOnly: {
        q: "Why can't I see the Admin Settings or Financial Matching panels?",
        a: "Access to system configuration, user management, and critical financial matching workflows is restricted to users with the 'admin' role. If you require access to these functions, please request a role upgrade from your administrator."
      },
      matching: {
        q: "What does an 'Amber' status mean in Financial Matching?",
        a: "Amber indicates a mismatch between the Purchase Order, Goods Receipt, and Supplier Invoice (e.g., quantities or prices differ). These invoices are blocked from payment release until an admin resolves the dispute."
      },
      telemetry: {
        q: "What information is logged in the Audit Trail?",
        a: "Every Create, Update, and Delete action is recorded with the user ID, timestamp, affected entity, and action type. These logs are immutable and designed to support external compliance audits."
      }
    }
  },
  adminFraudAlertsPage: {
    title: "Fraud Detection Alerts",
    subtitle: "AI-detected anomalies requiring investigation",
    critical: "Critical",
    high: "High",
    total: "Total",
    allClear: "All Clear!",
    allClearDesc: "No fraud alerts detected. Your transactions look healthy.",
    indicators: "Indicators",
    suggestedAction: "Suggested Action",
    recently: "Recently",
    alertTypes: {
      duplicate_invoice: "Duplicate Invoice",
      zero_value_order: "Zero-Value Order",
      unusual_amount: "Unusual Amount",
      new_vendor_high_value: "New Vendor High-Value",
      round_number_pattern: "Round Number Pattern",
      segregation_violation: "Segregation of Duties"
    }
  },
  adminTelemetryPage: {
    title: "System Intelligence & Telemetry",
    subtitle: "Deep monitoring of AI performance, API latencies, and technical health.",
    technicalErrors: "Technical Errors",
    technicalErrorsDesc: "Logged in last 30 days",
    avgAiLatency: "Avg AI Latency",
    avgAiLatencyDesc: "End-to-end response time",
    totalDataPoints: "Total Data Points",
    totalDataPointsDesc: "Active instrumentation coverage",
    systemLoad: "System Load",
    stable: "Stable",
    systemLoadDesc: "Operational health metrics",
    recentTelemetry: "Recent Telemetry Stream",
    recentTelemetryDesc: "Real-time technical logs and performance events.",
    table: {
      type: "Type",
      scopeKey: "Scope / Key",
      value: "Value",
      user: "User",
      time: "Time",
      na: "N/A",
      noData: "No telemetry data available yet."
    }
  },
  adminFinancialMatchingPage: {
    title: "Financial Matching",
    subtitle: "Admin console - run deterministic 3-way verification between PO, receipt, and invoice before any release.",
    exceptions: "Exceptions",
    invoiceRecords: "Invoice Records",
    refresh: "Refresh",
    awaitingReview: "Awaiting Review",
    awaitingReviewDesc: "Invoices pending 3-way match",
    matchedPaid: "Matched / Paid",
    matchedPaidDesc: "3-way match verified",
    disputed: "Disputed",
    disputedDesc: "Requires resolution",
    manualReviewQueue: "Manual Review Queue",
    manualReviewQueueDesc: "Blocked until a human signs off",
    totalInvoices: "Total Invoices",
    totalInvoicesDesc: "In current filter",
    dualApprovalQueue: "Dual-Approval Override Queue",
    dualApprovalQueueDesc: "A requester cannot approve their own finance override. Holds and payment reversals need a second approver before the invoice state can change.",
    noOverrides: "No overrides pending dual-approval.",
    invoice: "Invoice",
    requestedBy: "Requested by",
    approve: "Approve",
    reject: "Reject",
    requestTypes: {
      place_hold: "Place Hold",
      clear_hold: "Clear Hold",
      payment_reversal: "Payment Reversal"
    },
    all: "All",
    pending: "Pending",
    matched: "Matched",
    paid: "Paid",
    searchPlaceholder: "Search invoice #...",
    loading: "Loading...",
    invoiceMatchingQueue: "Invoice Matching Queue",
    invoiceMatchingQueueDesc: "{count} invoice(s). Run rules before status updates, dispute exceptions, and mark an invoice paid only after a clean match.",
    table: {
      invoiceNum: "Invoice #",
      supplier: "Supplier",
      amount: "Amount",
      status: "Status",
      confidence: "Confidence",
      date: "Date",
      controlActions: "Control Actions",
      na: "N/A",
      noBlockers: "No open review blockers.",
      runRules: "Run Rules",
      dispute: "Dispute",
      escalate: "Escalate",
      holdActive: "Hold Active",
      locked: "Locked",
      approvalPending: "Approval Pending",
      requestHoldRelease: "Request Hold Release",
      requestHold: "Request Hold",
      markPaid: "Mark Paid",
      reversed: "Reversed",
      archived: "Archived",
      requestReversal: "Request Reversal",
      noInvoicesTitle: "No invoices match the current filters.",
      noInvoicesDesc: "Financial Matching only processes supplier invoices. Goods receipts unlock three-way match validation, but they do not appear in this queue until an invoice is recorded against the order.",
      openInvoiceRecords: "Open Invoice Records",
      reviewSourceOrders: "Review Source Orders"
    },
    howItWorks: {
      title: "How 3-Way Match Works",
      po: "1. Purchase Order (PO)",
      poDesc: "Verify the invoice supplier, items, and quantities match the original purchase order approved in Axiom.",
      gr: "2. Goods Receipt",
      grDesc: "Confirm the physical goods were recorded by the warehouse and passed all QA/QC checkpoints.",
      inv: "3. Invoice & Math",
      invDesc: "Validate that the supplier invoice totals align mathematically with the PO and the received goods."
    },
    dialogs: {
      recordOverride: "Record Override Reason",
      recordOverrideDesc: "Enter the reason to {action} for this invoice. This will be logged in the audit trail.",
      reasonLabel: "Reason",
      reasonPlaceholder: "Describe the business justification...",
      cancel: "Cancel",
      submitRequest: "Submit Request",
      notes: "Notes",
      notesPlaceholder: "Decision notes...",
      reversalRef: "Reversal Reference / Journal ID",
      reversalRefPlaceholder: "e.g. JV-2024-001",
      submitDecision: "Submit Decision",
      approveTitle: "Approve Override Request",
      rejectTitle: "Reject Override Request",
      approveDesc: "Provide a note for this approval. It will be recorded in the audit trail.",
      rejectDesc: "Provide a reason for this rejection."
    },
    toasts: {
      runMatchFailed: "Failed to run deterministic matching",
      matchPassed: "Deterministic match passed",
      matchPassedDesc: "PO, receipt, QC, and invoice evidence now align.",
      matchBlocked: "Invoice remains blocked",
      matchBlockedDesc: "The rule engine kept this invoice in review.",
      disputeFailed: "Failed to move invoice to dispute",
      disputed: "Invoice flagged as disputed - supplier will be notified",
      markPaidFailed: "Failed to mark invoice as paid",
      markedPaid: "Invoice marked as paid",
      escalateFailed: "Failed to route invoice to manual review",
      reviewRefreshed: "Review task refreshed",
      reviewRefreshedDesc: "An existing invoice review task was reopened in the queue.",
      escalated: "Escalated for review",
      escalatedDesc: "A manual validation task now blocks the status change until the review task is closed.",
      updateFailed: "Failed to update invoice",
      overrideRequestFailed: "Failed to route override request",
      dualApprovalSubmitted: "Dual approval request submitted",
      dualApprovalSubmittedDesc: "A second finance approver must now approve or reject this request.",
      reviewOverrideFailed: "Failed to review override request",
      dualApprovalRecorded: "Dual approval recorded",
      overrideRejected: "Override request rejected"
    }
  },
  invoiceReviewDialog: {
    reviewOriginal: "Review Original",
    title: "Invoice review for",
    desc: "Side-by-side review keeps the source document visible before finance release, dispute resolution, or payment approval.",
    confidence: "Confidence",
    supplier: "Supplier",
    unknownSupplier: "Unknown supplier",
    invoiceAmount: "Invoice amount",
    country: "Country",
    region: "Region",
    unspecified: "Unspecified",
    recordedAt: "Recorded at",
    unknown: "Unknown",
    reviewPosture: "Review posture",
    fraudAlerts: "Fraud alerts",
    humanTasks: "Human tasks",
    currentSignals: "Current review signals",
    noBlockers: "No active review blockers are attached to this invoice right now.",
    lineItems: "Line items",
    line: "Line",
    qty: "Qty",
    unit: "Unit",
    total: "Total",
    noStructuredItems: "Structured line items are not attached to this invoice yet.",
    originalDocument: "Original document",
    originalDocumentDesc: "Always review the source before releasing payment or clearing a dispute.",
    openRawFile: "Open raw file",
    noDocument: "No original document is attached yet. Upload or link the supplier source file before using this invoice for downstream release decisions."
  },
  adminRiskPage: {
    title: "Risk & Compliance Intelligence",
    subtitle: "Real-time monitoring of ESG, financial, and operational supply chain risks.",
    criticalRisks: "Critical Risks",
    requiringAttention: "Requiring immediate attention",
    networkHealth: "Network Health Score",
    stable: "Stable",
    avgEsg: "Avg ESG Performance",
    portfolioTarget: "Portfolio ESG Target: 75+",
    complianceRate: "Compliance Rate",
    avgPortfolioScore: "Avg Portfolio ESG Score",
    esgTracking: "ESG Tracking (Sustainability)",
    esgTrackingDesc: "Monitoring environmental and social impact scores.",
    activeMonitoring: "Active Monitoring",
    allSuppliersMeetEsg: "All suppliers meet ESG benchmarks.",
    financialWatchlist: "Financial Health Watchlist",
    financialWatchlistDesc: "Live credit monitoring and liquidity risk assessment.",
    creditActive: "Credit Active",
    financialHealth: "Financial Health:",
    exceptional: "Exceptional",
    strong: "Strong",
    fair: "Fair",
    distressed: "Distressed",
    score: "Score:",
    liquidity: "Liquidity:",
    volatile: "Volatile",
    aiRiskIntelligence: "AI-Driven Risk Intelligence",
    activeAnalysis: "Active Analysis",
    noCriticalRisk: "No critical risk disruptions detected in the active supplier network.",
    strategicInsight: "Strategic Insight",
    portfolioDiversification: "Portfolio Diversification",
    portfolioDiversificationDesc: "Axiom detected {count} suppliers in high-risk zones. Recommendation: Review alternative source options.",
    exploreSourcing: "Explore Sourcing",
    environmentalCompliance: "Environmental compliance verification active."
  },
  telemetry: {
    values: {
      error: "Error",
      event: "Event",
      metric: "Metric",

      Security: "Security",
      ClientErrorBoundary: "Client Error Boundary",
      Sourcing: "Sourcing",
      OrderManagement: "Order Management",
      SpendAnalysis: "Spend Analysis",
      AxiomCopilot: "Axiom Copilot",
      SupplierManagement: "Supplier Management",
      FinancialCompliance: "Financial Compliance",
      AgentOrchestrator: "Agent Orchestrator",
      AgentExecution: "Agent Execution",
      AgentRecommendation: "Agent Recommendation",
      RecommendationReview: "Recommendation Review",

      root: "Root",
      Login_Success: "Login Success",
      login_success: "Login Success",
      login_failed_user_not_found: "Login Failed (User Not Found)",
      login_failed_supplier_portal_locked: "Login Failed (Supplier Portal Locked)",
      login_failed_invalid_2fa: "Login Failed (Invalid 2FA)",
      login_failed_wrong_password: "Login Failed (Wrong Password)",
      oauth_blocked_2fa_enabled: "OAuth Blocked (2FA Required)",

      rfq_conversion_value: "RFQ Conversion Value",
      rfq_conversion_competitive_savings: "RFQ Conversion Competitive Savings",
      rfq_conversion_should_cost_savings: "RFQ Conversion Should-Cost Savings",
      rfq_converted_successfully: "RFQ Converted Successfully",
      rfq_conversion_failed: "RFQ Conversion Failed",

      validateThreeWayMatch: "Validate Three-Way Match",
      three_way_match_success: "Three-Way Match Success",
      three_way_match_pending: "Three-Way Match Pending",
      match_validation_error: "Match Validation Error",

      analyzeSpend: "Analyze Spend",
      potential_savings: "Potential Savings",

      processQuery: "Process Query",
      meta_answer: "Meta Answer",
      invoice_lookup: "Invoice Lookup",
      workspace_answer: "Workspace Answer",
      knowledge_answer: "Knowledge Answer",
      fallback_answer: "Fallback Answer",
      function_call_success: "Function Call Success",
      query_success: "Query Success",
      query_failed: "Query Failed",
      document_function_call: "Document Function Call",
      document_parsed: "Document Parsed",
      document_parse_failed: "Document Parse Failed",

      abc_analysis_completed: "ABC Analysis Completed",
      abc_analysis_failed: "ABC Analysis Failed",

      unknown_route: "Unknown Route",
    }
  },
  adminTasksPage: {
    title: "Task Inbox",
    subtitle: "Workflow tasks, assignments, escalations, and SLA tracking across procurement objects.",
    queueSafeView: "Queue-safe view loads summary counts first and then the latest 200 tasks so heavy admin traffic does not force a full-table render.",
    openTasks: "Open Tasks",
    inProgress: "In Progress",
    overdue: "Overdue",
    completed: "Completed",
    loadWindow: "Load window",
    loadWindowDesc: "Latest 200 tasks per request",
    hotPath: "Hot path",
    hotPathDesc: "Priority + due date sort stays server-side",
    opNote: "Operational note",
    opNoteDesc: "Use summary counts for full backlog health, not raw list length.",
    allTasks: "All Tasks",
    noTasks: "No tasks yet. Tasks are created automatically from workflow actions.",
    activeQueue: "Active Queue",
    noActiveTasks: "No active tasks remain after reconciliation.",
    resolvedRecently: "Resolved Recently",
    noResolvedTasks: "No resolved tasks yet.",
    toAssignee: "to",
    due: "Due:",
    next: "Next:"
  },
  compliancePolicyPacks: {
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
  },
  adminCompliancePage: {
    title: "Compliance Intelligence",
    subtitle: "Deadline-driven compliance obligations, evidence tracking, and supplier attestations",
    taskInbox: "Task Inbox",
    expiringSoon: "Expiring Soon",
    expired: "Expired",
    missingEvidence: "Missing Evidence",
    regionalPolicyPack: "Regional Policy Pack Coverage",
    complianceObligations: "Compliance Obligations",
    noObligations: "No compliance obligations configured yet.",
    supplier: "Supplier",
    owner: "Owner",
    region: "Region",
    expires: "Expires:",
    evidenceMissing: "Evidence missing",
    evidenceSubmitted: "Evidence submitted",
    openSupplier: "Open Supplier",
    reviewTasks: "Review Tasks",
    openEvidence: "Open Evidence",
    awaitingEvidence: "Awaiting Evidence"
  },
  adminUsersPage: {
    title: "Access & Roles",
    subtitle: "Role-based access control and regional scope governance",
    addAccount: "Add Account",
    totalAccounts: "Total Accounts",
    totalAccountsDesc: "Authorized platform identities",
    admins: "Admins",
    adminsDesc: "Control-plane accounts",
    internalUsers: "Internal Users",
    internalUsersDesc: "Operational workspace accounts",
    regionalScope: "Regional Scope",
    regionalScopeDesc: "Country or region-filtered operators",
    supplierLogins: "Supplier Logins",
    supplierLoginsDesc: "Portal-only external access",
    directory: "Directory",
    directoryDesc: "Role assignments, named access profiles, and workspace scope",
    headers: {
      name: "Name",
      email: "Email",
      accessScope: "Access Scope",
      department: "Department",
      role: "Role",
      created: "Created",
      actions: "Actions"
    },
    supplierMappingRequired: "Supplier mapping required",
    edit: "Edit",
    delete: "Delete",
    noUsers: "No users found.",
    createAccount: "Create Access Account",
    createAccountDesc: "Provision a named access profile for an internal or supplier-facing workspace.",
    editAccount: "Edit Access Account",
    editAccountDesc: "Update profile details, access posture, or portal mapping for {name}.",
    form: {
      fullName: "Full Name",
      email: "Email",
      employeeId: "Employee ID",
      password: "Password",
      newPassword: "New Password (leave blank to keep current)",
      department: "Department",
      selectDepartment: "Select Department",
      role: "Role",
      internalUser: "Internal User",
      admin: "Admin",
      supplier: "Supplier",
      linkedSupplier: "Linked Supplier",
      selectSupplier: "Select Supplier",
      supplierLoginInfo: "Supplier logins are portal-only and must be mapped to an existing supplier record.",
      accessProfile: "Access Profile",
      countryScope: "Country Scope",
      regionScope: "Region Scope",
      createBtn: "Create User",
      updateBtn: "Save Changes",
      placeholders: {
        fullName: "John Doe",
        email: "john@company.com",
        employeeId: "EMP001",
        password: "Minimum 6 characters",
        countryScope: "DE, IN, US...",
        regionScope: "EMEA, APAC, Bavaria..."
      }
    },
    departments: {
      FinanceBudgeting: "Finance & Budgeting",
      SupplierOperations: "Supplier Operations",
      ProcurementTeam: "Procurement Team",
      InventoryControl: "Inventory Control",
      ITAdmin: "IT & Admin",
      ExecutiveLeadership: "Executive Leadership"
    },
    toasts: {
      created: "Access account created.",
      createFailed: "Failed to create user",
      updated: "Access account updated.",
      updateFailed: "Failed to update user",
      deleted: "Access account removed.",
      deleteFailed: "Failed to delete user",
      confirmDelete: "Are you sure you want to delete this access account?"
    }
  },
  adminSupportPage: {
    title: "Support Ticket Console",
    subtitle: "Multi-admin queue — changes by any admin are reflected in real-time. Closed tickets are archived from user view.",
    refreshQueue: "Refresh Queue",
    kpis: {
      open: "Open",
      inProgress: "In Progress",
      resolved: "Resolved",
      closed: "Closed",
      criticalOpen: "Critical Open"
    },
    adminQueue: "Admin Queue",
    adminQueueDesc: "Update status and add a resolution note. Ticket owner is notified by email on update. Closing a ticket removes it from user active view.",
    searchPlaceholder: "Search tickets...",
    allStatuses: "All Statuses",
    allPriorities: "All Priorities",
    priorities: {
      critical: "Critical",
      high: "High",
      medium: "Medium",
      low: "Low"
    },
    headers: {
      ticket: "Ticket",
      subjectDescription: "Subject / Description",
      priority: "Priority",
      status: "Status",
      resolution: "Resolution",
      actions: "Actions"
    },
    closeAndArchive: "Close & Archive",
    addResolution: "Add resolution notes (sent to user by email)",
    buttons: {
      saving: "Saving",
      close: "Close",
      update: "Update"
    },
    emptyStates: {
      noTickets: "No support tickets in the system.",
      noMatch: "No tickets match the current filters."
    },
    showing: "Showing {filtered} of {total} ticket(s)",
    statusFilterText: "Status: ",
    priorityFilterText: "Priority: ",
    toasts: {
      updated: "Ticket {num} updated to \"{status}\".",
      closed: "Ticket {num} is now closed — it will be archived from user view.",
      updateFailed: "Failed to update {num}."
    }
  },
  adminAuditPage: {
    accessDenied: {
      title: "Access Denied",
      desc: "The audit trail is limited to finance and super-admin access profiles. If you need an export or investigation snapshot, contact your platform administrator.",
      returnBtn: "Return to workspace",
      contactBtn: "Contact administrator"
    },
    title: "Global Audit Trail",
    subtitle: "Immutable record of all system-wide actions for compliance and forensics.",
    wormEnforced: "WORM Enforced",
    storagePending: "Storage Hardening Pending",
    kpis: {
      totalActions: "Total Actions Captured",
      lastEvent: "Last event logged ",
      activeAuditors: "Active Auditors",
      authorizedAdmins: "Authorized system administrators",
      entityCoverage: "Entity Coverage",
      objectTypes: "Types of objects tracked",
      tamperSurface: "Tamper Surface",
      locked: "Locked",
      appOnly: "App-only",
      lockedDesc: "Update, delete, and truncate are blocked at the database layer for audit logs.",
      appOnlyDesc: "The app is read and export only, but the database hard lock is not yet verified."
    },
    view: {
      searchPlaceholder: "Search by entity, user, or details...",
      actionsFilter: "Actions Filter",
      entitiesFilter: "Entities Filter",
      exportBtn: "Export Report",
      exportingBtn: "Exporting...",
      selected: "{count} selected",
      clearFilters: "Clear filters",
      headers: {
        timestamp: "Timestamp (UTC)",
        action: "Action",
        entity: "Entity",
        details: "Details",
        user: "User"
      },
      noLogs: "No audit events captured yet.",
      noMatch: "No audit logs match the current filters.",
      showing: "Showing {filtered} of {total} events",
      actionTypes: {
        create: "Data Entry",
        update: "Modification",
        delete: "Removal",
        other: "System Event"
      },
      verified: "Verified"
    },
    export: {
      title: "Axiom Global Audit Trail - Compliance Evidence Report",
      generatedOn: "Generated On:",
      reportScope: "Report Scope:",
      allActions: "All Actions",
      entityFilter: "Entity Filter:",
      allEntities: "All Entities",
      recordCount: "Record Count:",
      headers: {
        serial: "Serial No.",
        auditId: "Audit ID",
        actionType: "Action Type",
        entityType: "Entity Type",
        entityId: "Entity ID",
        description: "Description",
        performedBy: "Performed By",
        timestamp: "Timestamp (UTC)",
        date: "Date",
        time: "Time",
        category: "Category",
        complianceStatus: "Compliance Status"
      }
    },
    time: {
      noEvents: "No events captured yet",
      minsAgo: "{mins}m ago",
      hoursAgo: "{hours}h ago",
      daysAgo: "{days}d ago"
    }
  },
  adminImportPage: {
    toasts: {
      loadError: "Could not load SAP connector status",
      emptyCsv: "Please upload a CSV file or paste CSV content.",
      dryRunSuccess: "Dry run complete",
      dryRunSuccessDesc: "{valid} valid rows, {invalid} invalid rows",
      dryRunError: "Dry run failed",
      importSuccess: "Import completed",
      importSuccessDesc: "Inserted: {inserted}, Updated: {updated}, Skipped: {skipped}",
      importError: "Import failed"
    },
    title: "Controlled Data Import",
    subtitle: "Admin-only CSV intake with dry-run validation, suspicious-input blocking, referential checks, and post-import intelligence sync.",
    adminOnly: "Admin Only",
    features: {
      validation: "Schema validation",
      validationDesc: "Headers, numeric ranges, currency codes, and suspicious spreadsheet formulas are checked before commit.",
      referential: "Referential checks",
      referentialDesc: "Invoice imports verify linked orders and suppliers so broken records do not bridge into live workflows.",
      sync: "Post-import sync",
      syncDesc: "Successful imports trigger downstream refresh so dashboards, alerts, and recovery routes stay aligned."
    },
    sapStatus: {
      title: "SAP Connector Status",
      subtitle: "Axiom can test SAP connectivity, map OData fields, dry-run imports, and track committed syncs with job history.",
      refreshBtn: "Refresh Status",
      config: "Configuration",
      configReady: "Ready",
      configMissing: "Missing environment settings",
      authMethod: "Auth Method",
      unknown: "Unknown",
      lastSync: "Last Successful Sync",
      noSync: "No successful SAP sync yet",
      recentJobs: "Recent SAP Jobs",
      trackedRuns: "{count} tracked runs",
      syncType: "{type} sync",
      manual: "manual",
      rowsApplied: "{success}/{total} rows applied",
      inProgress: "In progress",
      noJobs: "No SAP sync jobs are tracked yet. Once you commit a SAP-backed import, Axiom records the run here with row counts and completion status."
    },
    config: {
      title: "Import Configuration",
      subtitle: "Supported datasets: Suppliers, Parts, Invoices. Run the dry run first, then commit only the rows that pass validation.",
      dataset: "Dataset",
      suppliers: "Suppliers",
      parts: "Parts",
      invoices: "Invoices",
      upload: "Upload CSV",
      chooseFile: "Choose file",
      csvContent: "CSV Content",
      csvPlaceholder: "Paste CSV content here...",
      expectedHeaders: "Expected headers for {type}: ",
      rejectionWarning: "Files with duplicate headers, oversized payloads, or suspicious spreadsheet formulas are rejected before commit.",
      runDryRunBtn: "Run Dry-Run",
      runningDryRunBtn: "Running Dry-Run...",
      commitBtn: "Commit Import",
      importingBtn: "Importing..."
    },
    summary: {
      title: "Dry-Run Summary",
      totalRows: "Total Rows",
      validRows: "Valid Rows",
      invalidRows: "Invalid Rows"
    },
    validationIssues: {
      title: "Validation Issues",
      headerIssue: "⚠ Header issue: ",
      rowIssue: "Row {row}: ",
      noIssues: "No issues found."
    },
    preview: {
      title: "Preview (first 10 rows)",
      noPreview: "No preview available."
    }
  },
  adminSettingsPage: {
    toasts: {
      updateSuccess: "Admin settings updated successfully.",
      updateError: "Failed to update settings",
      flushAuthSuccess: "Authorization cache flushed. Fresh role rules are now active."
    },
    accessDenied: {
      title: "Admin Access Required",
      desc: "Only administrators can access system settings."
    },
    title: "Admin Settings",
    subtitle: "Secure configuration, recovery controls, and demo-environment maintenance.",
    configGuardrail: {
      title: "Configuration Guardrail",
      subtitle: "Prevent accidental changes during demos and executive reviews.",
      settingsLock: "Settings Lock",
      desc: "When the lock is enabled, operational settings stay frozen so the demo surface does not drift during handoffs or live presentations."
    },
    security: {
      title: "Security & Access",
      subtitle: "Authentication policy and permission refresh controls.",
      sessionPolicy: {
        title: "Session Policy",
        window: "30-minute server session window",
        desc: "Session duration is enforced server-side. This page shows the active policy but does not expose low-level auth configuration for editing in the browser."
      },
      twoFactor: {
        title: "Two-Factor Authentication"
      },
      flushAuth: {
        title: "Flush Authorization Cache",
        desc: "Revalidates server-rendered permission checks after role changes, 2FA updates, or access-policy fixes so the UI reflects the latest security posture immediately.",
        btn: "Flush Auth Cache"
      },
      deploymentBoundary: {
        title: "Deployment Boundary",
        subtitle: "Identity, session controls, and review logs are enforced in-app.",
        desc: "Production-cloud encryption, certificate scope, and infrastructure attestations remain deployment controls outside this admin panel, so this screen only reports the app-side controls we can prove here."
      }
    },
    twoFactorComponent: {
      toasts: {
        setupError: "Failed to start 2FA setup",
        unexpectedError: "An unexpected error occurred",
        enableSuccess: "2FA enabled successfully",
        verifyError: "Verification failed",
        disableConfirm: "Are you sure you want to disable 2FA? This will make your account less secure.",
        disableSuccess: "2FA disabled",
        disableError: "Failed to disable 2FA"
      },
      badges: {
        active: "Active",
        disabled: "Disabled"
      },
      labels: {
        authApp: "Authenticator App",
        desc: "Secure your account with TOTP (Google/Microsoft Authenticator).",
        manageBtn: "Manage 2FA",
        setupBtn: "Setup 2FA"
      },
      dialog: {
        title: "Two-Factor Authentication",
        descManage: "Manage your second factor settings.",
        descSetup: "Add an extra layer of security to your account."
      },
      protected: {
        title: "2FA is Protected",
        desc: "Your account is secured with an authenticator app.",
        disableBtn: "Disable 2FA Protection"
      },
      stepInitial: {
        desc: "Use an authenticator app like Microsoft Authenticator to generate verification codes.",
        btn: "Begin Configuration"
      },
      stepSetup: {
        qrBlocked: "QR Generator Blocked",
        qrBlockedDesc: "Your network is blocking the QR generator. Please use the Setup Key below instead.",
        step1Title: "Step 1: Scan QR Code",
        step1DescFallback: "Since the image is blocked, manually add a new account in your app.",
        step1Desc: "Scan the image above with your authenticator app.",
        manualKey: "Manual Setup Key",
        priorityFallback: "Priority Fallback",
        nextBtn: "Next: Verify Code"
      },
      stepVerify: {
        step2Title: "Step 2: Enter 6-Digit Code",
        step2Desc: "Enter the code displayed in your authenticator app.",
        placeholder: "000000",
        verifyBtn: "Verify & Enable",
        backBtn: "Back to QR Code"
      }
    },
    finance: {
      title: "Finance Console",
      subtitle: "Normalize procurement reporting with fixed book rates while preserving live FX feeds for local lenses.",
      functionalCurrency: "Functional Currency",
      reportingCurrency: "Reporting Currency",
      bookRateCadence: "Book Rate Cadence",
      effectiveFrom: "Effective From",
      monthly: "Monthly",
      quarterly: "Quarterly",
      bookRateLabel: "{currency} book rate",
      bookRateInput: "1 {currency} in {reporting}",
      reportingFormula: {
        title: "Reporting Formula",
        formula: "Local spend x fixed book rate = {reporting} reporting view",
        desc: "Use fixed period rates so savings do not drift with daily FX noise during audit review."
      },
      liveFx: {
        title: "Live FX Snapshot",
        noRates: "No live rates captured yet",
        desc: "Daily ECB feed stays intact and now coexists with the CFO book-rate layer instead of overwriting it."
      },
      appLens: {
        title: "App Lens",
        subtitle: "Header toggle switches between local and reporting currency views",
        desc: "Internal users can flip from user-local currency conversion to fixed reporting-book rates without changing source data."
      },
      activeCurrencies: {
        title: "Active Ledger Currencies",
        noCurrencies: "No posted invoice currencies yet",
        desc: "Original invoice currencies stay intact instead of being flattened into one regional book."
      },
      coverage: {
        title: "USD / EUR / GBP Coverage",
        missing: "Book rates missing",
        desc: "Book-rate coverage for the main global reporting currencies used in executive rollups."
      },
      breathTest: {
        title: "Global Breath Test",
        covered: "USD, EUR, and GBP pathways are covered",
        incomplete: "Global tri-currency coverage is still incomplete",
        desc: "This is the quickest check for whether finance is behaving like a global system rather than a single-currency shell."
      },
      sourceOfTruth: {
        title: "Source of Truth",
        subtitle: "Posted invoices keep their original currency.",
        desc: "Switching the app lens never rewrites invoice, order, or contract records. It only changes how the numbers are displayed and rolled up."
      },
      userLocalLens: {
        title: "User-Local FX Lens",
        subtitle: "Best for buyers, plant users, and regional operators.",
        desc: "The header toggle converts display values into the user's operating currency using the local view. This helps day-to-day review without flattening source records."
      },
      reportingLens: {
        title: "Reporting-Book Lens",
        subtitle: "Best for finance, controllers, and executive rollups.",
        desc: "Book view uses fixed {period} rates into {reporting}. It keeps savings and spend reporting stable across the accounting period."
      },
      operationalBottleneck: {
        title: "Operational Bottleneck",
        fresh: "Keep book rates fresh before using global totals.",
        untrustworthy: "Do not trust global totals until book rates are loaded.",
        desc: "If book rates are stale or missing, the safest fallback is to stay in source-currency or local views for operational decisions and refresh finance settings before executive reporting."
      }
    },
    ai: {
      title: "AI Credential Status",
      subtitle: "Credential presence is visible, but raw keys never render in the browser.",
      ready: "AI Ready",
      missing: "AI Credentials Missing",
      sourceCount: "{count} credential source{s} detected",
      secureStorage: {
        title: "Secure Storage",
        desc: "Credential records stored server-side."
      },
      envSources: {
        title: "Environment Sources",
        desc: "Server environment variables available to the runtime."
      },
      hiddenWarning: "Sensitive values are intentionally hidden. Provisioning and rotation should happen through secure server configuration, not through browser-visible admin forms."
    },
    maintenance: {
      title: "System Maintenance",
      subtitle: "Reset demo data without losing admin access.",
      cleanupTitle: "Workspace Cleanup",
      cleanupDesc: "Use this only when you need to strip demo data, stale AI outputs, and operational records from the environment before a fresh presentation run.",
      seedDemoData: {
        trigger: "Load Demo Workspace",
        title: "Rebuild Demo Data",
        desc: "This will replace the current workspace records with a stable demo dataset across suppliers, sourcing, invoices, savings, risk, compliance, support, and AI dashboards. Admin access and secure platform settings will be preserved.",
        cancel: "Cancel",
        confirm: "YES, LOAD DEMO DATA",
        success: "Demo workspace loaded.",
        error: "Failed to load demo workspace",
        unexpectedError: "An unexpected error occurred while preparing the demo workspace."
      },
      clearInventory: {
        trigger: "Clear Inventory Only",
        title: "Inventory Purge Guardrail",
        desc1: "This removes the entire parts catalog and linked demand planning records. It is intentionally hidden from the live inventory screen to avoid accidental loss during operations.",
        desc2: "Type DELETE to confirm this admin-only action.",
        label: "Confirmation Phrase",
        placeholder: 'Type "DELETE"',
        deleteWord: "DELETE",
        errorEmpty: 'Type "DELETE" to confirm the inventory purge.',
        cancel: "Cancel",
        confirm: "Delete Inventory",
        success: "Cleared {count} parts and linked inventory records.",
        error: "Failed to clear inventory",
        unexpectedError: "An unexpected error occurred while clearing inventory."
      },
      resetDatabase: {
        trigger: "Clear Demo Data",
        title: "Danger Zone: Irreversible Action",
        desc1: "This will permanently delete workspace demo data, including suppliers, transactions, sourcing records, alerts, and generated AI artifacts. Admin accounts and secure system settings will be preserved so you can recover access after the cleanup.",
        desc2: "This action cannot be undone.",
        cancel: "Cancel",
        confirm: "YES, DELETE EVERYTHING",
        success: "Workspace demo data has been cleared.",
        error: "Reset failed",
        unexpectedError: "An unexpected error occurred"
      }
    },
    buttons: {
      reset: "Reset",
      apply: "Apply Changes",
      applying: "Applying..."
    }
  },
  adminScenariosPage: {
    toasts: {
      runFailed: "Scenario run failed",
      runFailedEngine: "The engine could not complete the analysis.",
      runFailedUnexpected: "The analysis engine hit an unexpected error.",
      modeled: "Scenario modeled",
      modeledDesc: "{title} was rebuilt from live workspace baselines.",
      queueFailed: "Failed to queue apply plan",
      queueFailedAxiom: "Axiom could not create the governed execution packet.",
      queueFailedPacket: "The governed execution packet could not be created.",
      stagedReused: "Apply plan already staged",
      stagedQueued: "Governed apply plan queued",
      stagedDesc: "{ownerName} now owns the execution packet in Task Inbox."
    },
    header: {
      title: "Scenario Modeling",
      desc: "Deterministic scenario analysis over live order, supplier, invoice, and FX baselines. Axiom does not pretend to know the market by magic here: you define the shock, the engine shows the exposure, assumptions, and operational consequences."
    },
    badges: {
      engine: "Deterministic engine",
      baselines: "Live workspace baselines",
      operator: "Market shock is operator-defined"
    },
    controls: {
      title: "Scenario Controls",
      desc: "Choose the operating stress you want to test, then run it against the current procurement baseline.",
      scenarioType: "Scenario type",
      businessFraming: "Business framing",
      businessFramingPlaceholder: "Describe the operational event you are testing.",
      priceMovement: "Price movement (%)",
      volumeMovement: "Volume movement (%)",
      impactedSpend: "Impacted spend share (%)",
      leadTimeMovement: "Lead-time movement (days)",
      impactedOrder: "Impacted order share (%)",
      exposedCurrency: "Exposed currency",
      fxMove: "FX move (%)",
      shiftedSpend: "Shifted spend share (%)",
      costDelta: "Cost delta (%)",
      currentRisk: "Current supplier risk",
      alternateRisk: "Alternate supplier risk",
      modelDiscipline: "Model discipline",
      rule1: "Uses live open orders, supplier-risk posture, invoice currency exposure, and finance settings.",
      rule2: "Does not rewrite invoices, orders, or book rates. This is a simulation layer only.",
      rule3: "Does not pretend to ingest live commodity or market feeds unless that data is explicitly connected.",
      btnRun: "Run Analysis",
      btnRunning: "Running...",
      btnReset: "Reset"
    },
    playbooks: {
      title: "Scenario Playbooks",
      desc: "Load a serious starting point, then tune the stress inputs before running it."
    },
    empty: {
      title: "No scenario has been run yet",
      desc: "This page now treats scenarios as operating decisions, not decorative templates. Run one and Axiom will show the live order-book basis, invoice currency exposure, FX freshness, explicit assumptions, and control impacts behind the projection.",
      method1Title: "What it uses",
      method1Body: "Open orders, supplier risk posture, invoice exposure by currency, and configured finance settings.",
      method2Title: "What stays fixed",
      method2Body: "Source invoices and posted records stay untouched. Only the reporting view and projection change.",
      method3Title: "What it will not fake",
      method3Body: "No live external price or market feed is implied unless that data is actually connected."
    },
    scenario: {
      applyPlanQueued: "Apply plan queued",
      confidence: "Confidence",
      btnQueue: "Queue Governed Apply Plan",
      btnQueuing: "Queuing apply plan...",
      btnQueued: "Apply Plan Queued",
      governedRoute: "Governed apply route",
      governedDesc: "{ownerName} owns the execution packet.",
      governedSubDesc: "The scenario has been converted into a tracked recommendation and a Task Inbox review item instead of mutating live sourcing blindly.",
      due: "Due {date} | Recommendation {rec} | Task {task}",
      btnOpenTask: "Open Task Inbox",
      openOrderBasis: "Open Order Basis",
      orders: "orders",
      supplierRisk: "Supplier Risk",
      highRiskSuppliers: "high-risk suppliers",
      avg: "avg",
      invoiceExposure: "Invoice Exposure",
      invoices: "invoices",
      noInvoiceCurrencies: "No invoice currencies",
      fxPosture: "FX Posture",
      bookView: "book view",
      inputsTitle: "Scenario Inputs",
      signalsTitle: "Market Signals",
      assumptionsTitle: "Assumptions",
      projectedTitle: "Projected outcomes",
      projectedSubTitle: "Current vs projected",
      noDelta: "No delta calculated",
      recommendationsTitle: "Recommendations",
      riskFactorsTitle: "Risk Factors",
      currencyBasisTitle: "Currency Exposure Basis",
      share: "share",
      source: "Source",
      reporting: "Reporting",
      noExposure: "No invoice exposure has been posted yet."
    },
    scenarioMeta: {
      price_change: {
        title: "Price Shock",
        description: "Stress the live open-order book with a category or market price movement."
      },
      volume_change: {
        title: "Volume Shift",
        description: "Push a demand increase or decrease through procurement flow and watch spend / load."
      },
      lead_time: {
        title: "Lead-Time Drift",
        description: "Model how delivery delays or improvements change operational and cost pressure."
      },
      supplier_switch: {
        title: "Supplier Switch",
        description: "Compare risk, release-blocking posture, and spend on a shifted supplier lane."
      },
      currency_fluctuation: {
        title: "Currency Fluctuation",
        description: "Measure how FX movement changes reporting-book exposure without touching source invoices."
      }
    },
    playbooksList: {
      commoditySpike: {
        label: "Commodity spike",
        summary: "14% price increase across 45% of the current open-order lane.",
        description: "Commodity spike on critical lanes."
      },
      eurFxShock: {
        label: "EUR FX shock",
        summary: "6% adverse move on EUR invoice exposure in the reporting book.",
        description: "EUR strengthens against the reporting currency on exposed invoices."
      },
      delayWave: {
        label: "Port delay wave",
        summary: "9-day slip across 30% of active lanes.",
        description: "Port and carrier delay across current inbound orders."
      },
      alternateSource: {
        label: "Alternate source",
        summary: "Move 25% of spend from risk 78 to risk 46 at a 3% cost premium.",
        description: "Forced alternate source away from a high-risk supplier."
      },
      demandSurge: {
        label: "Demand surge",
        summary: "22% demand increase through 40% of the current open order lane.",
        description: "Demand surge across the current release pipeline."
      }
    }
  },
  adminEcosystemPage: {
    toasts: {
      failedMap: "Failed to map supplier ecosystem",
      noDataToExport: "No supplier ecosystem data available to export",
      reportDownloaded: "Supplier performance report downloaded",
    },
    loading: "Mapping supplier ecosystem...",
    errorState: {
      title: "Supplier ecosystem could not be rebuilt",
      desc: "{error}. Axiom rebuilds this page from the current supplier, order, contract, and part data, so a retry will pick up fresh records immediately.",
      btnRetry: "Retry Mapping",
      btnOpenSuppliers: "Open Suppliers",
      btnLoadData: "Load Supplier Data",
    },
    emptyState: {
      title: "Awaiting live supplier network data",
      desc: "No active suppliers are currently mapped into the ecosystem view. As soon as supplier, order, or contract data is added, this page reorganizes itself from the new live records on the next rebuild.",
      btnRebuild: "Rebuild Network",
    },
    noInputState: {
      title: "Supplier ecosystem is waiting for live inputs",
      desc: "This route reorganizes itself from the current supplier, order, contract, and part data. Rebuild the network after new data is added if you want the latest partner map immediately.",
    },
    header: {
      title: "Supplier Ecosystem",
      healthScore: "Health score {score}/100",
      desc: "This page now focuses on partner resilience, performance posture, backup coverage, and action routes. It treats suppliers as an operating network, not a static address book.",
      btnRebuild: "Rebuild Network",
      btnGenerateReport: "Generate Performance Report",
      btnOpenSuppliers: "Open Suppliers",
      btnOpenRisk: "Open Risk Intelligence",
    },
    metrics: {
      mappedTitle: "Partners Mapped",
      mappedDesc: "Active suppliers with live order, contract, and performance signal.",
      backupTitle: "Backup Coverage",
      backupDesc: "Suppliers with a mapped backup lane inside the current network model.",
      expiringTitle: "Contracts Expiring",
      expiringDesc: "Strategic partners whose commercial cover needs renewal attention.",
      hotspotsTitle: "Critical Hotspots",
      hotspotsDesc: "Exposure points where concentration, risk, or missing alternates can break flow."
    },
    routes: {
      title: "Supplier Partnership Routes",
      desc: "Supplier collaboration is already present in Axiom through portal-driven self-service, not email-only back-and-forth.",
      onboardingTitle: "Self-service onboarding",
      onboardingDesc: "Suppliers can already maintain profile data, categories, country, contact email, certifications, and ESG declarations in the portal.",
      collaborationTitle: "Bid and order collaboration",
      collaborationDesc: "RFQ invitations, active orders, documents, and requests are already visible in the supplier-facing workspace.",
      boundaryTitle: "Current readiness boundary",
      boundaryDesc: "Multi-tier sub-vendor disclosure and supplier-shared forecast commits are not yet live in the data model. This page surfaces the gap instead of pretending deep upstream visibility already exists.",
      btnReview: "Review supplier records",
      btnCompliance: "Open compliance"
    },
    performance: {
      title: "Performance Watch",
      desc: "Real suppliers ranked by current performance and risk, ready for the next review or negotiation.",
      general: "General",
      orders: "orders",
      risk: "Risk",
      perfLabel: "Performance",
      empty: "No supplier is currently outside the active performance watch thresholds."
    },
    dependency: {
      title: "Dependency Pressure",
      desc: "Current blind spots, single-source lanes, and recovery routes from the live ecosystem map.",
      watchlistTitle: "Single-source watchlist",
      watchlistDesc: "{count} supplier lanes have live spend but no mapped backup relationship yet.",
      empty: "No open single-source concentration was detected in the current supplier map.",
      btnScenario: "Scenario Lab",
      btnRisk: "Risk routes"
    },
    hotspot: {
      title: "Hotspot Feed",
      desc: "Financial exposure and the first recovery move for each current risk hotspot.",
      exposed: "exposed",
      fallback: "Build a recovery route before the next release cycle.",
      empty: "No active hotspot is currently flagged in the supplier network."
    },
    network: {
      title: "Network Shape",
      desc: "Live distribution of supplier clusters and current hotspot exposure.",
      clusterDensity: "Cluster density",
      hotspotExposure: "Hotspot exposure"
    },
    recommendations: {
      title: "Strategic Recommendations",
      desc: "Recommendations derived from the current supplier map, not from static placeholder copy.",
      empty: "No live recommendation was generated from the current supplier network."
    },
    csv: {
      supplier: "Supplier",
      category: "Category",
      riskScore: "Risk Score",
      performanceScore: "Performance Score",
      orderVolume: "Order Volume",
      orderValue: "Order Value",
      contractStatus: "Contract Status",
      backupCovered: "Backup Covered",
      partCategories: "Part Categories",
      yes: "Yes",
      no: "No",
      general: "General"
    }
  },

  
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
      agentCatalog: "Agent Catalog",
    },
    catalog: {
      openWorkspace: "Open Workspace",
      running: "Running...",
      adminRun: "Admin Run",
      run: "Run"
    },
    trace: {
      title: "Agent Execution Trace",
      runningNow: "RUNNING_NOW",
      workspaceIdle: "WORKSPACE_IDLE",
      runs24h: "RUNS_24H",
      noActivity: "No recent agent activity",
      noActivityDesc: "Wait for the scheduled dispatcher or launch an agent manually.",
      exec: "EXEC",
      payload: "PAYLOAD",
      state: "STATE",
      noExecutions: "No agent executions have been recorded yet. Run an agent from the catalog and this trace will populate from the live database."
    }
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
    },
  operationalFreshness: {
    dataLastSynced: "Data last synced",
    thisSurfaceRenders: "This surface renders from guarded server actions. Force refresh if you need a fresh read before presenting.",
    liveRoute: "Live route",
    degradedPosture: "Degraded / cached posture",
    autoRefreshPaused: "Auto-refresh paused on weak or offline connection",
    forceRefresh: "Force Refresh",
    unknownAge: "Unknown age",
    ago: "{time} ago",

    telemetry: {
      offline: {
        title: "Telemetry heartbeat offline",
        detail: "No recent telemetry heartbeat is available, so watch coverage should be treated as incomplete."
      },
      stale: {
        title: "Telemetry heartbeat stale",
        detail: "Last signal {age}. Review telemetry before trusting coverage claims."
      },
      live: {
        title: "Telemetry heartbeat live",
        detail: "Last signal {age} across the monitored routes."
      }
    },
    fxRates: {
      missing: {
        title: "FX rates missing",
        detail: "Reporting-book rates are not loaded yet, so global rollups should stay in source currency views."
      },
      stale: {
        title: "FX rates need refresh",
        detail: "Last rates update {age}. Refresh book rates before relying on global spend totals."
      },
      staleNoDate: {
        title: "FX rates need refresh",
        detail: "FX updates are not timestamped yet."
      },
      fresh: {
        title: "FX rates loaded",
        detail: "Reporting-book rates refreshed {age}."
      }
    }
  }
} as const;

/** Converts all leaf string literals in a type to plain `string`. */
type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringify<T[K]>;
};

export type TranslationKeys = DeepStringify<typeof en>;
