import { isLocale, localePath, pathnameLocale, replacePathLocale, type Locale } from "@/lib/i18n/config";

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function safeAppNext(value: string | string[] | undefined, locale: Locale): string {
  const fallback = localePath(locale, "/dashboard");
  const candidate = firstValue(value);
  if (!candidate || candidate.startsWith("//")) return fallback;

  try {
    const parsed = new URL(candidate, "https://clientops.local");
    const routeLocale = pathnameLocale(parsed.pathname);
    const unlocalized = routeLocale ? parsed.pathname.slice(routeLocale.length + 1) || "/" : parsed.pathname;
    const allowed = unlocalized === "/dashboard" || unlocalized.startsWith("/customers");
    if (parsed.origin !== "https://clientops.local" || !allowed) return fallback;
    return `${localePath(locale, unlocalized)}${parsed.search}`;
  } catch {
    return fallback;
  }
}

export function safeCustomerReturnTo(
  value: string | string[] | undefined,
  locale: Locale = "ko",
): string {
  const fallback = localePath(locale, "/customers");
  const candidate = firstValue(value);
  if (!candidate || candidate.startsWith("//")) return fallback;

  try {
    const parsed = new URL(candidate, "https://clientops.local");
    const routeLocale = pathnameLocale(parsed.pathname);
    if (
      parsed.origin !== "https://clientops.local" ||
      !routeLocale ||
      parsed.pathname !== localePath(routeLocale, "/customers")
    ) {
      return fallback;
    }
    return `${localePath(locale, "/customers")}${parsed.search}`;
  } catch {
    return fallback;
  }
}

export function switchLocalizedDestination(value: string, targetLocale: Locale): string {
  const currentLocale = pathnameLocale(value);
  return currentLocale && isLocale(currentLocale) ? replacePathLocale(value, targetLocale) : value;
}
