import "server-only";

import type { CheckOutcome } from "@/lib/types";

const TIMEOUT_MS = 5000;

// Calls one Abstract API with the key from `envVar`. A missing key or a failed
// call never throws: the signup still gets a verdict from the other checks.
export async function callAbstract<T>(
  endpoint: string,
  params: Record<string, string>,
  envVar: string,
  pick: (json: Record<string, unknown>) => T,
): Promise<CheckOutcome<T>> {
  const apiKey = process.env[envVar];
  if (!apiKey) return { status: "not_configured", envVar };

  const url = new URL(endpoint);
  url.search = new URLSearchParams({ api_key: apiKey, ...params }).toString();

  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return { status: "error", message: await errorMessage(res) };
    return { status: "ok", data: pick(await res.json()) };
  } catch (err) {
    const timedOut = err instanceof DOMException && err.name === "TimeoutError";
    return {
      status: "error",
      message: timedOut ? "Timed out" : "Could not reach Abstract API",
    };
  }
}

async function errorMessage(res: Response): Promise<string> {
  if (res.status === 401) return "Invalid API key";
  if (res.status === 429) return "Rate limit reached";
  try {
    const body = await res.json();
    if (typeof body?.error?.message === "string") return body.error.message;
  } catch {}
  return `Abstract API returned ${res.status}`;
}

// Reads a nested field without trusting the response shape.
export function get<T>(obj: unknown, path: string): T | null {
  let value: unknown = obj;
  for (const key of path.split(".")) {
    if (value === null || typeof value !== "object") return null;
    value = (value as Record<string, unknown>)[key];
  }
  return (value ?? null) as T | null;
}
