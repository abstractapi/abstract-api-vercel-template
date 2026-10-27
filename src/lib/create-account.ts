import "server-only";

import type { Verdict } from "@/lib/types";

export type NewAccount = {
  name: string;
  email: string;
  phone: string | null;
  verdict: Exclude<Verdict, "block">;
};

// Replace this stub with your auth provider (Clerk, Auth.js, Supabase, ...).
// Signups with a "review" verdict reach here too: store the verdict so you
// can hold them for manual review, ask for extra verification, or limit them.
export async function createAccount(account: NewAccount): Promise<{ id: string }> {
  void account;
  return { id: crypto.randomUUID() };
}
