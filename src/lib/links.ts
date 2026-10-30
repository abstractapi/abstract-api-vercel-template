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

// The Deploy button clones this repository and installs the Abstract API
// integration: the developer signs in or signs up in its popup, picks the
// products, and the keys arrive in the new project as environment variables.
export const DEPLOY_URL = (() => {
  const url = new URL("https://vercel.com/new/clone");
  url.searchParams.set("repository-url", REPOSITORY_URL);
  url.searchParams.set("project-name", "abstract-api-signup-checks");
  url.searchParams.set("repository-name", "abstract-api-signup-checks");
  url.searchParams.set("integration-ids", "oac_DMEIgl5tpLFotArD8JRb5PtP");
  return url.toString();
})();
