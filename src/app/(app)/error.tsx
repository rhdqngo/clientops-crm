"use client";

import { useEffect } from "react";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="page-wrap">
      <div className="mx-auto max-w-xl border-y border-[#d5dbd7] bg-white px-5 py-8">
        <h1 className="page-title text-[1.5rem]">데이터를 불러오지 못했습니다</h1>
        <p className="mt-3 text-sm leading-6 text-[#64706b]">
          현재 화면의 입력과 주소를 유지했습니다. 연결을 확인한 뒤 다시 시도해 주세요.
        </p>
        <button className="button button-primary mt-6" type="button" onClick={reset}>
          다시 시도
        </button>
      </div>
    </div>
  );
}
