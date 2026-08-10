import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ZodError } from "zod";
import { CustomerLedger } from "@/components/customer-ledger";
import { CustomerSearch } from "@/components/customer-search";
import { listCustomers } from "@/lib/data/customers";
import { DataAccessError } from "@/lib/data/errors";
import { formatNumber } from "@/lib/domain/labels";
import type { CustomerFilters, PaginatedCustomers } from "@/lib/domain/types";
import { isLocale, localePath } from "@/lib/i18n/config";
import { formatMessage, getDictionary } from "@/lib/i18n/dictionaries";
import { parseCustomerFilters } from "@/lib/validation";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: isLocale(locale) ? getDictionary(locale).metadata.customers : "ClientOps" };
}

export default async function CustomersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string | string[]; status?: string | string[]; page?: string | string[]; deleted?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dictionary = getDictionary(locale);
  const query = await searchParams;
  let filters: CustomerFilters;
  let result: PaginatedCustomers;
  try {
    filters = parseCustomerFilters(query, locale);
    result = await listCustomers(filters);
  } catch (error) {
    if (error instanceof ZodError || (error instanceof DataAccessError && error.causeCode === "INVALID_PAGE")) notFound();
    throw error;
  }

  return (
    <div className="page-wrap">
      <div className="page-title-row">
        <h1 className="page-title">{dictionary.customers.heading}</h1>
        <Link className="button button-primary" href={localePath(locale, "/customers/new")}>{dictionary.customers.newCustomer}</Link>
      </div>
      {query.deleted === "1" && <div className="message mt-4" role="status">{dictionary.customers.deletedSuccess}</div>}
      <CustomerSearch filters={filters} locale={locale} />
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm text-[#64706b]">
        <span>{formatMessage(dictionary.customers.resultSummary, { count: formatNumber(result.total, locale), page: result.page, totalPages: result.totalPages })}</span>
        {(filters.q || filters.status) && <span>{dictionary.customers.filteredExport}</span>}
      </div>
      <CustomerLedger result={result} locale={locale} />
    </div>
  );
}
