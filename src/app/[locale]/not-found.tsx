"use client";

import Link from "next/link";
import { localePath } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/provider";

export default function NotFound() {
  const { locale, dictionary } = useI18n();
  return (
    <main className="page-wrap">
      <div className="mx-auto max-w-xl border-y border-[#d5dbd7] bg-white px-5 py-8">
        <h1 className="page-title text-[1.5rem]">{dictionary.state.notFoundTitle}</h1>
        <p className="mt-3 text-sm text-[#64706b]">{dictionary.state.notFoundDescription}</p>
        <Link className="button button-primary mt-6" href={localePath(locale, "/customers")}>{dictionary.state.backToCustomers}</Link>
      </div>
    </main>
  );
}
