import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import type { Profile, UserRole } from "@/lib/domain/types";
import { localePath, type Locale } from "@/lib/i18n/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthorizationErrorCode = "LOGIN_REQUIRED" | "FORBIDDEN";

export class AuthorizationError extends Error {
  constructor(
    public readonly status: 401 | 403,
    public readonly code: AuthorizationErrorCode,
  ) {
    super(code);
    this.name = "AuthorizationError";
  }
}

export type AuthContext = {
  user: User;
  profile: Profile;
};

export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id,email,role,created_at,updated_at")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) return null;
  return { user, profile };
}

export async function requireAuthContext(): Promise<AuthContext> {
  const context = await getAuthContext();
  if (!context) throw new AuthorizationError(401, "LOGIN_REQUIRED");
  return context;
}

export async function requirePageAuth(locale: Locale): Promise<AuthContext> {
  const context = await getAuthContext();
  if (!context) redirect(localePath(locale, "/login"));
  return context;
}

export async function requireRole(roles: UserRole[]): Promise<AuthContext> {
  const context = await requireAuthContext();
  if (!roles.includes(context.profile.role)) {
    throw new AuthorizationError(403, "FORBIDDEN");
  }
  return context;
}
