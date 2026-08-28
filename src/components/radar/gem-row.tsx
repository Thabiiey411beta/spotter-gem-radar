import { Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { chainLabel, formatAge, formatScore, formatUsd } from "@/lib/gems/format";
import { rankScore } from "@/lib/gems/score";
import type { Gem, PlaybookId } from "@/lib/gems/types";
import { TokenMark } from "./token-mark";

export function GemRow({
  gem,
  desk,
  selected,
  onSelect,
}: {
  gem: Gem;
  desk: PlaybookId | "all";
  selected: boolean;
  onSelect: () => void;
}) {
  const score = rankScore(gem, desk);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors duration-150",
        selected
          ? "border-accent/40 bg-surface-2"
          : "border-transparent bg-transparent hover:bg-surface",
      )}
    >
      <TokenMark src={gem.imageUrl} symbol={gem.symbol} />
      <span className="min-w-0">
        <span className="flex items-center gap-2">
          <span className="truncate font-medium">{gem.symbol}</span>
          {gem.live ? (
            <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-signal">
              <Radio className="size-3 live-dot" strokeWidth={2} />
              Live
            </span>
          ) : null}
        </span>
        <span className="mt-0.5 flex items-center gap-2 truncate text-xs text-muted">
          <span className="truncate">{gem.name}</span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-faint">
            {chainLabel(gem.chain)} · {formatAge(gem.ageMs)}
          </span>
        </span>
      </span>
      <span className="text-right">
        <span
          className={cn(
            "block font-mono text-lg font-medium tabular-nums leading-none",
            score >= 70 ? "text-signal" : score >= 55 ? "text-fg" : "text-muted",
          )}
        >
          {formatScore(score)}
        </span>
        <span className="mt-1 block font-mono text-[11px] tabular-nums text-muted">
          {formatUsd(gem.mcapUsd)}
        </span>
      </span>
    </button>
  );
}
