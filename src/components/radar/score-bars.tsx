import { cn } from "@/lib/utils";
import type { ScoreBreak } from "@/lib/gems/types";

const ROWS: { key: keyof ScoreBreak; label: string; max: number }[] = [
  { key: "freshness", label: "Fresh", max: 20 },
  { key: "size", label: "Size", max: 18 },
  { key: "flow", label: "Flow", max: 22 },
  { key: "social", label: "Social", max: 20 },
  { key: "quality", label: "Quality", max: 20 },
];

export function ScoreBars({ breakdown }: { breakdown: ScoreBreak }) {
  return (
    <div className="grid gap-2">
      {ROWS.map((row) => {
        const value = breakdown[row.key];
        const pct = Math.round((value / row.max) * 100);
        return (
          <div key={row.key} className="grid grid-cols-[72px_1fr_28px] items-center gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
              {row.label}
            </span>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div
                className={cn(
                  "h-full rounded-full bg-signal transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  pct < 40 && "bg-muted",
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-right font-mono text-[11px] tabular-nums text-muted">
              {Math.round(value)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
