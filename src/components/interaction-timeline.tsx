import { formatSeoulDateTime, getInteractionTypeLabels } from "@/lib/domain/labels";
import type { Interaction } from "@/lib/domain/types";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export function InteractionTimeline({ interactions, locale }: { interactions: Interaction[]; locale: Locale }) {
  const dictionary = getDictionary(locale);
  const typeLabels = getInteractionTypeLabels(locale);
  if (interactions.length === 0) {
    return (
      <div className="border-y border-[#d5dbd7] px-4 py-8 text-center">
        <p className="font-bold">{dictionary.interaction.empty}</p>
        <p className="mt-2 text-sm text-[#64706b]">{dictionary.interaction.emptyHelp}</p>
      </div>
    );
  }

  return (
    <ol className="border-t border-[#d5dbd7]">
      {interactions.map((interaction) => (
        <li className="grid gap-3 border-b border-[#d5dbd7] py-5 sm:grid-cols-[150px_minmax(0,1fr)]" key={interaction.id}>
          <time className="text-sm leading-5 text-[#64706b]" dateTime={interaction.created_at}>{formatSeoulDateTime(interaction.created_at, locale)}</time>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-bold">
              <span>{typeLabels[interaction.type]}</span>
              <span aria-hidden="true" className="text-[#a8b0ac]">·</span>
              <span>{interaction.profiles?.email ?? dictionary.interaction.ownerFallback}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap break-words text-[0.95rem] leading-6 text-[#37413d]">{interaction.memo}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
