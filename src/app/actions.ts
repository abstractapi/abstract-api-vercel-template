"use server";

import { headers } from "next/headers";

import { checkEmail } from "@/lib/abstract/email";
import { checkIp } from "@/lib/abstract/ip";
import { checkPhone } from "@/lib/abstract/phone";
import { CHECKS } from "@/lib/checks";
import { createAccount } from "@/lib/create-account";
import { decide } from "@/lib/rules";
import { testMode } from "@/lib/test-mode";
import { verifyTurnstile } from "@/lib/turnstile";
import type { CheckResults, Decision } from "@/lib/types";

export type SignupValues = { name: string; email: string; phone: string; ip: string };

export type SignupState =
  | { status: "idle"; values: SignupValues }
  | {
      status: "invalid";
      values: SignupValues;
      errors: Partial<Record<keyof SignupValues | "form", string>>;
    }
  | {
      status: "done";
      values: SignupValues;
      decision: Decision;
      results: CheckResults;
      accountId: string | null;
    };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signup(
  _previous: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const values: SignupValues = {
    name: field(formData, "name"),
    email: field(formData, "email"),
    phone: CHECKS.includes("phone") ? field(formData, "phone") : "",
    ip: field(formData, "ip"),
  };

  const errors: Partial<Record<keyof SignupValues | "form", string>> = {};
  if (!values.name) errors.name = "Enter a name";
  if (!EMAIL_PATTERN.test(values.email)) errors.email = "Enter a valid email address";
  const phoneDigits = values.phone.replace(/[^\d]/g, "");
  if (values.phone && (phoneDigits.length < 8 || phoneDigits.length > 15))
    errors.phone = "Enter the number with its country code, like +1 202 555 0143";

  const requestIp = await clientIp();
  const ipAddress = testMode() && values.ip ? values.ip : requestIp;

  const human = await verifyTurnstile(
    field(formData, "cf-turnstile-response") || null,
    requestIp,
  );
  if (!human) errors.form = "Bot check failed. Try again.";
  if (Object.keys(errors).length > 0) return { status: "invalid", values, errors };

  // All checks run in parallel, so a signup waits for the slowest one only.
  const [email, phone, ip] = await Promise.all([
    CHECKS.includes("email") ? checkEmail(values.email) : undefined,
    CHECKS.includes("phone") && values.phone
      ? checkPhone(values.phone)
      : undefined,
    CHECKS.includes("ip")
      ? ipAddress && isPublicIp(ipAddress)
        ? checkIp(ipAddress)
        : ({
            status: "skipped",
            message: "Local request: the IP check runs once deployed",
          } as const)
      : undefined,
  ]);

  const results: CheckResults = {
    email,
    phone,
    ip: ip && { ...ip, ipAddress: ipAddress ?? undefined },
  };
  const decision = decide(results);

  const accountId =
    decision.verdict === "block"
      ? null
      : (
          await createAccount({
            name: values.name,
            email: values.email,
            phone: values.phone || null,
            verdict: decision.verdict,
          })
        ).id;

  return { status: "done", values, decision, results, accountId };
}

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

// Vercel sets x-forwarded-for to the visitor's address.
async function clientIp(): Promise<string | null> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip") || null;
}

function isPublicIp(ip: string): boolean {
  return !/^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|::1$|::ffff:127\.|f[cd][0-9a-f]{2}:|fe80:)/i.test(
    ip,
  );
}
