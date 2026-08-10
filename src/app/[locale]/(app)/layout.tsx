import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { DemoNotice } from "@/components/demo-notice";
import { requirePageAuth } from "@/lib/auth/dal";
import { isLocale } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";

export default async function AuthenticatedLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { profile } = await requirePageAuth(locale);
  return (
    <div className="app-shell">
      <AppHeader profile={profile} />
      <DemoNotice />
      <main>{children}</main>
    </div>
  );
}
