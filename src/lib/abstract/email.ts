import "server-only";

import type { CheckOutcome, EmailData } from "@/lib/types";
import { callAbstract, get } from "./client";

// Email Intelligence: deliverability, disposable and risk signals for an address.
export function checkEmail(email: string): Promise<CheckOutcome<EmailData>> {
  return callAbstract(
    "https://emailreputation.abstractapi.com/v1/",
    { email },
    "ABSTRACT_EMAIL_INTELLIGENCE_API_KEY",
    (json) => ({
      deliverability: get(json, "email_deliverability.status"),
      qualityScore: get(json, "email_quality.score"),
      isDisposable: get(json, "email_quality.is_disposable"),
      isFreeEmail: get(json, "email_quality.is_free_email"),
      isRole: get(json, "email_quality.is_role"),
      isUsernameSuspicious: get(json, "email_quality.is_username_suspicious"),
      addressRisk: get(json, "email_risk.address_risk_status"),
      domainRisk: get(json, "email_risk.domain_risk_status"),
      totalBreaches: get(json, "email_breaches.total_breaches"),
    }),
  );
}
