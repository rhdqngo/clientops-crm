"use client";

import { useActionState, useEffect, useRef } from "react";
import { addInteractionAction } from "@/app/actions/customers";
import { INTERACTION_TYPES, type ActionResult } from "@/lib/domain/types";
import { useI18n } from "@/lib/i18n/provider";

const initialState: ActionResult = { ok: true };

export function InteractionForm({ customerId }: { customerId: string }) {
  const { locale, dictionary } = useI18n();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    addInteractionAction.bind(null, locale, customerId),
    initialState,
  );
  const errors = state.ok ? undefined : state.fieldErrors;

  useEffect(() => {
    if (state.ok && state.message) formRef.current?.reset();
  }, [state]);

  return (
    <form action={formAction} className="grid gap-4" ref={formRef} noValidate>
      {state.message && <div className={`message ${state.ok ? "" : "message-error"}`} role={state.ok ? "status" : "alert"}>{state.message}</div>}
      <div className="field">
        <label htmlFor="interaction-type">{dictionary.interaction.type}</label>
        <select className="control" id="interaction-type" name="type" defaultValue="PHONE">
          {INTERACTION_TYPES.map((type) => <option key={type} value={type}>{dictionary.interactionTypes[type]}</option>)}
        </select>
      </div>
      <div className="field">
        <div className="flex items-end justify-between gap-3">
          <label htmlFor="interaction-memo">{dictionary.interaction.memo}</label>
          <span className="text-xs text-[#75807b]">{dictionary.interaction.memoLimit}</span>
        </div>
        <textarea className="control" id="interaction-memo" name="memo" maxLength={2000} required aria-invalid={Boolean(errors?.memo)} aria-describedby={errors?.memo ? "interaction-memo-error" : undefined} />
        {errors?.memo?.[0] && <span className="field-error" id="interaction-memo-error">{errors.memo[0]}</span>}
      </div>
      <div className="flex justify-end">
        <button className="button button-primary" type="submit" disabled={pending}>
          {pending ? dictionary.interaction.adding : dictionary.interaction.add}
        </button>
      </div>
    </form>
  );
}
