import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  detectLocale,
  isLocale,
  LOCALE_COOKIE,
  localePath,
  pathnameLocale,
  stripLocale,
  type Locale,
} from "@/lib/i18n/config";
import type { Database } from "./database.types";
import { getPublicSupabaseEnv } from "./env";

const UI_ROOTS = ["/login", "/dashboard", "/customers"] as const;

function isKnownUiPath(pathname: string): boolean {
  return UI_ROOTS.some((root) => pathname === root || pathname.startsWith(`${root}/`));
}

function copyResponseCookies(source: NextResponse, target: NextResponse): NextResponse {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
  return target;
}

function rememberLocale(response: NextResponse, locale: Locale): NextResponse {
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}

function requestLocale(request: NextRequest): Locale {
  const explicit = pathnameLocale(request.nextUrl.pathname);
  if (explicit) return explicit;
  const queryLocale = request.nextUrl.searchParams.get("lang");
  if (isLocale(queryLocale)) return queryLocale;
  return detectLocale(request.cookies.get(LOCALE_COOKIE)?.value, request.headers.get("accept-language"));
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const explicitLocale = pathnameLocale(pathname);
  const locale = requestLocale(request);
  const unlocalizedPath = explicitLocale ? stripLocale(pathname) : pathname;

  if (!explicitLocale && (pathname === "/" || isKnownUiPath(pathname))) {
    const url = request.nextUrl.clone();
    url.pathname = localePath(locale, pathname === "/" ? "/dashboard" : pathname);
    return rememberLocale(NextResponse.redirect(url), locale);
  }

  if (explicitLocale && unlocalizedPath === "/") {
    const url = request.nextUrl.clone();
    url.pathname = localePath(explicitLocale, "/dashboard");
    return rememberLocale(NextResponse.redirect(url), explicitLocale);
  }

  const isApi = pathname.startsWith("/api/customers");
  const isProtected =
    isApi || unlocalizedPath === "/dashboard" || unlocalizedPath.startsWith("/dashboard/") ||
    unlocalizedPath === "/customers" || unlocalizedPath.startsWith("/customers/");

  const env = getPublicSupabaseEnv();
  if (!env) {
    if (isProtected && !isApi) {
      const url = request.nextUrl.clone();
      url.pathname = localePath(locale, "/login");
      url.search = "?reason=config";
      return rememberLocale(NextResponse.redirect(url), locale);
    }
    return explicitLocale
      ? rememberLocale(NextResponse.next({ request }), explicitLocale)
      : NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient<Database>(env.url, env.publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtected && !isApi) {
    const url = request.nextUrl.clone();
    const nextPath = `${pathname}${request.nextUrl.search}`;
    url.pathname = localePath(locale, "/login");
    url.search = `?next=${encodeURIComponent(nextPath)}`;
    return rememberLocale(copyResponseCookies(response, NextResponse.redirect(url)), locale);
  }

  if (user && explicitLocale && unlocalizedPath === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = localePath(explicitLocale, "/dashboard");
    url.search = "";
    return rememberLocale(copyResponseCookies(response, NextResponse.redirect(url)), explicitLocale);
  }

  return explicitLocale ? rememberLocale(response, explicitLocale) : response;
}
