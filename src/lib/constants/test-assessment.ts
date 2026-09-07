export const TEST_ASSESSMENT_CONSTANTS = {
  TEMPLATE_CATEGORY: 'supplier_self_assessment_pma_code_of_conduct',
  SUPPLIER_NAME: 'test Lieferant PMA',
  SUPPLIER_EMAIL: 'supplier@example.com',
  SUPPLIER_STATUS: 'active' as const,
  SUPPLIER_LIFECYCLE_STATUS: 'active' as const,
  DEFAULT_CONTACT_EMAIL: 'vinay.temkar@prettl.com',
  CONTACT_STATUS: 'active' as const,
  REQUEST_TITLE: 'SSA-71986 Supplier Self Assessment PMA & Code of Conduct',
  REQUEST_STATUS: 'published' as const,
  REQUEST_MESSAGE_BODY: 'Please complete the supplier self-assessment.',
  PARTICIPANT_STATUS: 'sent' as const,
  MAGIC_TOKEN_PURPOSE: 'invitation' as const,
  DEFAULT_BASE_URL: 'http://localhost:3001',
  REDIRECT_PATH_TEMPLATE: '/external/assessments/{requestId}/requests/{participantId}',
  LOGIN_PATH_TEMPLATE: '/external/login?magictoken={token}&redirect={redirect}',
} as const;

export type TestAssessmentConstants = typeof TEST_ASSESSMENT_CONSTANTS;