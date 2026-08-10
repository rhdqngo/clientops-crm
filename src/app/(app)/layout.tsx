import type { ReactNode } from "react";
import { AppHeader } from "@/components/app-header";
import { DemoNotice } from "@/components/demo-notice";
import { requirePageAuth } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";

export default async function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const { profile } = await requirePageAuth();
  return (
    <div className="app-shell">
      <AppHeader profile={profile} />
      <DemoNotice />
      <main>{children}</main>
    </div>
  );
}
