import { ZodError } from "zod";
import { AuthorizationError } from "@/lib/auth/dal";
import { buildCsvFileName, buildCustomerCsv } from "@/lib/csv";
import { listAllFilteredCustomers } from "@/lib/data/customers";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { parseCustomerFilters } from "@/lib/validation";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requestedLocale = url.searchParams.get("lang");
  const locale = isLocale(requestedLocale) ? requestedLocale : DEFAULT_LOCALE;
  const messages = getDictionary(locale).errors;

  if (requestedLocale !== null && !isLocale(requestedLocale)) {
    return Response.json(
      { error: messages.invalidFilters },
      { status: 400, headers: { "Cache-Control": "no-store", "Content-Language": locale } },
    );
  }

  try {
    const filters = parseCustomerFilters({
      q: url.searchParams.get("q") ?? "",
      status: url.searchParams.get("status") ?? undefined,
      page: "1",
    }, locale);
    const customers = await listAllFilteredCustomers({ q: filters.q, status: filters.status });
    const csv = buildCustomerCsv(customers, locale);
    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${buildCsvFileName()}"`,
        "Content-Language": locale,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: messages.invalidFilters },
        { status: 400, headers: { "Cache-Control": "no-store", "Content-Language": locale } },
      );
    }
    if (error instanceof AuthorizationError) {
      const message = error.code === "LOGIN_REQUIRED" ? messages.loginRequired : messages.forbidden;
      return Response.json(
        { error: message },
        { status: error.status, headers: { "Cache-Control": "no-store", "Content-Language": locale } },
      );
    }
    return Response.json(
      { error: messages.csvUnknown },
      { status: 500, headers: { "Cache-Control": "no-store", "Content-Language": locale } },
    );
  }
}
