export function getProjectRef(supabaseUrl) {
  const url = new URL(supabaseUrl);
  return url.hostname.split(".")[0];
}

export function assertDemoResetTarget(supabaseUrl, expectedProjectRef) {
  if (!expectedProjectRef || getProjectRef(supabaseUrl) !== expectedProjectRef) {
    throw new Error(
      "Refusing demo reset because DEMO_EXPECTED_PROJECT_REF does not match the target URL.",
    );
  }
}
