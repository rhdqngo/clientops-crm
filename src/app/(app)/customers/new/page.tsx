import type { Metadata } from "next";
import Link from "next/link";
import { CustomerForm } from "@/components/customer-form";

export const metadata: Metadata = { title: "새 고객" };

export default function NewCustomerPage() {
  return (
    <div className="page-wrap">
      <div className="page-title-row">
        <div>
          <Link className="text-sm font-bold text-[#0d6b58] hover:underline" href="/customers">← 고객 목록</Link>
          <h1 className="page-title mt-3">새 고객</h1>
        </div>
      </div>
      <section className="mt-6 border-y border-[#d5dbd7] bg-white px-5 py-6 sm:px-7">
        <CustomerForm mode="create" />
      </section>
    </div>
  );
}
