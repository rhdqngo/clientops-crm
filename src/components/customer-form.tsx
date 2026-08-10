"use client";

import { useActionState } from "react";
import { createCustomerAction, updateCustomerAction } from "@/app/actions/customers";
import { CUSTOMER_STATUS_LABELS } from "@/lib/domain/labels";
import { CUSTOMER_STATUSES, type ActionResult, type Customer } from "@/lib/domain/types";

type CustomerFormProps =
  | { mode: "create"; customer?: never }
  | { mode: "edit"; customer: Customer };

type CustomerMutationData = Customer | { id: string };
type CustomerMutationAction = (
  state: ActionResult<CustomerMutationData>,
  formData: FormData,
) => Promise<ActionResult<CustomerMutationData>>;

const initialState: ActionResult<CustomerMutationData> = { ok: true };

function ErrorText({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors?.[0]) return null;
  return (
    <span className="field-error" id={id}>
      {errors[0]}
    </span>
  );
}

export function CustomerForm(props: CustomerFormProps) {
  const action =
    (props.mode === "create"
      ? createCustomerAction
      : updateCustomerAction.bind(null, props.customer.id)) as CustomerMutationAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const customer = props.mode === "edit" ? props.customer : undefined;
  const errors = state.ok ? undefined : state.fieldErrors;

  return (
    <form action={formAction} className="grid gap-6" noValidate>
      {state.message && (
        <div className={`message ${state.ok ? "" : "message-error"}`} role={state.ok ? "status" : "alert"}>
          {state.message}
        </div>
      )}
      <div className="grid gap-5 md:grid-cols-2">
        <div className="field md:col-span-2">
          <label htmlFor="name">고객명</label>
          <input
            className="control"
            id="name"
            name="name"
            defaultValue={customer?.name}
            maxLength={100}
            required
            aria-invalid={Boolean(errors?.name)}
            aria-describedby={errors?.name ? "name-error" : undefined}
          />
          <ErrorText id="name-error" errors={errors?.name} />
        </div>
        <div className="field">
          <label htmlFor="phone">전화번호</label>
          <input
            className="control"
            id="phone"
            name="phone"
            type="tel"
            defaultValue={customer?.phone ?? ""}
            maxLength={30}
            autoComplete="tel"
            aria-invalid={Boolean(errors?.phone)}
            aria-describedby={errors?.phone ? "phone-error" : undefined}
          />
          <ErrorText id="phone-error" errors={errors?.phone} />
        </div>
        <div className="field">
          <label htmlFor="email">이메일</label>
          <input
            className="control"
            id="email"
            name="email"
            type="email"
            defaultValue={customer?.email ?? ""}
            maxLength={254}
            autoComplete="email"
            aria-invalid={Boolean(errors?.email)}
            aria-describedby={errors?.email ? "customer-email-error" : undefined}
          />
          <ErrorText id="customer-email-error" errors={errors?.email} />
        </div>
        <div className="field">
          <label htmlFor="status">상태</label>
          <select className="control" id="status" name="status" defaultValue={customer?.status ?? "NEW"}>
            {CUSTOMER_STATUSES.map((status) => (
              <option value={status} key={status}>
                {CUSTOMER_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          <ErrorText id="status-error" errors={errors?.status} />
        </div>
        <div className="field md:col-span-2">
          <label htmlFor="address">주소</label>
          <input
            className="control"
            id="address"
            name="address"
            defaultValue={customer?.address ?? ""}
            maxLength={300}
            autoComplete="street-address"
            aria-invalid={Boolean(errors?.address)}
            aria-describedby={errors?.address ? "address-error" : undefined}
          />
          <ErrorText id="address-error" errors={errors?.address} />
        </div>
      </div>
      <div className="flex flex-wrap justify-end gap-2 border-t border-[#d5dbd7] pt-5">
        <button className="button button-primary" type="submit" disabled={pending}>
          {pending ? "저장 중…" : props.mode === "create" ? "고객 등록" : "변경 저장"}
        </button>
      </div>
    </form>
  );
}
