import { AuthorizationError } from "@/lib/auth/dal";
import type { ActionResult } from "@/lib/domain/types";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export function mapAuthorizationError(error: unknown, locale: Locale): ActionResult | null {
  if (!(error instanceof AuthorizationError)) return null;
  const messages = getDictionary(locale).errors;
  return {
    ok: false,
    code: error.status === 401 ? "UNAUTHORIZED" : "FORBIDDEN",
    message: error.code === "LOGIN_REQUIRED" ? messages.loginRequired : messages.forbidden,
  };
}
