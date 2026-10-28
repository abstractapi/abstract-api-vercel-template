// Links back to Abstract carry UTM tags so signups from this template are
// attributed to Vercel.
function withUtm(url: URL): string {
  url.searchParams.set("utm_source", "vercel");
  url.searchParams.set("utm_medium", "template");
  url.searchParams.set("utm_campaign", "abstract-api-vercel-template");
  return url.toString();
}

export function abstractUrl(path = "/"): string {
  return withUtm(new URL(path, "https://www.abstractapi.com"));
}

export const DASHBOARD_URL = withUtm(new URL("https://app.abstractapi.com/"));

export const DOCS_URL = withUtm(new URL("https://docs.abstractapi.com/"));

export const REPOSITORY_URL = "https://github.com/abstractapi/abstract-api-vercel-template";

// Until the Abstract API integration is live, the Deploy button asks for the
// three keys. Once it is, `integration-ids` replaces `env` and the keys arrive
// on their own.
export const DEPLOY_URL = (() => {
  const url = new URL("https://vercel.com/new/clone");
  url.searchParams.set("repository-url", REPOSITORY_URL);
  url.searchParams.set("project-name", "abstract-api-signup-checks");
  url.searchParams.set("repository-name", "abstract-api-signup-checks");
  url.searchParams.set(
    "env",
    [
      "ABSTRACT_EMAIL_INTELLIGENCE_API_KEY",
      "ABSTRACT_PHONE_INTELLIGENCE_API_KEY",
      "ABSTRACT_IP_INTELLIGENCE_API_KEY",
    ].join(","),
  );
  url.searchParams.set(
    "envDescription",
    "One API key per Abstract product. Each product has a free plan.",
  );
  url.searchParams.set("envLink", DASHBOARD_URL);
  return url.toString();
})();
