"use client";

import { useEffect } from "react";
import { useI18n } from "@/lib/i18n/provider";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { dictionary } = useI18n();
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="page-wrap">
      <div className="mx-auto max-w-xl border-y border-[#d5dbd7] bg-white px-5 py-8">
        <h1 className="page-title text-[1.5rem]">{dictionary.state.errorTitle}</h1>
        <p className="mt-3 text-sm leading-6 text-[#64706b]">{dictionary.state.errorDescription}</p>
        <button className="button button-primary mt-6" type="button" onClick={reset}>{dictionary.common.retry}</button>
      </div>
    </div>
  );
}
