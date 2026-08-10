import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { I18nProvider } from "@/lib/i18n/provider";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, LOCALES } from "@/lib/i18n/config";
import "../globals.css";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const metadata = getDictionary(locale).metadata;
  return {
    title: { default: "ClientOps", template: metadata.titleTemplate },
    description: metadata.description,
  };
}

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dictionary = getDictionary(locale);

  return (
    <html lang={locale}>
      <body><I18nProvider locale={locale} dictionary={dictionary}>{children}</I18nProvider></body>
    </html>
  );
}
