'use client';

import { RouteErrorView } from "@/components/shared/route-error-view";

export default function AssessmentDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorView
      error={error}
      reset={reset}
      scope="assessment-detail"
      description="We couldn't load this assessment request. This could be a transient issue or the request may no longer be available. You can retry without leaving the page."
    />
  );
}
