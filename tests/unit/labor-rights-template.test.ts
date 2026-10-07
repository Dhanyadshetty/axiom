import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import laborTemplate from '../../src/lib/assessment-templates/esg-supplier-self-assessment-labor-rights.json';
import humanTemplate from '../../src/lib/assessment-templates/esg-supplier-self-assessment-human-rights.json';
import pmaTemplate from '../../src/lib/assessment-templates/supplier-self-assessment-pma-code-of-conduct.json';
import { resolveAssessmentTemplateSchema } from '../../src/lib/assessment-templates';
import { getAssessmentReminderDates } from '../../src/lib/reminder-schedule';

test('labor rights template uses the worker rights questionnaire wording', () => {
  const labels = laborTemplate.sections.flatMap((section) =>
    section.blocks.flatMap((block) => block.fields.map((field) => field.label))
  );

  assert(labels.some((label) => label.includes('occupational health and safety')));
  assert(labels.some((label) => label.includes('freedom of association')));
  assert(labels.some((label) => label.includes('unequal treatment')));
  assert(labels.some((label) => label.includes('appropriate wage')));
});

test('human rights template matches the LkSG questionnaire layout and wording', () => {
  const questionnaireSection = humanTemplate.sections.find(
    (section) => section.title === "Questionnaire on Human Rights"
  );

  assert(questionnaireSection, 'human rights questionnaire section is missing');
  assert(
    questionnaireSection.blocks.some((block) => block.key === 'message_block'),
    'human rights template is missing the message block'
  );
  assert(
    questionnaireSection.blocks.some((block) =>
      block.fields.some((field) => field.label.includes('prohibition of child labor'))
    ),
    'human rights template is missing the child labor question'
  );
  assert(
    humanTemplate.sections.some((section) =>
      section.blocks.some((block) => block.message && block.message.includes('Human Rights'))
    ),
    'human rights template is missing the buyer/message content'
  );
});

test('environmental rights template matches the LkSG environmental questionnaire layout and wording', () => {
  const envTemplate = JSON.parse(
    fs.readFileSync(
      'src/lib/assessment-templates/esg-supplier-self-assessment-environmental-rights.json',
      'utf8'
    )
  );

  const questionnaireSection = envTemplate.sections.find(
    (section) => section.title === 'Questionnaire on Environmental Rights'
  );

  assert(questionnaireSection, 'environmental rights questionnaire section is missing');
  assert(
    questionnaireSection.blocks.some((block) => block.key === 'message_block'),
    'environmental rights template is missing the message block'
  );
  assert(
    questionnaireSection.blocks.some((block) =>
      block.fields.some((field) => field.label.includes('use of mercury'))
    ),
    'environmental rights template is missing the mercury question'
  );
  assert(
    envTemplate.sections.some((section) =>
      section.blocks.some((block) => block.message && block.message.includes('Environmental Rights'))
    ),
    'environmental rights template is missing the buyer/message content'
  );
});

test('egb template includes the general-information LkSG content from the provided text', () => {
  const egbTemplate = JSON.parse(
    fs.readFileSync(
      'src/lib/assessment-templates/esg-self-assessment-egb.json',
      'utf8'
    )
  );

  const generalInfoSection = egbTemplate.sections.find(
    (section) => section.title === 'General Information' || section.title === 'General Information about the ESG Self-Assessment'
  );

  assert(generalInfoSection, 'EGB template is missing the General Information section');
  assert(
    egbTemplate.sections.some((section) =>
      section.blocks.some((block) =>
        block.message && block.message.includes('Supply Chain Due Diligence Act (LkSG)')
      )
    ),
    'EGB template is missing the LkSG background message'
  );
  assert(
    egbTemplate.sections.some((section) =>
      section.blocks.some((block) =>
        block.title && block.title.includes('General Questions about the Affiliate')
      )
    ),
    'EGB template is missing the affiliate questionnaire block'
  );
});

test('runtime schema resolution prefers the bundled PMA schema over stale stored config', () => {
  const staleConfig = JSON.stringify({
    sections: [{
      key: 'general_information',
      title: 'General Information',
      blocks: [{
        key: 'production_sales_sites',
        fields: [{
          key: 'sites_table',
          type: 'table_rows',
          columns: [],
        }],
      }],
    }],
  });

  const resolved = resolveAssessmentTemplateSchema('supplier_self_assessment_pma_code_of_conduct', staleConfig);
  assert(resolved, 'bundled schema should resolve for the PMA category');
  assert(
    resolved.sections.some((section) => section.key === 'general_information'),
    'stale config should not override the bundled PMA schema'
  );
  assert(
    resolved.sections
      .flatMap((section) => section.blocks)
      .flatMap((block) => block.fields)
      .some((field) => field.key === 'contacts_table' || field.key === 'sites_table'),
    'bundled PMA schema should include the real contact/site field definitions'
  );
});

test('pma template includes the full supplier self-assessment interaction schema', () => {
  const generalInformation = pmaTemplate.sections.find((section) => section.key === 'general_information');
  const sitesBlock = generalInformation?.blocks.find((block) => block.key === 'production_sales_sites');
  const contactsBlock = generalInformation?.blocks.find((block) => block.key === 'contacts');
  const revenueBlock = generalInformation?.blocks.find((block) => block.key === 'annual_revenues');
  const codeOfConductBlock = pmaTemplate.sections
    .find((section) => section.key === 'quality_systems')
    ?.blocks.find((block) => block.key === 'document_requests_code_of_conduct');

  assert(generalInformation, 'PMA template is missing the General Information section');
  assert(sitesBlock?.fields.some((field) => field.type === 'table_rows'), 'PMA template is missing the production sales site table');
  assert(sitesBlock?.fields[0]?.type === 'table_rows', 'Production and sales sites table should use the row editor');
  assert(
    sitesBlock?.fields[0]?.columns.some((column) => column.key === 'divisions' && column.type === 'select_multi_tags'),
    'Production and sales site divisions should be multi-select'
  );
  assert(
    sitesBlock?.fields[0]?.columns.some((column) => column.key === 'shifts' && column.type === 'select_multi_tags'),
    'Production and sales site shifts should be multi-select'
  );
  assert(contactsBlock?.fields.some((field) => field.type === 'contact_table'), 'PMA template is missing the contact table modal flow');
  const contactTableField = contactsBlock?.fields.find((field) => field.type === 'contact_table');

  assert(
    contactTableField?.modalFields?.some((field) => field.key === 'responsibility' && field.type === 'select_multi_tags'),
    'Contact responsibility should be multi-select in the add-contact modal'
  );
  assert(
    contactTableField?.modalFields?.some((field) => field.key === 'first_name'),
    'Add contact modal should include first name'
  );
  assert(
    contactTableField?.modalFields?.some((field) => field.key === 'last_name'),
    'Add contact modal should include last name'
  );
  assert(
    contactTableField?.modalTitle === 'Add Contact',
    'Add contact modal title should be present in the schema'
  );
  assert(
    sitesBlock?.fields[0]?.addRowModalFields?.some((field) => field.key === 'site' && field.required),
    'Add site modal should include a required site field'
  );
  assert(
    sitesBlock?.fields[0]?.addRowModalFields?.some((field) => field.key === 'divisions' && field.type === 'select_multi_tags'),
    'Add site modal should include a multi-select divisions field'
  );
  assert(
    sitesBlock?.fields[0]?.addRowModalFields?.some((field) => field.key === 'shifts' && field.type === 'select_multi_tags'),
    'Add site modal should include a multi-select shifts field'
  );
  assert(revenueBlock?.fields.some((field) => field.type === 'table_rows'), 'PMA template is missing the annual revenue rows flow');
  assert(codeOfConductBlock?.fields.some((field) => field.type === 'document_review_confirm'), 'PMA template is missing the Code of Conduct confirmation flow');
  assert(
    codeOfConductBlock?.fields.some((field) => field.key === 'additional_coc_documents'),
    'PMA template is missing additional Code of Conduct documents upload'
  );
});

test('all nine bundled assessment forms remain resolvable and retain the contact department flow', () => {
  const bundledCategories = [
    'supplier_self_assessment_pma_code_of_conduct',
    'code_of_conduct',
    'esg_document_request',
    'esg_supplier_self_assessment_labor_rights',
    'esg_supplier_self_assessment_human_rights',
    'esg_supplier_self_assessment_environmental_rights',
    'esg_self_assessment_egb',
    'reach_enquiry',
    'rohs_enquiry',
  ];

  bundledCategories.forEach((category) => {
    const schema = resolveAssessmentTemplateSchema(category, null);
    assert(schema, `${category} should resolve to a bundled form schema`);
    assert(schema?.sections.length, `${category} should have at least one section`);

    const contactBlock = schema?.sections
      .flatMap((section) => section.blocks)
      .find((block) => block.key === 'contacts' || block.fields.some((field) => field.type === 'contact_table'));

    if (contactBlock) {
      assert(
        contactBlock.fields.some((field) => field.type === 'contact_table'),
        `${category} should retain the contact-table field definition`
      );
      const contactTableField = contactBlock.fields.find((field) => field.type === 'contact_table');
      assert(
        contactTableField?.modalFields?.some((field) => field.key === 'department' && field.type === 'select_multi_tags'),
        `${category} should keep the required department multi-select in the add-contact modal`
      );
    }
  });
});

test('assessment reminder schedule keeps a realistic 5 to 7 day cadence', () => {
  const sentAt = new Date('2026-01-01T00:00:00Z');
  const dueDate = new Date('2026-01-20T00:00:00Z');

  const schedule = getAssessmentReminderDates({
    sentAt,
    lastReminderSentAt: sentAt,
    dueDate,
  });

  assert(schedule.lastReminder instanceof Date, 'last reminder should be a date');
  assert(schedule.nextReminder instanceof Date, 'next reminder should be a date');
  const gapDays = Math.round((schedule.nextReminder.getTime() - schedule.lastReminder.getTime()) / 86400000);
  assert(gapDays >= 5 && gapDays <= 7, `reminder gap should stay within 5-7 days, got ${gapDays}`);
  assert(schedule.nextReminder <= dueDate || schedule.nextReminder.getTime() === dueDate.getTime(), 'next reminder should not fall after the request due date');
});
