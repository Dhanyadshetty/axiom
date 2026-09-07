"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { ExternalLoginScreen } from "./page";

export function ExternalLoginClient() {
  const params = useSearchParams();
  const token = params.get("magictoken");
  const redirect = params.get("redirect") || "";

  React.useEffect(() => {
    if (!token) return;
    const target =
      `/api/external/login?magictoken=${encodeURIComponent(token)}` +
      `&redirect=${encodeURIComponent(redirect || "/external/assessment")}`;
    // Navigate to the API endpoint which validates the token, sets the
    // session cookie and 302-redirects to the request landing page.
    window.location.href = target;
  }, [token, redirect]);

  if (!token) {
    return (
      <ExternalLoginScreen message="This access link is missing its security token. Please use the link from your invitation email." />
    );
  }

  return <ExternalLoginScreen />;
}
