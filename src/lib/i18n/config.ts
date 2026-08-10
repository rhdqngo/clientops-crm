export const LOCALES = ["ko", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "clientops_locale";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && LOCALES.includes(value as Locale);
}

export function parseAcceptLanguage(value: string | null): Locale | null {
  if (!value) return null;

  const candidates = value
    .split(",")
    .map((entry, index) => {
      const [tagPart, ...parameters] = entry.trim().split(";");
      const tag = tagPart.toLowerCase();
      const qualityParameter = parameters.find((parameter) => parameter.trim().startsWith("q="));
      const quality = qualityParameter ? Number.parseFloat(qualityParameter.trim().slice(2)) : 1;
      return { tag, quality: Number.isFinite(quality) ? quality : 0, index };
    })
    .filter(({ quality }) => quality > 0)
    .sort((left, right) => right.quality - left.quality || left.index - right.index);

  for (const { tag } of candidates) {
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }

  return null;
}

export function detectLocale(cookieLocale: string | undefined, acceptLanguage: string | null): Locale {
  if (isLocale(cookieLocale)) return cookieLocale;
  return parseAcceptLanguage(acceptLanguage) ?? DEFAULT_LOCALE;
}

export function localePath(locale: Locale, path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized === "/") return `/${locale}`;
  return `/${locale}${normalized}`;
}

export function pathnameLocale(pathname: string): Locale | null {
  const firstSegment = pathname.split("/")[1];
  return isLocale(firstSegment) ? firstSegment : null;
}

export function stripLocale(pathname: string): string {
  const locale = pathnameLocale(pathname);
  if (!locale) return pathname;
  const stripped = pathname.slice(locale.length + 1);
  return stripped || "/";
}

export function replacePathLocale(pathname: string, locale: Locale): string {
  return localePath(locale, stripLocale(pathname));
}

export function replaceUrlLocale(value: string, locale: Locale): string {
  try {
    const parsed = new URL(value, "https://clientops.local");
    if (parsed.origin !== "https://clientops.local" || !pathnameLocale(parsed.pathname)) return value;
    return `${replacePathLocale(parsed.pathname, locale)}${parsed.search}${parsed.hash}`;
  } catch {
    return value;
  }
}

export function intlLocale(locale: Locale): "ko-KR" | "en-US" {
  return locale === "ko" ? "ko-KR" : "en-US";
}
