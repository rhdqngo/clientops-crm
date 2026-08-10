import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";
import { DemoNotice } from "@/components/demo-notice";

export const metadata: Metadata = { title: "로그인" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  return (
    <main className="grid min-h-screen place-items-center px-4 py-12">
      <section className="w-full max-w-[420px] border-y border-[#d5dbd7] bg-white px-7 py-9 sm:px-10">
        <div className="text-sm font-extrabold tracking-[-0.02em] text-[#0d6b58]">ClientOps</div>
        <h1 className="mt-3 text-[1.8rem] font-extrabold tracking-[-0.04em]">로그인</h1>
        <DemoNotice compact />
        {reason === "config" && (
          <div className="message message-error mt-5" role="status">
            Supabase 연결 환경변수를 설정한 뒤 다시 시도해 주세요.
          </div>
        )}
        <LoginForm demoMode={demoMode} />
      </section>
    </main>
  );
}
