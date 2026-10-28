"use client";

import Script from "next/script";
import { useActionState, useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

import { signup, type SignupState, type SignupValues } from "@/app/actions";
import { ResultPanel } from "@/components/result-panel";
import type { ProductId } from "@/lib/types";

const EMPTY: SignupValues = { name: "", email: "", phone: "", ip: "" };

// Inputs that trip several rules at once, for trying the form in test mode.
const RISKY_SAMPLE: SignupValues = {
  name: "Test User",
  email: "test@mailinator.com",
  phone: "+1 202 555 0143",
  ip: "185.220.101.1",
};

declare global {
  interface Window {
    turnstile?: { reset: () => void };
  }
}

export function SignupForm({
  checks,
  testMode,
  turnstileSiteKey,
}: {
  checks: ProductId[];
  testMode: boolean;
  turnstileSiteKey: string | null;
}) {
  const [state, action, pending] = useActionState<SignupState, FormData>(
    submitSignup,
    { status: "idle", values: EMPTY },
  );
  const [values, setValues] = useState<SignupValues>(state.values);
  const errors = state.status === "invalid" ? state.errors : {};

  // A Turnstile token is single use.
  useEffect(() => {
    if (state.status !== "idle") window.turnstile?.reset();
  }, [state]);

  const set = (name: keyof SignupValues) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [name]: e.target.value }));

  return (
    <div className="space-y-6">
      <form
        action={action}
        className="space-y-4 rounded-xl border border-border p-6"
        noValidate
      >
        <h2 className="text-lg font-semibold tracking-tight">Create an account</h2>

        <Field label="Name" name="name" error={errors.name}>
          <input
            id="name"
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={set("name")}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={inputClass}
          />
        </Field>

        <Field label="Email" name="email" error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={set("email")}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={inputClass}
          />
        </Field>

        {checks.includes("phone") && (
          <Field label="Phone number" name="phone" optional error={errors.phone}>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+1 202 555 0143"
              value={values.phone}
              onChange={set("phone")}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              className={inputClass}
            />
          </Field>
        )}

        {testMode && checks.includes("ip") && (
          <Field label="IP address (test mode)" name="ip" optional error={errors.ip}>
            <input
              id="ip"
              name="ip"
              placeholder="Your connection's IP"
              value={values.ip}
              onChange={set("ip")}
              aria-invalid={Boolean(errors.ip)}
              aria-describedby={errors.ip ? "ip-error" : undefined}
              className={`${inputClass} font-mono`}
            />
          </Field>
        )}

        {turnstileSiteKey && (
          <>
            <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
            <div className="cf-turnstile" data-sitekey={turnstileSiteKey} />
          </>
        )}

        {errors.form && <p className="text-xs text-block-foreground">{errors.form}</p>}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 font-medium text-primary-foreground hover:brightness-95 disabled:opacity-60"
          >
            {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
            {pending ? "Checking" : "Sign up"}
          </button>
          {testMode && (
            <button
              type="button"
              onClick={() => setValues(RISKY_SAMPLE)}
              className="inline-flex h-9 items-center rounded-md border border-border px-4 font-medium hover:bg-muted"
            >
              Fill a risky signup
            </button>
          )}
        </div>
      </form>

      {state.status === "done" && (
        <ResultPanel
          decision={state.decision}
          results={state.results}
          accountId={state.accountId}
        />
      )}
    </div>
  );
}

// A request that never reaches the server action (a rate limit rule answering
// 429, a network drop, a deploy in progress) would otherwise replace the whole
// page with an error screen. Keep the form and what the visitor typed instead.
async function submitSignup(previous: SignupState, formData: FormData): Promise<SignupState> {
  try {
    return await signup(previous, formData);
  } catch {
    const value = (name: string) => String(formData.get(name) ?? "");
    return {
      status: "invalid",
      values: { name: value("name"), email: value("email"), phone: value("phone"), ip: value("ip") },
      errors: { form: "Could not check this signup. Wait a few minutes and try again." },
    };
  }
}

const inputClass =
  "h-9 w-full rounded-md border border-border bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring/40 aria-invalid:border-block-foreground";

function Field({
  label,
  name,
  optional,
  error,
  children,
}: {
  label: string;
  name: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="flex gap-1 font-medium">
        {label}
        {optional && <span className="font-normal text-muted-foreground">(optional)</span>}
      </label>
      {children}
      {error && (
        <p id={`${name}-error`} className="text-xs text-block-foreground">
          {error}
        </p>
      )}
    </div>
  );
}
