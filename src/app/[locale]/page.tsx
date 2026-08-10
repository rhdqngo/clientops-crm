import { redirect } from "next/navigation";
import { isLocale, localePath } from "@/lib/i18n/config";

export default async function LocaleHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) redirect("/en/dashboard");
  redirect(localePath(locale, "/dashboard"));
}
