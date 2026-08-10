import { AuthorizationError } from "@/lib/auth/dal";
import type { ActionResult } from "@/lib/domain/types";

export function mapAuthorizationError(error: unknown): ActionResult | null {
  if (!(error instanceof AuthorizationError)) return null;
  return {
    ok: false,
    code: error.status === 401 ? "UNAUTHORIZED" : "FORBIDDEN",
    message: error.message,
  };
}
