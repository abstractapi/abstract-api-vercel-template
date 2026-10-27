import "server-only";

// Optional bot protection with Cloudflare Turnstile. It is off unless both
// NEXT_PUBLIC_TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY are set.
export function turnstileEnabled(): boolean {
  return Boolean(
    process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  );
}

export async function verifyTurnstile(
  token: string | null,
  ipAddress: string | null,
): Promise<boolean> {
  if (!turnstileEnabled()) return true;
  if (!token) return false;

  const body = new URLSearchParams({
    secret: process.env.TURNSTILE_SECRET_KEY!,
    response: token,
  });
  if (ipAddress) body.set("remoteip", ipAddress);

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body, signal: AbortSignal.timeout(5000) },
    );
    const result = await res.json();
    return result.success === true;
  } catch {
    return false;
  }
}
