"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useActionState } from "react";
import { deleteCustomerAction } from "@/app/actions/customers";
import type { ActionResult } from "@/lib/domain/types";
import { formatNumber } from "@/lib/domain/labels";
import { formatMessage } from "@/lib/i18n/dictionaries";
import { useI18n } from "@/lib/i18n/provider";

const initialState: ActionResult = { ok: true };

export function DeleteCustomerDialog({
  customerId,
  customerName,
  interactionCount,
  returnTo,
}: {
  customerId: string;
  customerName: string;
  interactionCount: number;
  returnTo: string;
}) {
  const { locale, dictionary } = useI18n();
  const [state, formAction, pending] = useActionState(
    deleteCustomerAction.bind(null, locale, customerId, returnTo),
    initialState,
  );

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild><button className="button button-danger" type="button">{dictionary.deletion.trigger}</button></AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-40 bg-[#091a15]/55" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(520px,calc(100%-28px))] -translate-x-1/2 -translate-y-1/2 border border-[#d5dbd7] bg-white p-6 shadow-2xl focus:outline-none sm:p-7">
          <AlertDialog.Title className="text-xl font-extrabold tracking-[-0.03em]">{dictionary.deletion.title}</AlertDialog.Title>
          <AlertDialog.Description className="mt-3 text-sm leading-6 text-[#59655f]">
            {formatMessage(dictionary.deletion.description, { name: customerName, count: formatNumber(interactionCount, locale) })}
          </AlertDialog.Description>
          {!state.ok && <div className="message message-error mt-4" role="alert">{state.message}</div>}
          <form action={formAction} className="mt-6 flex flex-row-reverse flex-wrap gap-2">
            <button className="button button-destructive" type="submit" disabled={pending}>{pending ? dictionary.deletion.pending : dictionary.deletion.confirm}</button>
            <AlertDialog.Cancel asChild><button className="button" type="button" disabled={pending}>{dictionary.common.cancel}</button></AlertDialog.Cancel>
          </form>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
