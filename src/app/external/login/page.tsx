import { Suspense } from "react";
import { ExternalLoginClient } from "./ExternalLoginClient";

export const dynamic = "force-dynamic";

export default function ExternalLoginPage() {
  return (
    <Suspense fallback={<ExternalLoginScreen />}>
      <ExternalLoginClient />
    </Suspense>
  );
}

export function ExternalLoginScreen({ message }: { message?: string }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{
        background:
          "linear-gradient(180deg, #ffffff 0%, #fff7ed 55%, #ffedd5 100%)",
      }}
    >
      <div className="flex flex-col items-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-full bg-orange-200/60 blur-2xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/30">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-10 w-10 text-white"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2z" />
              <path d="M19 14l.9 2.6L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-1z" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Stay Stronger.
        </h1>
        <p className="mt-3 max-w-xs text-sm text-slate-500">
          {message ?? "Securing your access to the supplier assessment…"}
        </p>
        <div className="mt-8 h-1 w-40 overflow-hidden rounded-full bg-orange-100">
          <div className="h-full w-1/2 animate-[loading_1.1s_ease-in-out_infinite] rounded-full bg-orange-500" />
        </div>
      </div>
      <style>{`@keyframes loading{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}`}</style>
    </div>
  );
}
