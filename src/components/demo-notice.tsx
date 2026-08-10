export function DemoNotice({ compact = false }: { compact?: boolean }) {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") return null;

  return (
    <aside
      className={
        compact
          ? "mt-5 border-l-3 border-[#b37a26] bg-[#fff7e8] px-3 py-2.5 text-sm leading-6 text-[#684710]"
          : "border-b border-[#ead9b9] bg-[#fff7e8] px-4 py-2.5 text-center text-sm leading-6 text-[#684710]"
      }
      aria-label="공개 데모 안내"
    >
      공개 포트폴리오 데모입니다. 실제 개인정보나 민감한 상담 내용을 입력하지 마세요.
    </aside>
  );
}
