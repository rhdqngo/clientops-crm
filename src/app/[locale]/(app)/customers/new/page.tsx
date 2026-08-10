import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CustomerForm } from "@/components/customer-form";
import { isLocale, localePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: isLocale(locale) ? getDictionary(locale).metadata.newCustomer : "ClientOps" };
}

export default async function NewCustomerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dictionary = getDictionary(locale);
  return (
    <div className="page-wrap">
      <div className="page-title-row">
        <div>
          <Link className="text-sm font-bold text-[#0d6b58] hover:underline" href={localePath(locale, "/customers")}>{dictionary.customers.backToList}</Link>
          <h1 className="page-title mt-3">{dictionary.customers.createHeading}</h1>
        </div>
      </div>
      <section className="mt-6 border-y border-[#d5dbd7] bg-white px-5 py-6 sm:px-7"><CustomerForm mode="create" /></section>
    </div>
  );
}
