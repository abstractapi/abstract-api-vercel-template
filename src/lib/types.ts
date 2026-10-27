export type Verdict = "allow" | "review" | "block";

export type ProductId = "email" | "phone" | "ip";

// The subset of each Abstract API response that the rules and the UI read.
// Full responses: https://docs.abstractapi.com

export type EmailData = {
  deliverability: string | null;
  qualityScore: number | null;
  isDisposable: boolean | null;
  isFreeEmail: boolean | null;
  isRole: boolean | null;
  isUsernameSuspicious: boolean | null;
  addressRisk: string | null;
  domainRisk: string | null;
  totalBreaches: number | null;
};

export type PhoneData = {
  isValid: boolean | null;
  isVoip: boolean | null;
  lineType: string | null;
  carrier: string | null;
  countryCode: string | null;
  countryName: string | null;
  riskLevel: string | null;
  isDisposable: boolean | null;
  isAbuseDetected: boolean | null;
  international: string | null;
};

export type IpData = {
  isVpn: boolean | null;
  isProxy: boolean | null;
  isTor: boolean | null;
  isHosting: boolean | null;
  isRelay: boolean | null;
  isAbuse: boolean | null;
  countryCode: string | null;
  countryName: string | null;
  city: string | null;
  asnName: string | null;
};

export type CheckOutcome<T> =
  | { status: "ok"; data: T }
  | { status: "not_configured"; envVar: string }
  | { status: "skipped"; message: string }
  | { status: "error"; message: string };

export type CheckResults = {
  email?: CheckOutcome<EmailData>;
  phone?: CheckOutcome<PhoneData>;
  ip?: CheckOutcome<IpData> & { ipAddress?: string };
};

export type Reason = {
  product: ProductId | "cross";
  verdict: Exclude<Verdict, "allow">;
  message: string;
};

export type Decision = {
  verdict: Verdict;
  reasons: Reason[];
};
