import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CustomerForm } from "@/components/customer-form";
import { DeleteCustomerDialog } from "@/components/delete-customer-dialog";
import { InteractionForm } from "@/components/interaction-form";
import { InteractionTimeline } from "@/components/interaction-timeline";
import { StatusBadge } from "@/components/status-badge";
import { requirePageAuth } from "@/lib/auth/dal";
import { countCustomerInteractions, getCustomer, getCustomerInteractions } from "@/lib/data/customers";
import { formatNumber, formatSeoulDateTime } from "@/lib/domain/labels";
import { isLocale } from "@/lib/i18n/config";
import { formatMessage, getDictionary } from "@/lib/i18n/dictionaries";
import { safeCustomerReturnTo } from "@/lib/navigation";
import { getCustomerIdSchema } from "@/lib/validation";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: isLocale(locale) ? getDictionary(locale).metadata.customerDetail : "ClientOps" };
}

export default async function CustomerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ returnTo?: string | string[]; created?: string }>;
}) {
  const { locale, id: rawId } = await params;
  if (!isLocale(locale)) notFound();
  const dictionary = getDictionary(locale);
  const id = getCustomerIdSchema(locale).safeParse(rawId);
  if (!id.success) notFound();

  const query = await searchParams;
  const returnTo = safeCustomerReturnTo(query.returnTo, locale);
  const [{ profile }, customer, interactions, interactionCount] = await Promise.all([
    requirePageAuth(locale),
    getCustomer(id.data),
    getCustomerInteractions(id.data),
    countCustomerInteractions(id.data),
  ]);
  if (!customer) notFound();

  return (
    <div className="page-wrap">
      <div className="page-title-row items-start">
        <div className="min-w-0">
          <Link className="text-sm font-bold text-[#0d6b58] hover:underline" href={returnTo}>{dictionary.customers.backToList}</Link>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="page-title break-words">{customer.name}</h1>
            <StatusBadge status={customer.status} locale={locale} />
          </div>
          <p className="mt-2 text-sm text-[#64706b]">{formatMessage(dictionary.customers.recentlyUpdated, { date: formatSeoulDateTime(customer.updated_at, locale) })}</p>
        </div>
      </div>
      {query.created === "1" && <div className="message mt-4" role="status">{dictionary.customers.createdSuccess}</div>}
      <div className="mt-7 grid gap-10 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] xl:items-start">
        <section aria-labelledby="customer-information-heading">
          <h2 className="section-heading mb-3" id="customer-information-heading">{dictionary.customers.information}</h2>
          <div className="border-y border-[#d5dbd7] bg-white px-5 py-6 sm:px-7"><CustomerForm mode="edit" customer={customer} /></div>
          {profile.role === "ADMIN" && (
            <div className="mt-8 border-t border-[#e1b9b4] pt-5">
              <h2 className="section-heading text-[#7c3028]">{dictionary.customers.dangerousActions}</h2>
              <p className="mt-2 text-sm leading-6 text-[#64706b]">{dictionary.customers.deleteConsequence}</p>
              <div className="mt-4"><DeleteCustomerDialog customerId={customer.id} customerName={customer.name} interactionCount={interactionCount} returnTo={returnTo} /></div>
            </div>
          )}
        </section>
        <section aria-labelledby="interaction-history-heading">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="section-heading" id="interaction-history-heading">{dictionary.customers.interactionTimeline}</h2>
            <span className="text-sm text-[#64706b]">{formatMessage(dictionary.customers.interactionCount, { count: formatNumber(interactionCount, locale) })}</span>
          </div>
          <InteractionTimeline interactions={interactions} locale={locale} />
          <div className="mt-8">
            <h2 className="section-heading mb-3">{dictionary.customers.addInteraction}</h2>
            <div className="border-y border-[#d5dbd7] bg-white px-5 py-6 sm:px-7"><InteractionForm customerId={customer.id} /></div>
          </div>
        </section>
      </div>
    </div>
  );
}
