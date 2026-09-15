"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Save,
  Send,
  Download,
  Share2,
  PanelRightClose,
  PanelRightOpen,
  Globe,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  X,
  Mail,
  ArrowLeft,
  Users,
  Building,
  FileText,
  Shield,
  Factory,
  CreditCard,
  Euro,
  Truck,
  Target,
  Cog,
  PieChart,
  UserCheck,
  Info,
  MapPin,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { FieldRenderer } from "./form-fields/FieldRenderer";
import { resolveAssessmentTemplateSchema } from "@/lib/assessment-templates";
import type { AssessmentTemplateSchema, FormAnswer, Section, Block, Field, TableRowsField } from "@/lib/assessment-templates/types";
import { getSupplierResponse } from "@/app/actions/assessments";
import { ShareRequestClient } from "./share-request-client";
import type { AssessmentDetail } from "@/lib/assessment-types";

const SECTION_ICONS: Record<string, React.ReactNode> = {
  buyer_message: <Mail className="h-4 w-4" />,
  general_information: <Building className="h-4 w-4" />,
  technical_information: <Cog className="h-4 w-4" />,
  quality_systems: <Shield className="h-4 w-4" />,
};

const BLOCK_ICONS: Record<string, React.ReactNode> = {
  buyer_message_block: <Mail className="h-4 w-4" />,
  company_address: <Building className="h-4 w-4" />,
  legal_details: <FileText className="h-4 w-4" />,
  public_appearance: <Globe className="h-4 w-4" />,
  other_basic_information: <Info className="h-4 w-4" />,
  bank_connection: <CreditCard className="h-4 w-4" />,
  product_liability: <Shield className="h-4 w-4" />,
  production_sales_sites: <Factory className="h-4 w-4" />,
  contacts: <Users className="h-4 w-4" />,
  employees: <Users className="h-4 w-4" />,
  customers: <UserCheck className="h-4 w-4" />,
  annual_revenues: <Euro className="h-4 w-4" />,
  share_revenue: <PieChart className="h-4 w-4" />,
  main_suppliers: <Truck className="h-4 w-4" />,
  main_equipment: <Cog className="h-4 w-4" />,
  core_competences: <Target className="h-4 w-4" />,
  document_requests_certifications: <FileText className="h-4 w-4" />,
  contracts: <FileText className="h-4 w-4" />,
  document_requests_code_of_conduct: <FileText className="h-4 w-4" />,
  confirmation: <CheckCircle2 className="h-4 w-4" />,
};

const BLOCK_MESSAGES: Record<string, string> = {
  production_sales_sites: "Please list all production and sales sites. For each site, provide the details below.",
  contacts: "Please provide information about the main production facility contacts. Use the department filter to organize contacts.",
  customers: "Please provide your top customers. Format example: Max Mustermann GmbH, 10%\n\nTotal customers and customers representing 80% of sales are required fields.",
  main_equipment: "Please list your main equipment/machinery. Format: quantity, type, manufacturer/brand (e.g., '5, CNC Milling Machines, DMG Mori')",
  core_competences: "Select commodity groups and describe your core products/processes for each.",
  document_requests_certifications: "Please upload the requested certification documents.",
  document_requests_code_of_conduct: "Please review and confirm the Code of Conduct documents.",
  main_suppliers: "Please list your main suppliers with their percentage of purchase volume.",
};

interface SchemaBasedFormStepProps {
  detail: AssessmentDetail;
  canManage: boolean;
  onMutated: () => void;
  registerSave: (fn: (() => Promise<void>) | null) => void;
  supplierId?: string;
  contactId?: string;
}

export function SchemaBasedFormStep({
  detail,
  canManage,
  onMutated,
  registerSave,
  supplierId,
  contactId,
}: SchemaBasedFormStepProps) {
  const router = useRouter();
  const [schema, setSchema] = React.useState<AssessmentTemplateSchema | null>(null);
  const [answers, setAnswers] = React.useState<FormAnswer>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [showShare, setShowShare] = React.useState(false);
  const [showReject, setShowReject] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [activeSection, setActiveSection] = React.useState<string>("buyer_message");
  const [status, setStatus] = React.useState<"draft" | "submitted" | "rejected">("draft");
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const readOnly = status === "submitted" || status === "rejected" || !canManage;

  React.useEffect(() => {
    const resolvedSchema = resolveAssessmentTemplateSchema(
      detail.template?.category ?? null,
      detail.template?.config ?? null
    );
    if (resolvedSchema) {
      setSchema(resolvedSchema);
    }
  }, [detail.template?.category, detail.template?.config]);

  React.useEffect(() => {
    const loadResponse = async () => {
      if (supplierId && contactId && detail.id) {
        try {
          const response = await getSupplierResponse(detail.id, supplierId);
          if (response?.answers) {
            setAnswers(response.answers);
            setStatus(response.status as "draft" | "submitted" | "rejected");
          }
        } catch (e) {
          console.error("Failed to load response:", e);
        }
      }
    };
    loadResponse();
  }, [detail.id, supplierId, contactId]);

  React.useEffect(() => {
    if (!canManage) {
      registerSave(null);
      return;
    }
    registerSave(() => handleSaveDraft());
    return () => registerSave(null);
  }, [canManage, registerSave]);

  const handleFieldChange = (fieldKey: string, value: FormAnswer[string]) => {
    setAnswers((prev) => ({ ...prev, [fieldKey]: value }));
    if (errors[fieldKey]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldKey];
        return next;
      });
    }
  };

  const handleSaveDraft = async () => {
    if (!supplierId || !contactId || !detail.id) return;
    setSaving(true);
    try {
      const result = await saveAssessmentResponse(detail.id, supplierId, contactId, answers, "draft");
      if (result.success) {
        setToastMessage("Saved as draft");
        setStatus("draft");
        onMutated();
      } else {
        toast.error(result.error || "Failed to save");
      }
    } catch (e) {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const validateForm = (): boolean => {
    if (!schema) return false;
    const newErrors: Record<string, string> = {};

    const validateFields = (fields: Field[], prefix: string = "") => {
      for (const field of fields) {
        const fullKey = prefix ? `${prefix}.${field.key}` : field.key;
        const value = answers[fullKey] ?? answers[field.key];

        if (field.required) {
          const isEmpty = value === undefined || value === null || value === "" ||
            (Array.isArray(value) && value.length === 0) ||
            (typeof value === "object" && value !== null && Object.keys(value).length === 0);

          if (isEmpty) {
            newErrors[fullKey] = `${field.label} is required`;
          }
        }

        if (field.type === "table_rows" && "columns" in field) {
          const tableField = field as TableRowsField;
          const rows = (value as any[]) || [];
          if (field.required && rows.length === 0) {
            newErrors[fullKey] = `${field.label} requires at least one row`;
          }
          rows.forEach((row, rowIdx) => {
            tableField.columns?.forEach((col) => {
              if (col.required && (!row[col.key] || row[col.key] === "")) {
                newErrors[`${fullKey}[${rowIdx}].${col.key}`] = `${col.label} is required`;
              }
            });
          });
        }

        if ("subBlocks" in field && field.subBlocks) {
          field.subBlocks.forEach((subBlock) => {
            validateFields(subBlock.fields, fullKey);
          });
        }
      }
    };

    schema.sections.forEach((section) => {
      section.blocks.forEach((block) => {
        validateFields(block.fields, block.key);
        block.subBlocks?.forEach((subBlock) => {
          validateFields(subBlock.fields, `${block.key}.${subBlock.key}`);
        });
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!supplierId || !contactId || !detail.id) return;
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const result = await saveAssessmentResponse(detail.id, supplierId, contactId, answers, "submitted");
      if (result.success) {
        setToastMessage("Response submitted successfully");
        setStatus("submitted");
        onMutated();
      } else {
        toast.error(result.error || "Failed to submit");
      }
    } catch (e) {
      toast.error("Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!supplierId || !contactId || !detail.id) return;
    setSubmitting(true);
    try {
      const result = await saveAssessmentResponse(detail.id, supplierId, contactId, answers, "rejected");
      if (result.success) {
        setToastMessage("Participation rejected");
        setStatus("rejected");
        setShowReject(false);
        onMutated();
      } else {
        toast.error(result.error || "Failed to reject");
      }
    } catch (e) {
      toast.error("Failed to reject");
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToSection = (sectionKey: string) => {
    const element = document.getElementById(`section-${sectionKey}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(sectionKey);
    }
  };

  const showToastMessage = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  if (!schema || !schema.sections || !Array.isArray(schema.sections)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');`}
      </style>

      {showReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl text-center">
            <AlertTriangle className="mx-auto text-rose-500 mb-3" size={28} />
            <h3 className="text-base font-semibold text-slate-900">Reject participation?</h3>
            <p className="text-sm text-slate-500 mt-2">
              This tells the buyer you won&apos;t be completing this request. You can still be re-invited later.
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <Button variant="outline" onClick={() => setShowReject(false)}>
                Keep working on it
              </Button>
              <Button variant="destructive" onClick={handleReject} disabled={submitting}>
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}

      {showShare && (
        <ShareRequestClient
          assessmentId={detail.id}
          requestId={detail.id}
          organization={detail.responsible?.name ?? "PRETTL"}
          subject={detail.title}
          existingAccess={[]}
          orgContacts={[]}
          onClose={() => {
            setShowShare(false);
            showToastMessage("Request shared with the selected people.");
          }}
        />
      )}

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold tracking-tight text-slate-900 font-mono">AXIOM</span>
          <Separator orientation="vertical" className="h-4" />
          <span className="text-xs font-medium text-slate-400">PMA Program</span>
          {status !== "draft" && (
            <span className={`ml-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
              status === "submitted" ? "border-emerald-200 bg-emerald-50 text-emerald-700" :
              status === "rejected" ? "border-rose-200 bg-rose-50 text-rose-700" :
              "border-amber-200 bg-amber-50 text-amber-700"
            }`}>
              {status === "submitted" ? "Submitted" : status === "rejected" ? "Rejected" : "Answer pending"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Globe className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => showToastMessage("Preparing export…")}
            className="gap-1.5"
          >
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowShare(true)}
            className="gap-1.5"
          >
            <Share2 className="h-4 w-4" /> Share
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen((s) => !s)}
            aria-label="Toggle side panel"
            className="h-7 w-7"
          >
            {sidebarOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      <div className="flex">
        <nav className="hidden lg:block w-64 shrink-0 pl-6 pr-4 py-8 sticky top-[57px] self-start h-[calc(100vh-57px)] overflow-y-auto bg-white border-r border-slate-100">
          <ul className="space-y-1">
            {schema.sections.map((section) => {
              const Icon = SECTION_ICONS[section.key] || <FileText className="h-4 w-4" />;
              const hasErrors = (section.blocks ?? []).some((block) =>
                (block.fields ?? []).some((field) => errors[field.key] || errors[`${block.key}.${field.key}`])
              );
              const isActive = activeSection === section.key;
              return (
                <li key={section.key}>
<Button
                      variant={isActive ? "default" : "ghost"}
                      className={`w-full text-left justify-start gap-2 rounded-md px-3 py-2 text-sm border-l-2 transition ${
                        isActive
                          ? "border-slate-900 bg-slate-100 font-semibold text-slate-900"
                          : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                      }`}
                      onClick={() => scrollToSection(section.key)}
                    >
                      {Icon}
                      <span>{section.title}</span>
                    {hasErrors && <AlertTriangle className="text-rose-500 shrink-0" size={13} />}
                  </Button>
                </li>
              );
            })}
          </ul>
        </nav>

        <main className="flex-1 min-w-0 px-4 sm:px-8 py-8 pb-32">
          <ScrollArea className="h-[calc(100vh-140px)]">
            <div className="space-y-8">
              {schema.sections.map((section) => (
                <section key={section.key} id={`section-${section.key}`} className="scroll-mt-20">
                  <div className="flex items-center gap-2 mb-6">
                    <Separator className="flex-1" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 px-2">{section.title}</span>
                    <Separator className="flex-1" />
                  </div>

                  { (section.blocks ?? []).map((block) => (
                    <Card key={block.key} className={`mb-6 ${errors[block.key] || Object.keys(errors).some(k => k.startsWith(`${block.key}.`)) ? "border-rose-300 ring-1 ring-rose-200" : ""}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-2">
                            {BLOCK_ICONS[block.key] || <FileText className="h-4 w-4" />}
                            <CardTitle className="text-base font-semibold text-slate-900">{block.title}</CardTitle>
                          </div>
                          {block.fields.some(f => f.required) && (
                            <span className="text-rose-600 font-bold text-sm">*</span>
                          )}
                        </div>
                        {block.message && (
                          <p className="text-sm text-slate-500 mt-2 whitespace-pre-wrap">{block.message}</p>
                        )}
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          { (block.fields ?? []).map((field) => (
                            <div key={field.key} className="mb-4 last:mb-0">
                              <FieldRenderer
                                field={field}
                                value={answers[field.key] ?? answers[`${block.key}.${field.key}`]}
                                onChange={(value) => handleFieldChange(field.key, value)}
                                disabled={readOnly}
                                validationErrors={errors}
                                blockKey={block.key}
                                sectionKey={section.key}
                              />
                              {errors[field.key] && (
                                <p className="mt-1 text-sm text-rose-600 flex items-center gap-1">
                                  <XCircle size={12} /> {errors[field.key]}
                                </p>
                              )}
                            </div>
                          ))}
                          {block.subBlocks?.map((subBlock) => (
                            <div key={subBlock.key} className="mt-6 p-4 rounded-lg bg-slate-50/50 border border-slate-100">
                              <h4 className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
                                {subBlock.icon && <span className="text-base">{subBlock.icon}</span>}
                                {subBlock.title}
                              </h4>
                              <div className="space-y-4">
                                { (subBlock.fields ?? []).map((field) => (
                                  <div key={field.key} className="mb-4 last:mb-0">
                                    <FieldRenderer
                                      field={field}
                                      value={answers[`${block.key}.${subBlock.key}.${field.key}`] ?? answers[`${subBlock.key}.${field.key}`] ?? answers[field.key]}
                                      onChange={(value) => handleFieldChange(`${block.key}.${subBlock.key}.${field.key}`, value)}
                                      disabled={readOnly}
                                      validationErrors={errors}
                                      blockKey={`${block.key}.${subBlock.key}`}
                                      sectionKey={section.key}
                                    />
                                    {errors[`${block.key}.${subBlock.key}.${field.key}`] && (
                                      <p className="mt-1 text-sm text-rose-600 flex items-center gap-1">
                                        <XCircle size={12} /> {errors[`${block.key}.${subBlock.key}.${field.key}`]}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </section>
              ))}
            </div>
          </ScrollArea>
        </main>

        {sidebarOpen && (
          <aside className="hidden xl:block w-72 shrink-0 pl-4 pr-6 py-8 sticky top-[57px] self-start">
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Request details</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3 text-sm">
                <div>
                  <p className="text-slate-400">Subject</p>
                  <p className="font-mono text-xs text-slate-700 truncate">{detail.title}</p>
                </div>
                <div>
                  <p className="text-slate-400">Sent on</p>
                  <p className="text-slate-700">{detail.createdAt ? new Date(detail.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC" }) : "—"}</p>
                </div>
                <div>
                  <p className="text-slate-400">Due on</p>
                  <p className="text-slate-700">{detail.dueDate ? new Date(detail.dueDate).toLocaleDateString("en-GB", { timeZone: "UTC" }) : "—"}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Contact information</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3 text-sm">
                <div>
                  <p className="text-slate-400">Organization</p>
                  <p className="text-slate-700 truncate">{detail.responsible?.name ?? "PRETTL Mechatronics & Actuators"}</p>
                </div>
                {detail.responsible && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-white text-xs font-semibold">
                      {detail.responsible.name?.split(" ").map(n => n[0]).join("").toUpperCase()}
                    </span>
                    <span className="text-slate-700">{detail.responsible.name}</span>
                  </div>
                )}
                {detail.responsible?.email && (
                  <a href={`mailto:${detail.responsible.email}`} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800">
                    <Mail size={12} /> {detail.responsible.email}
                  </a>
                )}
              </CardContent>
            </Card>

            <Button
              variant="outline"
              className="w-full border-rose-300 text-rose-600 hover:bg-rose-50"
              onClick={() => setShowReject(true)}
              disabled={status !== "draft" || !canManage}
            >
              Reject participation
            </Button>
          </aside>
        )}

        <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur px-6 py-3 flex justify-end gap-2 lg:hidden">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={saving || readOnly}
            className="gap-1.5"
          >
            <Save className="h-4 w-4" /> Save draft
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || readOnly}
            className="gap-1.5"
          >
            <Send className="h-4 w-4" /> Submit
          </Button>
        </div>
      </div>

      {!readOnly && (
        <div className="hidden lg:fixed lg:bottom-0 lg:left-0 lg:right-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur px-6 py-3 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={saving}
            className="gap-1.5"
          >
            <Save className="h-4 w-4" /> Save as draft
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="gap-1.5 bg-slate-900 hover:bg-slate-800 text-white"
          >
            <Send className="h-4 w-4" /> Submit response
          </Button>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-40 flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">
          <CheckCircle2 size={16} className="text-emerald-400" /> {toastMessage}
        </div>
      )}
    </div>
  );
}

async function saveAssessmentResponse(
  assessmentRequestId: string,
  supplierId: string,
  contactId: string,
  answers: FormAnswer,
  status: "draft" | "submitted" | "rejected"
) {
  const res = await fetch(`/api/assessments/${assessmentRequestId}/response`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ supplierId, contactId, answers, status }),
  });
  return res.json();
}