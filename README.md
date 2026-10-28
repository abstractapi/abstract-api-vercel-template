# Signup risk checks with Abstract API

A Next.js signup form that checks every new account with [Abstract](https://www.abstractapi.com/?utm_source=vercel&utm_medium=template&utm_campaign=abstract-api-vercel-template) before creating it. It sends the email address, phone number and IP address to three Abstract products, then allows, flags or blocks the signup with rules you edit in one file.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fabstractapi%2Fabstract-api-vercel-template&project-name=abstract-api-signup-checks&repository-name=abstract-api-signup-checks&env=ABSTRACT_EMAIL_INTELLIGENCE_API_KEY,ABSTRACT_PHONE_INTELLIGENCE_API_KEY,ABSTRACT_IP_INTELLIGENCE_API_KEY&envDescription=One%20API%20key%20per%20Abstract%20product.%20Each%20product%20has%20a%20free%20plan.&envLink=https%3A%2F%2Fapp.abstractapi.com%2F%3Futm_source%3Dvercel%26utm_medium%3Dtemplate%26utm_campaign%3Dabstract-api-vercel-template)

## What it checks

| Product | Env var | Signals the rules use |
|---|---|---|
| Email Intelligence | `ABSTRACT_EMAIL_INTELLIGENCE_API_KEY` | Disposable address, deliverability, address and domain risk, suspicious username |
| Phone Intelligence | `ABSTRACT_PHONE_INTELLIGENCE_API_KEY` | Validity, VoIP, disposable number, risk level, abuse |
| IP Intelligence | `ABSTRACT_IP_INTELLIGENCE_API_KEY` | Tor, VPN, proxy, hosting provider, abuse, country |

The three calls run in parallel from server code, so API keys never reach the browser. A product without a key, or a call that fails, is skipped and the signup still gets a verdict from the others.

## Run it locally

```bash
npm install
cp .env.example .env.local   # then paste your keys
npm run dev
```

Get your keys in the [Abstract dashboard](https://app.abstractapi.com/?utm_source=vercel&utm_medium=template&utm_campaign=abstract-api-vercel-template). If you deployed with the button above and linked the project with `vercel link`, `vercel env pull .env.local` downloads them instead.

In `next dev` the form runs in test mode: it shows an IP address field, because your own requests come from `localhost`, and a button that fills a risky signup.

## Make it yours

- **Rules:** [`src/lib/rules.ts`](src/lib/rules.ts) decides the verdict. Any `block` reason blocks the signup, any `review` reason flags it, and no reason allows it.
- **Products:** using one or two Abstract products? Remove the others from `CHECKS` in [`src/lib/checks.ts`](src/lib/checks.ts). Their form field and their rules go away.
- **Account creation:** [`src/lib/create-account.ts`](src/lib/create-account.ts) is a stub. Call your auth provider there (Clerk, Auth.js, Supabase, ...). Signups with a `review` verdict reach it too, so you can hold them for review or ask for extra verification.
- **Form:** [`src/components/signup-form.tsx`](src/components/signup-form.tsx) and the server action in [`src/app/actions.ts`](src/app/actions.ts).

## Running a public demo

If you deploy this as a public demo rather than a signup page, protect your quota:

- Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` to turn on the [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) bot check.
- Add a rate limit rule in the [Vercel Firewall](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting) and a spend cap on the project.
- `ABSTRACT_TEST_MODE=true` keeps the IP field and sample button. Never set it on a real signup page: visitors could choose the IP address the check sees.

## Learn more

- [Abstract documentation](https://docs.abstractapi.com/?utm_source=vercel&utm_medium=template&utm_campaign=abstract-api-vercel-template)
- [Next.js Server Actions](https://nextjs.org/docs/app/guides/forms)

## License

MIT
