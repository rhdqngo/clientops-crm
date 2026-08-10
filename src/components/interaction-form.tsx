"use client";

import { useActionState, useEffect, useRef } from "react";
import { addInteractionAction } from "@/app/actions/customers";
import { INTERACTION_TYPE_LABELS } from "@/lib/domain/labels";
import { INTERACTION_TYPES, type ActionResult } from "@/lib/domain/types";

const initialState: ActionResult = { ok: true };

export function InteractionForm({ customerId }: { customerId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    addInteractionAction.bind(null, customerId),
    initialState,
  );
  const errors = state.ok ? undefined : state.fieldErrors;

  useEffect(() => {
    if (state.ok && state.message) formRef.current?.reset();
  }, [state]);

  return (
    <form action={formAction} className="grid gap-4" ref={formRef} noValidate>
      {state.message && (
        <div className={`message ${state.ok ? "" : "message-error"}`} role={state.ok ? "status" : "alert"}>
          {state.message}
        </div>
      )}
      <div className="field">
        <label htmlFor="interaction-type">상담 유형</label>
        <select className="control" id="interaction-type" name="type" defaultValue="PHONE">
          {INTERACTION_TYPES.map((type) => (
            <option key={type} value={type}>{INTERACTION_TYPE_LABELS[type]}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <div className="flex items-end justify-between gap-3">
          <label htmlFor="interaction-memo">상담 메모</label>
          <span className="text-xs text-[#75807b]">최대 2,000자</span>
        </div>
        <textarea
          className="control"
          id="interaction-memo"
          name="memo"
          maxLength={2000}
          required
          aria-invalid={Boolean(errors?.memo)}
          aria-describedby={errors?.memo ? "interaction-memo-error" : undefined}
        />
        {errors?.memo?.[0] && <span className="field-error" id="interaction-memo-error">{errors.memo[0]}</span>}
      </div>
      <div className="flex justify-end">
        <button className="button button-primary" type="submit" disabled={pending}>
          {pending ? "추가 중…" : "상담 추가"}
        </button>
      </div>
    </form>
  );
}
