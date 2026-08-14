"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Plus,
  Search,
  X,
  XIcon,
  EditIcon
} from "lucide-react";
import { useLanguage } from "@/components/i18n/language-provider";
import { t, formatDateTime } from "@/lib/i18n";

type RequestStatus = "Draft" | "Published";

type Request = {
  id: string;
  title: string;
  template: string;
  status: RequestStatus;
  createdAt: string;
  responsible: string;
  dueOn: string;
  responsesSubmitted: string;
  suppliers: string;
  updatedAt: string;
};

const templates = [
  "Code of Conduct",
  "ESG Documentation Request",
  "ESG Dokumentenanfrage",
  "ESG Supplier Self-Assessment - Labour Rights",
  "ESG Supplier Self-Assessment - Human Rights",
  "ESG Supplier Self-Assessment - Environmental Rights",
  "ESG Self-Assessment - Own Business Area",
  "REACH Request",
  "RoHS Request",
  "Supplier Self Assessment & Code of Conduct",
];

const mockRequests: Request[] = [
  {
    id: "SSA-71397",
    title: "Supplier Self Assessment P...",
    template: "ESG Dokumentenanfrage",
    status: "Draft",
    responsible: "Vinay Temkar",
    dueOn: "",
    responsesSubmitted: "0/0",
    suppliers: "",
    createdAt: "12.08.2026",
    updatedAt: "12.08.2026",
  },
  {
    id: "SSA-71289",
    title: "Supplier Self Assessment P...",
    template: "ESG Dokumentenanfrage",
    status: "Draft",
    responsible: "Vinay Temkar",
    dueOn: "",
    responsesSubmitted: "0/1",
    suppliers: "test Lieferant PMA",
    createdAt: "11.08.2026",
    updatedAt: "11.08.2026",
  },
  {
    id: "SSA-71285",
    title: "Supplier Self Assessment P...",
    template: "ESG Dokumentenanfrage",
    status: "Published",
    responsible: "Vinay Temkar",
    dueOn: "",
    responsesSubmitted: "0/1",
    suppliers: "test Lieferant PMA",
    createdAt: "11.08.2026",
    updatedAt: "11.08.2026",
  },
  {
    id: "SSA-55463",
    title: "Supplier Self Assessment P...",
    template: "ESG Dokumentenanfrage",
    status: "Published",
    responsible: "Vinay Temkar",
    dueOn: "15.05.2026",
    responsesSubmitted: "11/17",
    suppliers: "700479 Schlösser GmbH ... +16",
    createdAt: "07.04.2026",
    updatedAt: "05.05.2026",
  },
  {
    id: "SSA-52714",
    title: "Supplier Self Assessment P...",
    template: "ESG Dokumentenanfrage",
    status: "Published",
    responsible: "Milan Šádek",
    dueOn: "11.03.2026",
    responsesSubmitted: "0/1",
    suppliers: "test Lieferant PMA",
    createdAt: "10.03.2026",
    updatedAt: "11.03.2026",
  },
];

export default function RequestsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { language } = useLanguage();
  const tc = t(language, "requests");
  const currentUserName = session?.user?.name || "User";
  const currentRole = session?.user?.role;
  const [requests, setRequests] = useState<Request[]>(mockRequests);
  const [createOpen, setCreateOpen] = useState(false);
  const [templateMenuOpen, setTemplateMenuOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [title, setTitle] = useState("");
  const [templateSearch, setTemplateSearch] = useState("");
  const [listSearch, setListSearch] = useState("");
  const [activeView, setActiveView] = useState<"all" | "mine">("all");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Request | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Request | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user || currentRole === "supplier") {
      router.replace("/");
    }
  }, [currentRole, router, session?.user, status]);

  const availableTemplates = useMemo(
    () =>
      templates.filter((template) =>
        template.toLowerCase().includes(templateSearch.trim().toLowerCase()),
      ),
    [templateSearch],
  );

  const visibleRequests = useMemo(() => {
    const query = listSearch.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesSearch =
        !query ||
        request.title.toLowerCase().includes(query) ||
        request.template.toLowerCase().includes(query) ||
        request.id.toLowerCase().includes(query);

      const matchesView =
        activeView === "all" ||
        request.responsible.toLowerCase() === currentUserName.toLowerCase();

      return matchesSearch && matchesView;
    });
  }, [activeView, currentUserName, listSearch, requests]);

  const openCreate = () => {
    setSelectedTemplate("");
    setTitle("");
    setTemplateSearch("");
    setTemplateMenuOpen(true);
    setCreateOpen(true);
  };

  const selectTemplate = (template: string) => {
    setSelectedTemplate(template);
    setTitle(template);
    setTemplateMenuOpen(false);
  };

  const createRequest = () => {
    if (!selectedTemplate || !title.trim()) return;

    const today = formatDateTime(language, new Date()).split(",")[0];

    setRequests((current) => [
      {
        id: `SSA-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`,
        title: title.trim(),
        template: selectedTemplate,
        status: "Draft",
        responsible: currentUserName,
        dueOn: "",
        responsesSubmitted: "0/0",
        suppliers: "",
        createdAt: today,
        updatedAt: today,
      },
      ...current,
    ]);
    setCreateOpen(false);
  };

  const openEdit = (request: Request) => {
    setEditing(request);
    setSelectedTemplate(request.template);
    setTitle(request.template || request.title);
    setTemplateSearch("");
    setTemplateMenuOpen(false);
    setEditOpen(true);
  };

  const saveEdit = () => {
    if (!editing || !selectedTemplate.trim()) return;

    const today = formatDateTime(language, new Date()).split(",")[0];
    const finalTitle = selectedTemplate;

    setRequests((current) =>
      current.map((request) =>
        request.id === editing.id
          ? {
              ...request,
              title: finalTitle,
              template: selectedTemplate,
              updatedAt: today,
            }
          : request,
      ),
    );
    setEditOpen(false);
    setEditing(null);
  };

  const confirmDeleteRequest = () => {
    if (!confirmDelete) return;
    setRequests((current) => current.filter((r) => r.id !== confirmDelete.id));
    setSelectedRows((current) => current.filter((id) => id !== confirmDelete.id));
    setConfirmDelete(null);
  };

  const toggleRow = (requestId: string) => {
    setSelectedRows((current) =>
      current.includes(requestId)
        ? current.filter((id) => id !== requestId)
        : [...current, requestId],
    );
  };

  const toggleAll = () => {
    const visibleIds = visibleRequests.map((request) => request.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedRows.includes(id));

    setSelectedRows(allSelected ? [] : visibleIds);
  };

  if (status === "loading" || !session?.user || currentRole === "supplier") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6 text-muted-foreground">
        Loading requests workspace...
      </div>
    );
  }

  const allVisibleSelected =
    visibleRequests.length > 0 &&
    visibleRequests.every((request) => selectedRows.includes(request.id));

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 lg:p-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <ClipboardList className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              {tc.title}
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {tc.subtitle}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          {tc.createNew}
        </button>
      </header>

      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView("all")}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                activeView === "all"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/60"
              }`}
            >
              {tc.all}
            </button>
            <button
              onClick={() => setActiveView("mine")}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                activeView === "mine"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/60"
              }`}
            >
              {tc.myRequests}
            </button>
          </div>

          <div className="flex flex-1 items-center justify-between gap-3 lg:justify-end">
            <label className="flex w-full max-w-md items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-muted-foreground">
              <Search className="h-4 w-4" />
                  <input
                value={listSearch}
                onChange={(event) => setListSearch(event.target.value)}
                className="w-full bg-transparent text-sm text-foreground outline-none"
                placeholder={tc.search}
              />
            </label>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-semibold text-foreground"
            >
              <span className="inline-flex items-center gap-1">
                <span className="h-4 w-4 rounded-sm border border-muted-foreground/40" />
                {tc.columns}
              </span>
              <span className="text-muted-foreground">9/11</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-semibold text-foreground"
            >
              {selectedRows.length > 0 ? `${selectedRows.length} ${tc.selected}` : tc.addFilter}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1150px] text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label="Select all requests"
                    checked={allVisibleSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-border"
                  />
                </th>
                 <th className="px-4 py-3">{tc.id}</th>
                 <th className="px-4 py-3">{tc.requestTitle}</th>
                 <th className="px-4 py-3">{tc.responsible}</th>
                 <th className="px-4 py-3">{tc.dueOn}</th>
                 <th className="px-4 py-3">{tc.responsesSubmitted}</th>
                 <th className="px-4 py-3">{tc.status}</th>
                 <th className="px-4 py-3">{tc.suppliers}</th>
                 <th className="px-4 py-3">{tc.createdAt}</th>
                 <th className="px-4 py-3">{tc.updatedAt}</th>
              </tr>
            </thead>
<tbody>
               {visibleRequests.map((request) => {
                 const isSelected = selectedRows.includes(request.id);
 
                 return (
                   <tr
                     key={request.id}
                     className={`border-t border-border transition-colors ${
                       isSelected ? "bg-muted/30" : ""
                     }`}
                   >
                     <td className="px-4 py-4">
                       <input
                         type="checkbox"
                         aria-label={`Select request ${request.id}`}
                         checked={isSelected}
                         onChange={() => toggleRow(request.id)}
                         className="h-4 w-4 rounded border-border"
                       />
                     </td>
                     <td className="px-4 py-4 font-medium text-muted-foreground">
                       {request.id}
                     </td>
                     <td className="px-4 py-4 font-semibold">{request.title}</td>
                     <td className="px-4 py-4 text-muted-foreground">
                       {request.responsible}
                     </td>
                     <td className="px-4 py-4 text-muted-foreground">
                       {request.dueOn}
                     </td>
                     <td className="px-4 py-4 text-muted-foreground">
                       {request.responsesSubmitted}
                     </td>
                     <td className="px-4 py-4">
                       <span
                         className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                           request.status === "Published"
                             ? "bg-emerald-50 text-emerald-700"
                             : "bg-blue-50 text-blue-700"
                         }`}
                       >
                          • {request.status}
                        </span>
                      </td>
                     <td className="px-4 py-4 text-muted-foreground">
                       {request.suppliers ? (
                         <span className="inline-flex rounded bg-muted px-2 py-1 text-xs">
                           {request.suppliers}
                         </span>
                       ) : null}
                     </td>
                     <td className="px-4 py-4 text-muted-foreground">
                       {request.createdAt}
                     </td>
                     <td className="px-4 py-4 text-muted-foreground">
                       {request.updatedAt}
                     </td>
                       <td className="px-4 py-4 text-right">
                           <div className="inline-flex items-center gap-2">
                             <button
                               onClick={() => openEdit(request)}
                               className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                               title={tc.edit}
                               aria-label={`${tc.edit} ${request.title}`}
                             >
                               <EditIcon className="h-3.5 w-3.5" />
                               {tc.edit}
                             </button>
                             <button
                               onClick={() => setConfirmDelete(request)}
                               className="inline-flex items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/20"
                               title={tc.delete}
                               aria-label={`${tc.delete} ${request.title}`}
                               disabled={!session?.user}
                             >
                               <XIcon className="h-3.5 w-3.5" />
                               {tc.delete}
                             </button>
                           </div>
                       </td>
                   </tr>
                 );
               })}
</tbody>
          </table>
        </div>
      </section>

      {createOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={() => setCreateOpen(false)}
        >
          <section
            className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-border p-7">
              <div>
                <h2 className="text-2xl font-bold">{tc.createModalTitle}</h2>
                <p className="mt-3 text-base text-muted-foreground">
                  {tc.createModalBody}
                </p>
              </div>
              <button
                onClick={() => setCreateOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                title="Close"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-7 p-7">
              <div>
                  <label className="mb-3 block text-base font-medium">
                    {tc.selectForm} <span className="text-destructive">*</span>
                  </label>
                <div className="relative">
                  <button
                    onClick={() => setTemplateMenuOpen((open) => !open)}
                    className="flex w-full items-center justify-between rounded-xl border border-input bg-background px-5 py-3.5 text-left text-base"
                  >
                    <span className={selectedTemplate ? "text-foreground" : "text-muted-foreground"}>
                      {selectedTemplate || tc.selectForm}
                    </span>
                    <ChevronDown className="h-5 w-5" />
                  </button>

                  {templateMenuOpen ? (
                    <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
                      <label className="flex items-center gap-3 border-b border-border px-5 py-3">
                        <Search className="h-5 w-5 text-muted-foreground" />
                        <input
                          autoFocus
                          value={templateSearch}
                          onChange={(event) => setTemplateSearch(event.target.value)}
                          placeholder={tc.search}
                          className="w-full bg-transparent text-base outline-none"
                        />
                      </label>
                      <div className="max-h-72 overflow-y-auto">
                        {availableTemplates.map((template) => (
                        <button
                            key={template}
                            onClick={() => selectTemplate(template)}
                            className="block w-full px-5 py-4 text-left text-base hover:bg-muted"
                          >
                            {template}
                          </button>
                        ))}
                         {availableTemplates.length === 0 ? (
                           <p className="px-5 py-4 text-sm text-muted-foreground">
                             {tc.noFormsFound}
                           </p>
                         ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div>
                  <label htmlFor="request-title" className="mb-3 block text-base font-medium">
                    {tc.titleLabel} <span className="text-destructive">*</span>
                  </label>
                <input
                  id="request-title"
                  value={title}
                  readOnly
                  placeholder={tc.titleLockedPlaceholder}
                  className="h-16 w-full rounded-xl border border-input bg-muted/40 px-5 text-base text-foreground outline-none"
                />
                <p className="mt-2 text-xs text-muted-foreground">{tc.titleLockedNote}</p>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t border-border p-6">
              <button
                onClick={() => setCreateOpen(false)}
                className="rounded-xl border border-input px-5 py-2.5 text-base font-semibold shadow-sm hover:bg-muted"
              >
                {tc.cancel}
              </button>
              <button
                disabled={!selectedTemplate || !title.trim()}
                onClick={createRequest}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-base font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
              >
                <CheckCircle2 className="h-4 w-4" />
                {tc.createRequest}
              </button>
</div>
           </section>
         </div>
       ) : null}
      {editOpen && editing ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={() => setEditOpen(false)}
        >
          <section
            className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-border p-7">
              <div>
                <h2 className="text-2xl font-bold">{tc.editModalTitle}</h2>
                <p className="mt-3 text-base text-muted-foreground">
                  {tc.editModalBody}
                </p>
              </div>
              <button
                onClick={() => setEditOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                title={tc.cancel}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-7 p-7">
              <div>
                <label className="mb-3 block text-base font-medium">
                  {tc.selectForm}
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setTemplateMenuOpen((open) => !open)}
                    className="flex w-full items-center justify-between rounded-xl border border-input bg-background px-5 py-3.5 text-left text-base"
                  >
                    <span className={selectedTemplate ? "text-foreground" : "text-muted-foreground"}>
                      {selectedTemplate || tc.selectForm}
                    </span>
                    <ChevronDown className="h-5 w-5" />
                  </button>

                  {templateMenuOpen ? (
                    <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
                      <label className="flex items-center gap-3 border-b border-border px-5 py-3">
                        <Search className="h-5 w-5 text-muted-foreground" />
                        <input
                          autoFocus
                          value={templateSearch}
                          onChange={(event) => setTemplateSearch(event.target.value)}
                          placeholder={tc.search}
                          className="w-full bg-transparent text-base outline-none"
                        />
                      </label>
                      <div className="max-h-72 overflow-y-auto">
                        {availableTemplates.map((template) => (
                          <button
                            key={template}
                            type="button"
                            onClick={() => selectTemplate(template)}
                            className="block w-full px-5 py-4 text-left text-base hover:bg-muted"
                          >
                            {template}
                          </button>
                        ))}
                        {availableTemplates.length === 0 ? (
                          <p className="px-5 py-4 text-sm text-muted-foreground">
                            {tc.noFormsFound}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div>
                <label htmlFor="edit-request-title" className="mb-3 block text-base font-medium">
                  {tc.titleLabel} <span className="text-destructive">*</span>
                </label>
                <input
                  id="edit-request-title"
                  value={title}
                  readOnly
                  placeholder={tc.titleLockedPlaceholder}
                  className="h-16 w-full rounded-xl border border-input bg-muted/40 px-5 text-base text-foreground outline-none"
                />
                <p className="mt-2 text-xs text-muted-foreground">{tc.titleLockedNote}</p>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t border-border p-6">
              <button
                onClick={() => setEditOpen(false)}
                className="rounded-xl border border-input px-5 py-2.5 text-base font-semibold shadow-sm hover:bg-muted"
              >
                {tc.cancel}
              </button>
              <button
                disabled={!title.trim()}
                onClick={saveEdit}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-base font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
              >
                <CheckCircle2 className="h-4 w-4" />
                {tc.updateRequest}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {confirmDelete ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={() => setConfirmDelete(null)}
        >
          <section
            className="w-full max-w-md rounded-xl border border-border bg-card p-7 shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-foreground">{tc.deleteConfirm}</h2>
            <p className="mt-3 text-base text-muted-foreground">{tc.deleteConfirmBody}</p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-xl border border-input px-5 py-2.5 text-base font-semibold shadow-sm hover:bg-muted"
              >
                {tc.cancel}
              </button>
              <button
                onClick={confirmDeleteRequest}
                className="inline-flex items-center gap-2 rounded-xl bg-destructive px-5 py-2.5 text-base font-semibold text-destructive-foreground hover:bg-destructive/90"
              >
                <XIcon className="h-4 w-4" />
                {tc.delete}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
