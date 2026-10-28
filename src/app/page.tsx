import Image from "next/image";
import { BookOpen, Code, Triangle } from "lucide-react";

import { SignupForm } from "@/components/signup-form";
import { CHECKS, PRODUCTS } from "@/lib/checks";
import { abstractUrl, DEPLOY_URL, DOCS_URL, REPOSITORY_URL } from "@/lib/links";
import { testMode } from "@/lib/test-mode";

const RULES_EXCERPT = `if (email.isDisposable) block("email", "Disposable email address");
if (phone.isVoip) review("phone", "VoIP phone number");
if (ip.isTor) block("ip", "Signup from the Tor network");
if (ip.isVpn || ip.isProxy) review("ip", "Signup through a VPN or proxy");`;

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
          <a href={abstractUrl()} aria-label="Abstract">
            <Image src="/abstract-logo.svg" alt="Abstract" width={119} height={18} priority />
          </a>
          <a
            href={DOCS_URL}
            className="inline-flex items-center gap-2 font-medium hover:underline"
          >
            <BookOpen className="size-4" aria-hidden />
            Docs
          </a>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-5xl flex-1 gap-10 px-4 py-10 md:grid-cols-[1fr_minmax(0,28rem)] md:py-16">
        <section className="space-y-4">
          <h1 className="text-[1.75rem] leading-tight font-semibold tracking-tight">
            Check every signup before the account exists
          </h1>
          <p className="max-w-prose text-muted-foreground">
            This form sends the email, phone number and IP address of each
            signup to Abstract, then allows, flags or blocks it with rules
            you can edit in one file.
          </p>
          <ul className="flex flex-wrap gap-2">
            {CHECKS.map((id) => (
              <li
                key={id}
                className="rounded-md border border-border px-2 py-1 text-xs font-medium"
              >
                {PRODUCTS[id].name}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href={DEPLOY_URL}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-foreground px-4 font-medium text-background hover:opacity-90"
            >
              <Triangle className="size-3.5 fill-current" aria-hidden />
              Deploy
            </a>
            <a
              href={REPOSITORY_URL}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-4 font-medium hover:bg-muted"
            >
              <Code className="size-4" aria-hidden />
              View code
            </a>
          </div>
          <figure className="overflow-hidden rounded-xl border border-border">
            <figcaption className="border-b border-border px-4 py-2 font-mono text-xs text-muted-foreground">
              src/lib/rules.ts
            </figcaption>
            <pre className="overflow-x-auto p-4 font-mono text-xs leading-5">
              <code>{RULES_EXCERPT}</code>
            </pre>
          </figure>
        </section>

        <SignupForm
          checks={CHECKS}
          testMode={testMode()}
          turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null}
        />
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center px-4 text-xs text-muted-foreground">
          <a href={abstractUrl()} className="hover:underline">
            Powered by Abstract
          </a>
        </div>
      </footer>
    </div>
  );
}
