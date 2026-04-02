import { Suspense } from "react";
import { VerifyClaimStatus } from "@/components/auth/verify-claim-status";

export default function VerifyClaimPage() {
  return (
    <Suspense>
      <VerifyClaimStatus />
    </Suspense>
  );
}
