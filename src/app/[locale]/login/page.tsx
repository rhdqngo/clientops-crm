import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { DemoNotice } from "@/components/demo-notice";
import { LocaleSwitch } from "@/components/locale-switch";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale } from "@/lib/i18n/config";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: isLocale(locale) ? getDictionary(locale).metadata.login : "ClientOps" };
}

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ reason?: string; next?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { reason, next } = await searchParams;
  const dictionary = getDictionary(locale);
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  return (
    <main className="grid min-h-screen place-items-center px-4 py-12">
      <section className="w-full max-w-[420px] border-y border-[#d5dbd7] bg-white px-7 py-9 sm:px-10">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm font-extrabold tracking-[-0.02em] text-[#0d6b58]">{dictionary.common.brand}</div>
          <LocaleSwitch className="text-sm text-[#0d6b58] hover:underline" />
        </div>
        <h1 className="mt-3 text-[1.8rem] font-extrabold tracking-[-0.04em]">{dictionary.login.heading}</h1>
        <DemoNotice compact />
        {reason === "config" && <div className="message message-error mt-5" role="status">{dictionary.login.configError}</div>}
        <LoginForm locale={locale} nextPath={next} demoMode={demoMode} />
      </section>
    </main>
  );
}
