import type { CheckResults, Decision, ProductId, Reason } from "@/lib/types";

// Edit these rules to match your risk appetite. Any "block" reason blocks the
// signup, any "review" reason flags it, and no reason allows it. A check that
// is missing, skipped or failed adds no reason, so signups fail open.
export function decide(results: CheckResults): Decision {
  const reasons: Reason[] = [];
  const block = (product: Reason["product"], message: string) =>
    reasons.push({ product, verdict: "block", message });
  const review = (product: Reason["product"], message: string) =>
    reasons.push({ product, verdict: "review", message });

  const email = ok(results, "email");
  if (email) {
    if (email.isDisposable) block("email", "Disposable email address");
    if (email.deliverability === "undeliverable")
      block("email", "Email address cannot receive mail");
    if (email.addressRisk === "high") review("email", "High-risk email address");
    if (email.domainRisk === "high") review("email", "High-risk email domain");
    if (email.isUsernameSuspicious)
      review("email", "Email username looks auto-generated");
  }

  const phone = ok(results, "phone");
  if (phone) {
    if (phone.isValid === false) block("phone", "Phone number is not valid");
    if (phone.isDisposable) block("phone", "Disposable phone number");
    if (phone.riskLevel === "high") block("phone", "High-risk phone number");
    if (phone.riskLevel === "medium") review("phone", "Medium-risk phone number");
    if (phone.isVoip) review("phone", "VoIP phone number");
    if (phone.isAbuseDetected) review("phone", "Phone number linked to abuse");
  }

  const ip = ok(results, "ip");
  if (ip) {
    if (ip.isTor) block("ip", "Signup from the Tor network");
    if (ip.isVpn || ip.isProxy || ip.isRelay)
      review("ip", "Signup through a VPN or proxy");
    if (ip.isHosting) review("ip", "Signup from a hosting provider");
    if (ip.isAbuse) review("ip", "IP address linked to abuse");
  }

  if (phone?.countryCode && ip?.countryCode && phone.countryCode !== ip.countryCode)
    review(
      "cross",
      `Phone country (${phone.countryCode}) differs from IP country (${ip.countryCode})`,
    );

  const verdict = reasons.some((r) => r.verdict === "block")
    ? "block"
    : reasons.length > 0
      ? "review"
      : "allow";
  return { verdict, reasons };
}

function ok<K extends ProductId>(results: CheckResults, product: K) {
  const outcome = results[product];
  return outcome?.status === "ok"
    ? (outcome.data as Extract<NonNullable<CheckResults[K]>, { status: "ok" }>["data"])
    : null;
}
