const fs = require('fs');
let content = fs.readFileSync('src/lib/enterprise-readiness.ts', 'utf8');

// Replace gaps in buildSupplierReadiness
content = content.replace(/gaps\.push\('Regional data is incomplete, which weakens geographic reporting.'\);/g, "gaps.push('regionalDataIncomplete');");
content = content.replace(/gaps\.push\('No supporting documents are attached to validate supplier claims.'\);/g, "gaps.push('noDocuments');");
content = content.replace(/gaps\.push\('Compliance evidence coverage is too thin for high-confidence scoring.'\);/g, "gaps.push('complianceEvidenceThin');");
content = content.replace(/gaps\.push\('Audit records are stale or missing.'\);/g, "gaps.push('auditRecordsStale');");
content = content.replace(/gaps\.push\('Risk audit data is stale or missing.'\);/g, "gaps.push('riskAuditStale');");

// Replace gaps in buildIntegrationHealth
content = content.replace(/gaps\.push\('No active outbound integration endpoint is configured.'\);/g, "gaps.push('noActiveWebhooks');");
content = content.replace(/gaps\.push\('No tracked source system is feeding import history.'\);/g, "gaps.push('noSourceSystems');");
content = content.replace(/gaps\.push\('Exchange-rate coverage is missing from platform settings.'\);/g, "gaps.push('noExchangeRates');");
content = content.replace(/gaps\.push\('Webhook delivery success rate is below the enterprise target.'\);/g, "gaps.push('lowWebhookSuccess');");
content = content.replace(/gaps\.push\(`\$\{input\.staleWebhooks\} webhook endpoint\$\{input\.staleWebhooks === 1 \? ' is' : 's are'\} stale\.`\);/g, "gaps.push(`staleWebhooks:${input.staleWebhooks}`);");
content = content.replace(/gaps\.push\('Webhook backlog is starting to accumulate.'\);/g, "gaps.push('webhookBacklog');");

// Replace gaps in buildGovernanceCoverage
content = content.replace(/gaps\.push\('Approval policies are missing for core purchasing and governance workflows.'\);/g, "gaps.push('noApprovalPolicies');");
content = content.replace(/gaps\.push\('Three-way matching tolerances are not configured for invoice reconciliation.'\);/g, "gaps.push('noMatchingTolerances');");
content = content.replace(/gaps\.push\('No supplier-specific tolerance overrides are currently active.'\);/g, "gaps.push('noSupplierTolerances');");
content = content.replace(/gaps\.push\('Task escalation levels point to a lack of governance oversight.'\);/g, "gaps.push('highEscalation');");
content = content.replace(/gaps\.push\('Overdue compliance or review tasks need immediate attention.'\);/g, "gaps.push('overdueTasks');");

// Replace gaps in buildReliabilitySummary
content = content.replace(/gaps\.push\('No recent import jobs are available to prove ingestion reliability.'\);/g, "gaps.push('noRecentImports');");
content = content.replace(/gaps\.push\('No recent webhook deliveries are available to prove integration reliability.'\);/g, "gaps.push('noRecentWebhooks');");
content = content.replace(/gaps\.push\('Webhook delivery failure rate suggests underlying connectivity issues.'\);/g, "gaps.push('lowWebhookReliability');");

fs.writeFileSync('src/lib/enterprise-readiness.ts', content);
console.log('done');
