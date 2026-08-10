"use server";

import { redirect } from "next/navigation";
import type { ActionResult } from "@/lib/domain/types";
import { DEFAULT_LOCALE, isLocale, localePath, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { safeAppNext } from "@/lib/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SupabaseConfigurationError } from "@/lib/supabase/env";
import { getLoginSchema } from "@/lib/validation";

export async function loginAction(
  requestedLocale: Locale,
  nextPath: string | undefined,
  _previousState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const locale = isLocale(requestedLocale) ? requestedLocale : DEFAULT_LOCALE;
  const messages = getDictionary(locale).errors;
  const parsed = getLoginSchema(locale).safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      code: "VALIDATION",
      message: messages.input,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) {
      return { ok: false, code: "UNAUTHORIZED", message: messages.invalidCredentials };
    }
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      return { ok: false, code: "UNKNOWN", message: messages.serviceConfig };
    }
    return { ok: false, code: "UNKNOWN", message: messages.loginUnknown };
  }

  redirect(safeAppNext(nextPath, locale));
}

export async function logoutAction(requestedLocale: Locale) {
  const locale = isLocale(requestedLocale) ? requestedLocale : DEFAULT_LOCALE;
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } finally {
    redirect(localePath(locale, "/login"));
  }
}
