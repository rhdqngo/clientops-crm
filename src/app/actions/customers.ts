"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/dal";
import { mapAuthorizationError } from "@/lib/actions/result";
import type { ActionResult, Customer } from "@/lib/domain/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { customerIdSchema, customerInputSchema, interactionInputSchema } from "@/lib/validation";

function mapActionError(error: unknown): ActionResult {
  const authorizationResult = mapAuthorizationError(error);
  if (authorizationResult) return authorizationResult;
  return {
    ok: false,
    code: "UNKNOWN",
    message: "요청을 처리하지 못했습니다. 입력 내용을 보존했으니 다시 시도해 주세요.",
  };
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

export async function createCustomerAction(
  _previousState: ActionResult<{ id: string }>,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const parsed = customerInputSchema.safeParse(customerFormValues(formData));
  if (!parsed.success) {
    return {
      ok: false,
      code: "VALIDATION",
      message: "입력 내용을 확인해 주세요.",
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
    return mapActionError(error);
  }

  revalidatePath("/customers");
  revalidatePath("/dashboard");
  redirect(`/customers/${customerId}?created=1`);
}

export async function updateCustomerAction(
  customerId: string,
  _previousState: ActionResult<Customer>,
  formData: FormData,
): Promise<ActionResult<Customer>> {
  const id = customerIdSchema.safeParse(customerId);
  const parsed = customerInputSchema.safeParse(customerFormValues(formData));
  if (!id.success || !parsed.success) {
    return {
      ok: false,
      code: "VALIDATION",
      message: "입력 내용을 확인해 주세요.",
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
    if (!data) {
      return { ok: false, code: "NOT_FOUND", message: "고객을 찾을 수 없습니다." };
    }
    revalidatePath(`/customers/${id.data}`);
    revalidatePath("/customers");
    revalidatePath("/dashboard");
    return { ok: true, data, message: "고객 정보가 저장되었습니다." };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function addInteractionAction(
  customerId: string,
  _previousState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = customerIdSchema.safeParse(customerId);
  const parsed = interactionInputSchema.safeParse({
    type: formData.get("type"),
    memo: formData.get("memo"),
  });
  if (!id.success || !parsed.success) {
    return {
      ok: false,
      code: "VALIDATION",
      message: "상담 내용을 확인해 주세요.",
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
    revalidatePath(`/customers/${id.data}`);
    revalidatePath("/dashboard");
    return { ok: true, message: "상담 기록이 추가되었습니다." };
  } catch (error) {
    return mapActionError(error);
  }
}

export async function deleteCustomerAction(
  customerId: string,
  returnTo: string,
  _previousState: ActionResult,
): Promise<ActionResult> {
  void _previousState;
  const id = customerIdSchema.safeParse(customerId);
  if (!id.success) {
    return { ok: false, code: "VALIDATION", message: "올바르지 않은 고객 ID입니다." };
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
    if (!data) {
      return { ok: false, code: "NOT_FOUND", message: "고객을 찾을 수 없습니다." };
    }
  } catch (error) {
    return mapActionError(error);
  }

  revalidatePath("/customers");
  revalidatePath("/dashboard");
  const destination = returnTo.startsWith("/customers") && !returnTo.startsWith("//")
    ? returnTo
    : "/customers";
  const separator = destination.includes("?") ? "&" : "?";
  redirect(`${destination}${separator}deleted=1`);
}
