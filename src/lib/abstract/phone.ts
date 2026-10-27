import "server-only";

import type { CheckOutcome, PhoneData } from "@/lib/types";
import { callAbstract, get } from "./client";

// Phone Intelligence: validity, line type, carrier and risk for a number.
// Send numbers in international format: a bare 10-digit US number can be
// read as a number from another country.
export function checkPhone(phone: string): Promise<CheckOutcome<PhoneData>> {
  return callAbstract(
    "https://phoneintelligence.abstractapi.com/v1/",
    { phone: phone.replace(/[^\d]/g, "") },
    "ABSTRACT_PHONE_INTELLIGENCE_API_KEY",
    (json) => ({
      isValid: get(json, "phone_validation.is_valid"),
      isVoip: get(json, "phone_validation.is_voip"),
      lineType: get(json, "phone_carrier.line_type"),
      carrier: get(json, "phone_carrier.name"),
      countryCode: get(json, "phone_location.country_code"),
      countryName: get(json, "phone_location.country_name"),
      riskLevel: get(json, "phone_risk.risk_level"),
      isDisposable: get(json, "phone_risk.is_disposable"),
      isAbuseDetected: get(json, "phone_risk.is_abuse_detected"),
      international: get(json, "phone_format.international"),
    }),
  );
}
