"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { USER_ROLE_LABELS } from "@/lib/domain/labels";
import type { Profile } from "@/lib/domain/types";

const links = [
  { href: "/dashboard", label: "대시보드" },
  { href: "/customers", label: "고객" },
];

export function AppHeader({ profile }: { profile: Profile }) {
  const pathname = usePathname();

  return (
    <header className="border-b border-white/10 bg-[#10251f] text-white">
      <div className="mx-auto flex h-14 w-[min(1280px,calc(100%-48px))] items-center gap-7 max-sm:w-[calc(100%-28px)] max-sm:gap-4">
        <Link href="/dashboard" className="text-lg font-extrabold tracking-[-0.03em]">
          ClientOps
        </Link>
        <nav aria-label="주요 메뉴" className="flex h-full items-center gap-5 text-sm">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-full items-center border-b-2 px-0.5 ${
                  active ? "border-[#70c2ab] font-bold text-white" : "border-transparent text-white/75"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-3 text-xs text-white/70">
          <span className="max-lg:hidden">
            {USER_ROLE_LABELS[profile.role]} · {profile.email}
          </span>
          <form action={logoutAction}>
            <button className="min-h-11 px-1 font-semibold text-white/85 hover:text-white" type="submit">
              로그아웃
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
