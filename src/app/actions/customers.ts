"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/dal";
import { mapAuthorizationError } from "@/lib/actions/result";
import type { ActionResult, Customer } from "@/lib/domain/types";
import { DEFAULT_LOCALE, isLocale, LOCALES, localePath, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { safeCustomerReturnTo } from "@/lib/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCustomerIdSchema, getCustomerInputSchema, getInteractionInputSchema } from "@/lib/validation";

function normalizeLocale(locale: Locale): Locale {
  return isLocale(locale) ? locale : DEFAULT_LOCALE;
}

function mapActionError(error: unknown, locale: Locale): ActionResult {
  const authorizationResult = mapAuthorizationError(error, locale);
  if (authorizationResult) return authorizationResult;
  return { ok: false, code: "UNKNOWN", message: getDictionary(locale).errors.actionUnknown };
}

function customerFormValues(formData: FormData) {
  return {
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
    status: formData.get("status"),
  };
}

function revalidateCustomerViews(customerId?: string) {
  for (const locale of LOCALES) {
    revalidatePath(localePath(locale, "/customers"));
    revalidatePath(localePath(locale, "/dashboard"));
    if (customerId) revalidatePath(localePath(locale, `/customers/${customerId}`));
  }
}

export async function createCustomerAction(
  requestedLocale: Locale,
  _previousState: ActionResult<{ id: string }>,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const locale = normalizeLocale(requestedLocale);
  const messages = getDictionary(locale);
  const parsed = getCustomerInputSchema(locale).safeParse(customerFormValues(formData));
  if (!parsed.success) {
    return {
      ok: false,
      code: "VALIDATION",
      message: messages.errors.input,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  let customerId: string;
  try {
    await requireRole(["ADMIN", "STAFF"]);
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("customers")
      .insert({
        ...parsed.data,
        phone: parsed.data.phone ?? null,
        email: parsed.data.email ?? null,
        address: parsed.data.address ?? null,
      })
      .select("id")
      .single();
    if (error || !data) throw error ?? new Error("Missing inserted customer");
    customerId = data.id;
  } catch (error) {
    return mapActionError(error, locale);
  }

  revalidateCustomerViews(customerId);
  redirect(`${localePath(locale, `/customers/${customerId}`)}?created=1`);
}

export async function updateCustomerAction(
  requestedLocale: Locale,
  customerId: string,
  _previousState: ActionResult<Customer>,
  formData: FormData,
): Promise<ActionResult<Customer>> {
  const locale = normalizeLocale(requestedLocale);
  const messages = getDictionary(locale);
  const id = getCustomerIdSchema(locale).safeParse(customerId);
  const parsed = getCustomerInputSchema(locale).safeParse(customerFormValues(formData));
  if (!id.success || !parsed.success) {
    return {
      ok: false,
      code: "VALIDATION",
      message: messages.errors.input,
      fieldErrors: parsed.success ? undefined : parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await requireRole(["ADMIN", "STAFF"]);
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("customers")
      .update({
        ...parsed.data,
        phone: parsed.data.phone ?? null,
        email: parsed.data.email ?? null,
        address: parsed.data.address ?? null,
      })
      .eq("id", id.data)
      .select("id,name,phone,email,address,status,created_at,updated_at")
      .maybeSingle();
    if (error) throw error;
    if (!data) return { ok: false, code: "NOT_FOUND", message: messages.errors.customerNotFound };
    revalidateCustomerViews(id.data);
    return { ok: true, data, message: messages.success.customerUpdated };
  } catch (error) {
    return mapActionError(error, locale);
  }
}

export async function addInteractionAction(
  requestedLocale: Locale,
  customerId: string,
  _previousState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const locale = normalizeLocale(requestedLocale);
  const messages = getDictionary(locale);
  const id = getCustomerIdSchema(locale).safeParse(customerId);
  const parsed = getInteractionInputSchema(locale).safeParse({
    type: formData.get("type"),
    memo: formData.get("memo"),
  });
  if (!id.success || !parsed.success) {
    return {
      ok: false,
      code: "VALIDATION",
      message: messages.errors.interactionInput,
      fieldErrors: parsed.success ? undefined : parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const context = await requireRole(["ADMIN", "STAFF"]);
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("interactions").insert({
      customer_id: id.data,
      type: parsed.data.type,
      memo: parsed.data.memo,
      created_by: context.user.id,
    });
    if (error) throw error;
    revalidateCustomerViews(id.data);
    return { ok: true, message: messages.success.interactionAdded };
  } catch (error) {
    return mapActionError(error, locale);
  }
}

export async function deleteCustomerAction(
  requestedLocale: Locale,
  customerId: string,
  returnTo: string,
  _previousState: ActionResult,
): Promise<ActionResult> {
  void _previousState;
  const locale = normalizeLocale(requestedLocale);
  const messages = getDictionary(locale);
  const id = getCustomerIdSchema(locale).safeParse(customerId);
  if (!id.success) {
    return { ok: false, code: "VALIDATION", message: messages.errors.invalidCustomerId };
  }

  try {
    await requireRole(["ADMIN"]);
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("customers")
      .delete()
      .eq("id", id.data)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) return { ok: false, code: "NOT_FOUND", message: messages.errors.customerNotFound };
  } catch (error) {
    return mapActionError(error, locale);
  }

  revalidateCustomerViews(id.data);
  const destination = safeCustomerReturnTo(returnTo, locale);
  const separator = destination.includes("?") ? "&" : "?";
  redirect(`${destination}${separator}deleted=1`);
}
