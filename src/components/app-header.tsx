"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { LocaleSwitch } from "@/components/locale-switch";
import type { Profile } from "@/lib/domain/types";
import { localePath, stripLocale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/provider";

export function AppHeader({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const { locale, dictionary } = useI18n();
  const currentPath = stripLocale(pathname);
  const links = [
    { href: "/dashboard", label: dictionary.common.dashboard, shortLabel: dictionary.common.dashboardShort },
    { href: "/customers", label: dictionary.common.customers, shortLabel: dictionary.common.customersShort },
  ];

  return (
    <header className="border-b border-white/10 bg-[#10251f] text-white">
      <div className="mx-auto flex h-14 w-[min(1280px,calc(100%-48px))] items-center gap-7 max-sm:w-[calc(100%-28px)] max-sm:gap-3">
        <Link href={localePath(locale, "/dashboard")} className="text-lg font-extrabold tracking-[-0.03em]">
          {dictionary.common.brand}
        </Link>
        <nav aria-label={dictionary.common.primaryNavigation} className="flex h-full items-center gap-5 text-sm max-sm:gap-3">
          {links.map((link) => {
            const active = currentPath === link.href || currentPath.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={localePath(locale, link.href)}
                aria-current={active ? "page" : undefined}
                className={`flex h-full items-center border-b-2 px-0.5 whitespace-nowrap ${
                  active ? "border-[#70c2ab] font-bold text-white" : "border-transparent text-white/75"
                }`}
              >
                <span className="max-sm:hidden">{link.label}</span>
                <span className="sm:hidden">{link.shortLabel}</span>
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2 text-xs text-white/70">
          <span className="max-lg:hidden">
            {dictionary.roles[profile.role]} · {profile.email}
          </span>
          <LocaleSwitch className="px-1 text-white/85 hover:text-white" />
          <form action={logoutAction.bind(null, locale)}>
            <button className="min-h-11 min-w-11 whitespace-nowrap px-1 font-semibold text-white/85 hover:text-white" type="submit">
              <span className="max-sm:hidden">{dictionary.common.logout}</span>
              <span className="sm:hidden">{dictionary.common.logoutShort}</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
