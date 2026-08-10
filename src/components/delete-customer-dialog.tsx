"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useActionState } from "react";
import { deleteCustomerAction } from "@/app/actions/customers";
import type { ActionResult } from "@/lib/domain/types";

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
  const [state, formAction, pending] = useActionState(
    deleteCustomerAction.bind(null, customerId, returnTo),
    initialState,
  );

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <button className="button button-danger" type="button">고객 영구 삭제</button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-40 bg-[#091a15]/55" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(520px,calc(100%-28px))] -translate-x-1/2 -translate-y-1/2 border border-[#d5dbd7] bg-white p-6 shadow-2xl focus:outline-none sm:p-7">
          <AlertDialog.Title className="text-xl font-extrabold tracking-[-0.03em]">고객을 영구 삭제할까요?</AlertDialog.Title>
          <AlertDialog.Description className="mt-3 text-sm leading-6 text-[#59655f]">
            <strong className="text-[#17201d]">{customerName}</strong> 고객과 연결된 상담 기록 {interactionCount.toLocaleString("ko-KR")}건이 함께 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
          </AlertDialog.Description>
          {!state.ok && <div className="message message-error mt-4" role="alert">{state.message}</div>}
          <form action={formAction} className="mt-6 flex flex-row-reverse flex-wrap gap-2">
            <button className="button button-destructive" type="submit" disabled={pending}>
              {pending ? "삭제 중…" : "영구 삭제"}
            </button>
            <AlertDialog.Cancel asChild>
              <button className="button" type="button" disabled={pending}>취소</button>
            </AlertDialog.Cancel>
          </form>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
