"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Users, Save, Send, Shield, X, MessageSquare, HelpCircle, Home, ChevronRight, ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { AssessmentStatus, ExternalAssessmentResponse } from "@/app/actions/external-assessments";

interface ExternalAssessmentLandingClientProps {
  initialResponse: ExternalAssessmentResponse;
}

const STATUS_STYLES: Record<AssessmentStatus, { label: string; className: string; icon: React.ReactNode }> = {
  answer_pending: { label: "Answer pending", className: "border-amber-200 bg-amber-50 text-amber-700", icon: <span className="h-2 w-2 rounded-full bg-amber-500" /> },
  in_progress: { label: "In progress", className: "border-sky-200 bg-sky-50 text-sky-700", icon: <svg className="h-4 w-4 animate-spin text-sky-600" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg> },
  submitted: { label: "Submitted", className: "border-emerald-200 bg-emerald-50 text-emerald-700", icon: <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg> },
  rejected: { label: "Rejected", className: "border-rose-200 bg-rose-50 text-rose-700", icon: <span className="h-2 w-2 rounded-full bg-rose-500" /> },
};

export function ExternalAssessmentLandingClient({ initialResponse }: ExternalAssessmentLandingClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [response, setResponse] = React.useState<ExternalAssessmentResponse>(initialResponse);
  const [isHelpOpen, setIsHelpOpen] = React.useState(true);
  const [activeHelpTab, setActiveHelpTab] = React.useState<'home' | 'messages' | 'help'>('home');

  const statusStyle = STATUS_STYLES[response.status];

  React.useEffect(() => {
    if (response.status === "answer_pending" && !searchParams.get("landing")) {
      router.replace(`${window.location.pathname}?landing=1`);
    }
  }, [response.status, searchParams, router]);

  const handleStartNow = () => {
    router.push(`/external/assessments/${response.assessmentRequestId}/requests/${response.id}/form`);
  };

  const handleShareRequest = () => {
    router.push(`/external/assessments/${response.assessmentRequestId}/requests/${response.id}/share`);
  };

  const contactName = response.supplierContact?.name || "Supplier Contact";
  const contactEmail = response.supplierContact?.email || "";
  const contactInitials = contactName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans relative">
      {/* Top Global Navigation Bar */}
      <header className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between">
        <div className="font-bold text-lg tracking-wide text-green-700">PMA</div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleShareRequest}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-50 font-medium flex items-center gap-1.5 text-gray-700"
          >
            <ArrowUp className="h-4 w-4" />
            Share Request
          </button>
          <div className="border-l border-gray-200 h-5 mx-1" />
          <button className="text-sm border border-gray-300 rounded-md px-2 py-1.5 flex items-center gap-1 font-medium text-gray-700">
            <span className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-[10px] font-bold">EN</span>
            </span>
            English
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-4xl mx-auto py-10 px-4 space-y-6">
        {/* Assessment Title Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {response.assessmentTitle || "Assessment PMA & Code of Conduct"}
              </h1>
              <Badge variant="outline" className={`${statusStyle.className} flex items-center gap-1.5`}>
                {statusStyle.icon}
                {statusStyle.label}
              </Badge>
            </div>
            <p className="text-xs text-gray-500">
              {response.supplierAddress?.company || "PRETTL Mechatronics & Actuators GmbH"}
            </p>
          </div>

          {/* Contact Badge */}
          <div className="flex items-center space-x-3 bg-gray-50 p-2.5 rounded-lg border border-gray-100 self-start">
            <Avatar className="w-9 h-9">
              <AvatarFallback className="text-xs font-bold text-gray-600 bg-gray-200">
                {contactInitials || "SK"}
              </AvatarFallback>
            </Avatar>
            <div className="text-xs">
              <p className="font-semibold text-gray-900">{contactName}</p>
              {contactEmail && (
                <a href={`mailto:${contactEmail}`} className="text-orange-600 hover:underline">
                  {contactEmail}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* How it works Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm space-y-8">
          <h2 className="text-center text-lg font-bold text-gray-900">How it works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm text-gray-900">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Users className="h-4 w-4 text-emerald-600" />
                </div>
                <span>Share with colleagues</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Work together with your colleagues at any time via the Share Request button at the top of the page.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm text-gray-900">
                <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
                  <Save className="h-4 w-4 text-sky-600" />
                </div>
                <span>Save as draft and edit at any time</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Access your details at any time via your invitation link without additional registration.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm text-gray-900">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                  <Send className="h-4 w-4 text-violet-600" />
                </div>
                <span>Submit with one click</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Once you have filled out the request, you can submit it with one click.
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center justify-center space-x-4 pt-4 border-t border-gray-100">
            <button
              onClick={handleShareRequest}
              className="px-6 py-2.5 border border-gray-300 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              <ArrowUp className="h-4 w-4" />
              Share Request
            </button>
            <button
              onClick={handleStartNow}
              className="px-6 py-2.5 bg-gray-900 text-white rounded-md text-sm font-semibold hover:bg-black transition flex items-center gap-2"
            >
              Start now
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* How is my data handled Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-gray-900 font-bold text-base">
            <Shield className="h-5 w-5 text-emerald-600" />
            <h2>How is my data handled?</h2>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed max-w-3xl">
            We use the personal data you provide exclusively for the purposes of our supplier management. The use of this data is strictly in accordance with our data protection principles. By submitting this form, you agree to this.
          </p>
          <div className="text-xs pt-1">
            <span className="text-gray-400">More Information: </span>
            <a href="#" className="text-gray-700 underline font-medium hover:text-black">
              Privacy Policy & Terms of Service
            </a>
          </div>
        </div>
      </main>

      {/* Floating Support/Help Chat Widget */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start space-y-3">
        {/* Help Drawer Modal */}
        {isHelpOpen && (
          <div className="w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
            {/* Widget Header */}
            <div className="p-5 border-b border-gray-100 relative bg-white">
              <button
                onClick={() => setIsHelpOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-sm font-semibold"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-orange-500 text-lg">✦</span>
                <div className="flex -space-x-2 overflow-hidden">
                  <Avatar className="h-6 w-6 ring-2 ring-white">
                    <AvatarFallback className="text-xs font-medium bg-emerald-100 text-emerald-700">A</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-6 w-6 ring-2 ring-white">
                    <AvatarFallback className="text-xs font-medium bg-sky-100 text-sky-700">B</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-6 w-6 ring-2 ring-white">
                    <AvatarFallback className="text-xs font-medium bg-violet-100 text-violet-700">C</AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <h3 className="text-base font-bold text-gray-900 leading-snug">
                Hi {contactName.split(' ')[0]} 👋<br />How can we help?
              </h3>
            </div>

            {/* Widget Body */}
            <div className="p-4 space-y-4 bg-gray-50/50 flex-1">
              {/* Start Conversation Button */}
              <button className="w-full bg-white border border-gray-200 rounded-lg p-3 text-left text-xs font-semibold text-gray-800 flex justify-between items-center shadow-sm hover:border-gray-300">
                <span>Start a conversation</span>
                <MessageSquare className="h-4 w-4 text-gray-400" />
              </button>

              {/* Help Search Section */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block px-1">
                  Search for help
                </span>
                <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100 shadow-sm text-xs">
                  <div className="p-2.5 flex justify-between items-center hover:bg-gray-50 cursor-pointer">
                    <span className="text-gray-700 flex items-center gap-1.5">
                      <span>📑</span> Assessment Guide
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="p-2.5 flex justify-between items-center hover:bg-gray-50 cursor-pointer">
                    <span className="text-gray-700">Completing the PMA Questionnaire</span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="p-2.5 flex justify-between items-center hover:bg-gray-50 cursor-pointer">
                    <span className="text-gray-700 truncate">Understanding Code of Conduct Requirements...</span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Widget Bottom Tab Bar */}
            <div className="bg-white border-t border-gray-100 px-6 py-2.5 flex justify-between text-[11px] font-semibold">
              <button
                onClick={() => setActiveHelpTab('home')}
                className={`flex flex-col items-center space-y-0.5 ${activeHelpTab === 'home' ? 'text-black' : 'text-gray-400'}`}
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </button>
              <button
                onClick={() => setActiveHelpTab('messages')}
                className={`flex flex-col items-center space-y-0.5 ${activeHelpTab === 'messages' ? 'text-black' : 'text-gray-400'}`}
              >
                <MessageSquare className="h-4 w-4" />
                <span>Messages</span>
              </button>
              <button
                onClick={() => setActiveHelpTab('help')}
                className={`flex flex-col items-center space-y-0.5 ${activeHelpTab === 'help' ? 'text-black' : 'text-gray-400'}`}
              >
                <HelpCircle className="h-4 w-4" />
                <span>Help</span>
              </button>
            </div>
          </div>
        )}

        {/* Floating Toggle Button */}
        <button
          onClick={() => setIsHelpOpen(!isHelpOpen)}
          className="w-12 h-12 bg-gray-900 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-black transition-transform active:scale-95"
        >
          {isHelpOpen ? <ChevronDown className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        </button>
      </div>
    </div>
  );
}