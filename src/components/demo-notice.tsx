"use client";

import { useI18n } from "@/lib/i18n/provider";

export function DemoNotice({ compact = false }: { compact?: boolean }) {
  const { dictionary } = useI18n();
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") return null;

  return (
    <aside
      className={
        compact
          ? "mt-5 border-l-3 border-[#b37a26] bg-[#fff7e8] px-3 py-2.5 text-sm leading-6 text-[#684710]"
          : "border-b border-[#ead9b9] bg-[#fff7e8] px-4 py-2.5 text-center text-sm leading-6 text-[#684710]"
      }
      aria-label={dictionary.demo.noticeLabel}
    >
      {dictionary.demo.notice}
    </aside>
  );
}
