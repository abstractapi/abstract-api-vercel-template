import "server-only";

// Test mode shows sample inputs and lets you type an IP address instead of
// using the visitor's. It is on in `next dev` and wherever
// ABSTRACT_TEST_MODE=true. Never enable it on a real signup page: anyone
// could then pick the IP address the IP check sees.
export function testMode(): boolean {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.ABSTRACT_TEST_MODE === "true"
  );
}
