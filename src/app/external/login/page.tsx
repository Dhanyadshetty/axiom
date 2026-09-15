import { Suspense } from "react";
import { ExternalLoginClient, ExternalLoginScreen } from "./ExternalLoginClient";

export const dynamic = "force-dynamic";

export default function ExternalLoginPage() {
  return (
    <Suspense fallback={<ExternalLoginScreen />}>
      <ExternalLoginClient />
    </Suspense>
  );
}