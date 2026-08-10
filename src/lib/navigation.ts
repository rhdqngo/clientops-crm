export function safeCustomerReturnTo(value: string | string[] | undefined): string {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate || !candidate.startsWith("/customers") || candidate.startsWith("//")) {
    return "/customers";
  }

  try {
    const parsed = new URL(candidate, "https://clientops.local");
    if (parsed.origin !== "https://clientops.local" || parsed.pathname !== "/customers") {
      return "/customers";
    }
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return "/customers";
  }
}
