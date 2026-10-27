import { CircleCheck, CircleX, TriangleAlert } from "lucide-react";

import { DASHBOARD_URL } from "@/lib/links";
import { PRODUCTS } from "@/lib/checks";
import type {
  CheckOutcome,
  CheckResults,
  Decision,
  EmailData,
  IpData,
  PhoneData,
  ProductId,
  Verdict,
} from "@/lib/types";

const VERDICTS: Record<Verdict, { label: string; className: string; Icon: typeof CircleCheck }> = {
  allow: { label: "Allow", className: "bg-allow text-allow-foreground", Icon: CircleCheck },
  review: { label: "Review", className: "bg-review text-review-foreground", Icon: TriangleAlert },
  block: { label: "Block", className: "bg-block text-block-foreground", Icon: CircleX },
};

export function ResultPanel({
  decision,
  results,
  accountId,
}: {
  decision: Decision;
  results: CheckResults;
  accountId: string | null;
}) {
  const { label, className, Icon } = VERDICTS[decision.verdict];

  return (
    <section aria-live="polite" className="divide-y divide-border rounded-xl border border-border">
      <div className="space-y-3 p-6">
        <div className="flex items-center justify-between gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-medium ${className}`}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </span>
          <span className="text-xs text-muted-foreground">
            {accountId ? (
              <>
                Account created <span className="font-mono">{accountId.slice(0, 8)}</span>
              </>
            ) : (
              "No account created"
            )}
          </span>
        </div>
        {decision.reasons.length > 0 ? (
          <ul className="space-y-1">
            {decision.reasons.map((reason) => (
              <li key={reason.message} className="flex items-start gap-2">
                <span
                  className={`mt-1.5 size-2 shrink-0 rounded-full ${
                    reason.verdict === "block" ? "bg-block-foreground" : "bg-review-foreground"
                  }`}
                  aria-hidden
                />
                {reason.message}
              </li>
            ))}
          </ul>
        ) : (
          <p>No risk signals found.</p>
        )}
      </div>

      {results.email && (
        <ProductResult product="email" outcome={results.email} rows={emailRows} />
      )}
      {results.phone && (
        <ProductResult product="phone" outcome={results.phone} rows={phoneRows} />
      )}
      {results.ip && (
        <ProductResult
          product="ip"
          outcome={results.ip}
          rows={(data) => ipRows(data, results.ip?.ipAddress)}
        />
      )}
    </section>
  );
}

type Row = { label: string; value: string; flagged?: boolean };

function ProductResult<T>({
  product,
  outcome,
  rows,
}: {
  product: ProductId;
  outcome: CheckOutcome<T>;
  rows: (data: T) => Row[];
}) {
  const { name, envVar } = PRODUCTS[product];

  return (
    <div className="space-y-3 p-6">
      <h3 className="font-medium">{name}</h3>
      {outcome.status === "ok" && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
          {rows(outcome.data).map((row) => (
            <div key={row.label} className="contents">
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className={row.flagged ? "font-medium text-block-foreground" : undefined}>
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
      {outcome.status === "not_configured" && (
        <p className="text-muted-foreground">
          Not connected. Set <code className="font-mono text-foreground">{envVar}</code>{" "}
          with a key from the{" "}
          <a href={DASHBOARD_URL} className="text-link underline">
            Abstract dashboard
          </a>
          .
        </p>
      )}
      {outcome.status === "skipped" && (
        <p className="text-muted-foreground">{outcome.message}</p>
      )}
      {outcome.status === "error" && (
        <p className="text-block-foreground">Check failed: {outcome.message}</p>
      )}
    </div>
  );
}

function emailRows(e: EmailData): Row[] {
  return [
    { label: "Deliverability", value: text(e.deliverability), flagged: e.deliverability === "undeliverable" },
    { label: "Disposable", value: yesNo(e.isDisposable), flagged: e.isDisposable === true },
    { label: "Free provider", value: yesNo(e.isFreeEmail) },
    { label: "Role address", value: yesNo(e.isRole) },
    { label: "Address risk", value: text(e.addressRisk), flagged: e.addressRisk === "high" },
    { label: "Domain risk", value: text(e.domainRisk), flagged: e.domainRisk === "high" },
    { label: "Quality score", value: e.qualityScore === null ? "Unknown" : e.qualityScore.toFixed(2) },
    { label: "Known breaches", value: e.totalBreaches === null ? "Unknown" : String(e.totalBreaches) },
  ];
}

function phoneRows(p: PhoneData): Row[] {
  return [
    { label: "Number", value: text(p.international) },
    { label: "Valid", value: yesNo(p.isValid), flagged: p.isValid === false },
    { label: "Line type", value: text(p.lineType) },
    { label: "Carrier", value: text(p.carrier) },
    { label: "Country", value: text(p.countryName) },
    { label: "VoIP", value: yesNo(p.isVoip), flagged: p.isVoip === true },
    { label: "Risk level", value: text(p.riskLevel), flagged: p.riskLevel === "high" },
    { label: "Disposable", value: yesNo(p.isDisposable), flagged: p.isDisposable === true },
  ];
}

function ipRows(i: IpData, ipAddress?: string): Row[] {
  return [
    { label: "IP address", value: text(ipAddress ?? null) },
    { label: "Location", value: [i.city, i.countryName].filter(Boolean).join(", ") || "Unknown" },
    { label: "Network", value: text(i.asnName) },
    { label: "VPN", value: yesNo(i.isVpn), flagged: i.isVpn === true },
    { label: "Proxy", value: yesNo(i.isProxy), flagged: i.isProxy === true },
    { label: "Tor", value: yesNo(i.isTor), flagged: i.isTor === true },
    { label: "Hosting provider", value: yesNo(i.isHosting), flagged: i.isHosting === true },
    { label: "Abuse reported", value: yesNo(i.isAbuse), flagged: i.isAbuse === true },
  ];
}

function yesNo(value: boolean | null): string {
  return value === null ? "Unknown" : value ? "Yes" : "No";
}

function text(value: string | null): string {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
}
