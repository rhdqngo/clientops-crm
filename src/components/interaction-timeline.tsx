import { formatSeoulDateTime, INTERACTION_TYPE_LABELS } from "@/lib/domain/labels";
import type { Interaction } from "@/lib/domain/types";

export function InteractionTimeline({ interactions }: { interactions: Interaction[] }) {
  if (interactions.length === 0) {
    return (
      <div className="border-y border-[#d5dbd7] px-4 py-8 text-center">
        <p className="font-bold">상담 기록이 없습니다</p>
        <p className="mt-2 text-sm text-[#64706b]">아래 양식에서 첫 상담을 추가할 수 있습니다.</p>
      </div>
    );
  }

  return (
    <ol className="border-t border-[#d5dbd7]">
      {interactions.map((interaction) => (
        <li className="grid gap-3 border-b border-[#d5dbd7] py-5 sm:grid-cols-[150px_minmax(0,1fr)]" key={interaction.id}>
          <time className="text-sm leading-5 text-[#64706b]" dateTime={interaction.created_at}>
            {formatSeoulDateTime(interaction.created_at)}
          </time>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-bold">
              <span>{INTERACTION_TYPE_LABELS[interaction.type]}</span>
              <span aria-hidden="true" className="text-[#a8b0ac]">·</span>
              <span>{interaction.profiles?.email ?? "담당자"}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap break-words text-[0.95rem] leading-6 text-[#37413d]">{interaction.memo}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
