import { AssessmentDetailClient } from "@/components/assessments/assessment-detail";

const mockDetail = {
  id: "debug-0000-0000-0000-000000000001",
  title: "Debug Assessment Request",
  description: null,
  responsibleId: "u1",
  teamIds: ["u2"],
  dueDate: new Date("2026-09-01"),
  status: "draft",
  templateId: null,
  messageBody: "Hello supplier",
  createdById: "u1",
  createdAt: new Date("2026-08-01T10:00:00Z"),
  updatedAt: new Date("2026-08-10T10:00:00Z"),
  responsible: { id: "u1", name: "Jane Buyer", email: "jane@axiom.test", image: null },
  createdBy: { id: "u1", name: "Jane Buyer" },
  template: null,
  documentRequestGroups: [
    {
      id: "g1",
      assessmentRequestId: "debug-0000-0000-0000-000000000001",
      label: "Documents",
      allowAdditionalAttachments: true,
      order: 0,
      documents: [
        { id: "d1", groupId: "g1", documentTemplateId: "t1", name: "Quality Cert", isAnswerRequired: true, order: 0 },
      ],
    },
  ],
  suppliers: [
    {
      id: "s1",
      supplierId: "sup1",
      supplierName: "Acme Components",
      contactId: "c1",
      contactName: "John Doe",
      contactEmail: "john@acme.test",
      status: "pending",
      contacts: [{ contactId: "c1", contactName: "John Doe", contactEmail: "john@acme.test" }],
    },
  ],
  responseCount: 0,
} as any;

export default function DebugAssessmentPage() {
  return (
    <AssessmentDetailClient
      detail={mockDetail}
      userOptions={[{ id: "u1", name: "Jane Buyer", email: "jane@axiom.test", image: null }, { id: "u2", name: "Bob", email: "bob@axiom.test", image: null }]}
      canManage={true}
      initialStep="general"
      initialView="form"
      currentUserId="u1"
    />
  );
}
