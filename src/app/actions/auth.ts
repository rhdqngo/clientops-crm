"use server";

import { redirect } from "next/navigation";
import type { ActionResult } from "@/lib/domain/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SupabaseConfigurationError } from "@/lib/supabase/env";
import { loginSchema } from "@/lib/validation";

export async function loginAction(
  _previousState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      code: "VALIDATION",
      message: "입력 내용을 확인해 주세요.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) {
      return {
        ok: false,
        code: "UNAUTHORIZED",
        message: "이메일 또는 비밀번호가 올바르지 않습니다.",
      };
    }
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      return {
        ok: false,
        code: "UNKNOWN",
        message: "서비스 연결이 구성되지 않았습니다. 운영 담당자에게 문의해 주세요.",
      };
    }
    return {
      ok: false,
      code: "UNKNOWN",
      message: "로그인 요청을 처리하지 못했습니다. 다시 시도해 주세요.",
    };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } finally {
    redirect("/login");
  }
}
