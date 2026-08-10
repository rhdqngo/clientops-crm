import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ZodError } from "zod";
import { CustomerLedger } from "@/components/customer-ledger";
import { CustomerSearch } from "@/components/customer-search";
import { listCustomers } from "@/lib/data/customers";
import { DataAccessError } from "@/lib/data/errors";
import type { CustomerFilters, PaginatedCustomers } from "@/lib/domain/types";
import { parseCustomerFilters } from "@/lib/validation";

export const metadata: Metadata = { title: "고객" };

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; status?: string | string[]; page?: string | string[]; deleted?: string }>;
}) {
  const query = await searchParams;
  let filters: CustomerFilters;
  let result: PaginatedCustomers;
  try {
    filters = parseCustomerFilters(query);
    result = await listCustomers(filters);
  } catch (error) {
    if (error instanceof ZodError || (error instanceof DataAccessError && error.causeCode === "INVALID_PAGE")) {
      notFound();
    }
    throw error;
  }

  return (
    <div className="page-wrap">
      <div className="page-title-row">
        <h1 className="page-title">고객</h1>
        <Link className="button button-primary" href="/customers/new">새 고객</Link>
      </div>
      {query.deleted === "1" && (
        <div className="message mt-4" role="status">고객과 연결된 상담 기록을 영구 삭제했습니다.</div>
      )}
      <CustomerSearch filters={filters} />
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm text-[#64706b]">
        <span>
          {result.total.toLocaleString("ko-KR")}명 · {result.page} / {result.totalPages} 페이지
        </span>
        {(filters.q || filters.status) && <span>현재 필터 전체를 CSV로 내보냅니다.</span>}
      </div>
      <CustomerLedger result={result} />
    </div>
  );
}
