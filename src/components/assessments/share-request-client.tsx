"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Users, X, Plus, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type ContactRow = { id: string; name: string | null; email: string };

interface ShareRequestClientProps {
  assessmentId: string;
  requestId: string;
  organization: string;
  subject: string;
  existingAccess: ContactRow[];
  orgContacts: ContactRow[];
  onClose: () => void;
}

export function ShareRequestClient({
  assessmentId,
  requestId,
  organization,
  subject,
  existingAccess,
  orgContacts,
  onClose,
}: ShareRequestClientProps) {
  const router = useRouter();
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [comboboxOpen, setComboboxOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [addOpen, setAddOpen] = React.useState(false);
  const [sharing, setSharing] = React.useState(false);

  const newContacts = React.useMemo(
    () => orgContacts.filter((c) => !existingAccess.some((e) => e.email === c.email)),
    [orgContacts, existingAccess]
  );

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return newContacts.filter(
      (c) =>
        !selected.has(c.email) &&
        (!q || c.name?.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))
    );
  }, [newContacts, search, selected]);

  const toggle = (email: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  };

  const handleShare = async () => {
    const emails = [...selected];
    if (emails.length === 0) return;
    setSharing(true);
    try {
      const res = await fetch(`/api/assessments/${requestId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error ?? "Could not share request");
        return;
      }
      toast.success(`Invitation sent to ${emails.length} recipient(s)`);
      onClose();
      router.push(`/requests/assessments/${assessmentId}?tab=form`);
    } catch {
      toast.error("Could not share request");
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" /> Go back
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-semibold text-slate-900">Axiom</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <div className="mb-6">
          <p className="text-xs text-slate-500">Request by {organization}</p>
          <h1 className="text-xl font-bold text-slate-900 mt-1">{subject}</h1>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Share Request with colleagues</h3>
          <p className="mt-1 text-sm text-slate-600">
            Answer this Request together. Everyone you select gets access through their own
            link by email.
          </p>

          <div className="mt-5">
            <label className="text-sm font-medium text-slate-700">Share with</label>
            <div className="relative mt-1">
              <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  className="flex-1 outline-none text-sm"
                  placeholder="Type name or email"
                  value={search}
                  onFocus={() => setComboboxOpen(true)}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setComboboxOpen(true);
                  }}
                />
                {comboboxOpen && (
                  <button
                    onClick={() => setComboboxOpen(false)}
                    className="text-slate-400 hover:text-slate-600"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {comboboxOpen && (
                <div className="absolute z-30 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
                  <div className="p-2">
                    <div className="flex items-center gap-2 rounded-md bg-slate-50 px-2 py-1.5">
                      <Search className="h-4 w-4 text-slate-400" />
                      <input
                        autoFocus
                        className="flex-1 bg-transparent outline-none text-sm"
                        placeholder="Search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="max-h-56 overflow-y-auto border-t border-slate-100">
                    {filtered.length === 0 && (
                      <div className="px-3 py-3 text-sm text-slate-500">No contacts found</div>
                    )}
                    {filtered.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => toggle(c.email)}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50"
                      >
                        <span>
                          <span className="font-medium text-slate-800">{c.name ?? "—"}</span>
                          <span className="block text-xs text-slate-500">{c.email}</span>
                        </span>
                        <span
                          className={`h-4 w-4 rounded border flex items-center justify-center ${
                            selected.has(c.email)
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : "border-slate-300"
                          }`}
                        >
                          {selected.has(c.email) && <Check className="h-3 w-3" />}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-slate-100 p-2">
                    <button
                      onClick={() => {
                        setComboboxOpen(false);
                        setAddOpen(true);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                    >
                      <Plus className="h-4 w-4" /> Add contact
                    </button>
                  </div>
                </div>
              )}
            </div>

            {selected.size > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {[...selected].map((email) => (
                  <span
                    key={email}
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700"
                  >
                    {email}
                    <button onClick={() => toggle(email)} aria-label="Remove">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-medium text-slate-700">Who already has access</h4>
            <div className="mt-2 max-h-48 overflow-auto rounded-lg border border-slate-200">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2 font-medium">Name</th>
                    <th className="px-3 py-2 font-medium">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {existingAccess.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-3 py-4 text-center text-slate-400">
                        No one has access yet
                      </td>
                    </tr>
                  )}
                  {existingAccess.map((c) => (
                    <tr key={c.id} className="border-t border-slate-100">
                      <td className="px-3 py-2 text-slate-800">{c.name ?? "—"}</td>
                      <td className="px-3 py-2">
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700">
                          {c.email}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="gap-2 bg-slate-900 hover:bg-slate-800 text-white"
              disabled={selected.size === 0 || sharing}
              onClick={handleShare}
            >
              {sharing ? "Sharing…" : "Share"}
              <Users className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>

      <AddContactModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreated={(email) => {
          setSelected((prev) => new Set(prev).add(email));
        }}
      />
    </div>
  );
}

function AddContactModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (email: string) => void;
}) {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [language, setLanguage] = React.useState("");
  const [department, setDepartment] = React.useState("");
  const [responsibility, setResponsibility] = React.useState("");
  const [position, setPosition] = React.useState("");

  const reset = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setLanguage("");
    setDepartment("");
    setResponsibility("");
    setPosition("");
  };

  const valid = email.trim().length > 0;

  const handleCreate = () => {
    if (!valid) return;
    onCreated(email.trim().toLowerCase());
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Contact</DialogTitle>
          <DialogDescription>Enter the contact&apos;s information.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700">First name</label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Last name</label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Email <span className="text-rose-500">*</span>
            </label>
            <Input
              type="email"
              placeholder="Enter business email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Phone number</label>
            <Input placeholder="Add phone numbers" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700">Language</label>
              <Input placeholder="Select language" value={language} onChange={(e) => setLanguage(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Department</label>
              <Input placeholder="Select Department" value={department} onChange={(e) => setDepartment(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700">Responsibility</label>
              <Input
                placeholder="Select Responsibility"
                value={responsibility}
                onChange={(e) => setResponsibility(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Position</label>
              <Input placeholder="Position" value={position} onChange={(e) => setPosition(e.target.value)} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-slate-900 hover:bg-slate-800 text-white"
            disabled={!valid}
            onClick={handleCreate}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}