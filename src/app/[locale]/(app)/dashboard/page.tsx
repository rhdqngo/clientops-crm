import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatNumber, formatSeoulDateTime } from "@/lib/domain/labels";
import type { CustomerStatus } from "@/lib/domain/types";
import { getDashboardData } from "@/lib/data/dashboard";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, localePath } from "@/lib/i18n/config";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: isLocale(locale) ? getDictionary(locale).metadata.dashboard : "ClientOps" };
}

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dictionary = getDictionary(locale);
  const { summary, recentInteractions } = await getDashboardData();
  const summaries: Array<{ key: "TOTAL" | "NEW" | "BOOKED" | "COMPLETED"; label: string; status?: CustomerStatus }> = [
    { key: "TOTAL", label: dictionary.dashboard.total },
    { key: "NEW", label: dictionary.statuses.NEW, status: "NEW" },
    { key: "BOOKED", label: dictionary.statuses.BOOKED, status: "BOOKED" },
    { key: "COMPLETED", label: dictionary.statuses.COMPLETED, status: "COMPLETED" },
  ];

  return (
    <div className="page-wrap">
      <div className="page-title-row">
        <h1 className="page-title">{dictionary.dashboard.heading}</h1>
        <Link className="button button-primary" href={localePath(locale, "/customers/new")}>{dictionary.dashboard.newCustomer}</Link>
      </div>
      <section className="mt-6" aria-labelledby="customer-summary-heading">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-heading" id="customer-summary-heading">{dictionary.dashboard.customerSummary}</h2>
          <Link className="text-sm font-bold text-[#0d6b58] hover:underline" href={localePath(locale, "/customers")}>{dictionary.dashboard.openLedger}</Link>
        </div>
        <div className="grid grid-cols-2 border-y border-[#d5dbd7] bg-white md:grid-cols-4">
          {summaries.map((item) => {
            const base = localePath(locale, "/customers");
            const href = item.status ? `${base}?status=${item.status}` : base;
            return (
              <Link className="border-[#d5dbd7] px-5 py-5 not-last:border-r max-md:nth-[2]:border-r-0 max-md:nth-[n+3]:border-t" href={href} key={item.key}>
                <span className="block text-sm font-bold text-[#59655f]">{item.label}</span>
                <span className="mt-2 block text-3xl font-extrabold tracking-[-0.04em]">{formatNumber(summary[item.key], locale)}</span>
              </Link>
            );
          })}
        </div>
      </section>
      <section className="mt-10" aria-labelledby="recent-interactions-heading">
        <h2 className="section-heading mb-3" id="recent-interactions-heading">{dictionary.dashboard.recentInteractions}</h2>
        {recentInteractions.length === 0 ? (
          <div className="data-surface px-5 py-10 text-center">
            <p className="font-bold">{dictionary.dashboard.noInteractions}</p>
            <p className="mt-2 text-sm text-[#64706b]">{dictionary.dashboard.noInteractionsHelp}</p>
          </div>
        ) : (
          <ol className="data-surface divide-y divide-[#e1e5e2]">
            {recentInteractions.map((interaction) => (
              <li className="grid gap-2 px-4 py-4 sm:grid-cols-[170px_minmax(0,1fr)_auto] sm:items-center" key={interaction.id}>
                <div className="text-sm text-[#59655f]">{formatSeoulDateTime(interaction.created_at, locale)}</div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold">{interaction.customers?.name ?? dictionary.dashboard.deletedCustomer}</span>
                    <span className="text-xs font-bold text-[#0d6b58]">{dictionary.interactionTypes[interaction.type]}</span>
                  </div>
                  <p className="mt-1 truncate text-sm text-[#64706b]">{interaction.memo}</p>
                </div>
                {interaction.customers && <Link className="inline-flex min-h-11 items-center font-bold text-[#0d6b58]" href={localePath(locale, `/customers/${interaction.customers.id}`)}>{dictionary.common.open}</Link>}
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
