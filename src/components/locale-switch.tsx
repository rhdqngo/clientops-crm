"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { replacePathLocale, replaceUrlLocale, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/provider";

function LocaleSwitchInner({ className = "" }: { className?: string }) {
  const { locale, dictionary } = useI18n();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const targetLocale: Locale = locale === "ko" ? "en" : "ko";
  const targetPath = replacePathLocale(pathname, targetLocale);
  const targetParams = new URLSearchParams(searchParams.toString());
  for (const key of ["next", "returnTo"]) {
    const nestedPath = targetParams.get(key);
    if (nestedPath) targetParams.set(key, replaceUrlLocale(nestedPath, targetLocale));
  }
  const query = targetParams.toString();
  const href = `${targetPath}${query ? `?${query}` : ""}`;

  return (
    <Link
      className={`inline-flex min-h-11 min-w-11 items-center justify-center whitespace-nowrap font-semibold ${className}`}
      href={href}
      hrefLang={targetLocale}
      lang={targetLocale}
      aria-label={dictionary.common.switchLanguage}
    >
      <span className="max-sm:hidden">{dictionary.common.switchLanguageLong}</span>
      <span className="sm:hidden">{dictionary.common.switchLanguageShort}</span>
    </Link>
  );
}

export function LocaleSwitch({ className = "" }: { className?: string }) {
  return (
    <Suspense fallback={<span className="inline-flex min-h-11 min-w-11" aria-hidden="true" />}>
      <LocaleSwitchInner className={className} />
    </Suspense>
  );
}
