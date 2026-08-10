import { AuthorizationError } from "@/lib/auth/dal";
import { buildCsvFileName, buildCustomerCsv } from "@/lib/csv";
import { listAllFilteredCustomers } from "@/lib/data/customers";
import { parseCustomerFilters } from "@/lib/validation";
import { ZodError } from "zod";

export async function GET(request: Request) {
  const url = new URL(request.url);

  try {
    const filters = parseCustomerFilters({
      q: url.searchParams.get("q") ?? "",
      status: url.searchParams.get("status") ?? undefined,
      page: "1",
    });
    const customers = await listAllFilteredCustomers({
      q: filters.q,
      status: filters.status,
    });
    const csv = buildCustomerCsv(customers);
    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${buildCsvFileName()}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: "검색 조건이 올바르지 않습니다." },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }
    if (error instanceof AuthorizationError) {
      return Response.json(
        { error: error.message },
        { status: error.status, headers: { "Cache-Control": "no-store" } },
      );
    }
    return Response.json(
      { error: "CSV 파일을 생성하지 못했습니다." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
