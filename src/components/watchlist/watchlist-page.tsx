import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { scanGems } from "@/lib/gems/scan";
import { useWatchlist } from "@/lib/gems/store";
import { formatAge, formatScore, formatUsd, shortAddr } from "@/lib/gems/format";
import { TokenMark } from "@/components/radar/token-mark";

export function WatchlistPage() {
  const items = useWatchlist((s) => s.items);
  const hydrated = useWatchlist((s) => s.hydrated);
  const setHydrated = useWatchlist((s) => s.setHydrated);
  const remove = useWatchlist((s) => s.remove);
  const scan = useQuery({
    queryKey: ["scan"],
    queryFn: () => scanGems(),
    refetchInterval: 45_000,
  });

  useEffect(() => {
    if (!hydrated) {
      const t = window.setTimeout(() => setHydrated(), 50);
      return () => window.clearTimeout(t);
    }
  }, [hydrated, setHydrated]);

  const live = new Map((scan.data?.gems ?? []).map((g) => [g.id, g]));

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-6">
        <header>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal">
            Your board
          </p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight">Watchlist</h1>
        </header>
        <p className="text-sm text-muted">Loading the board…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal">
          Your board
        </p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight">Watchlist</h1>
        <p className="mt-2 text-sm text-muted">
          Saved on this device. The bot keeps scoring anything still on the tape.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <p className="font-medium">Nothing watched yet.</p>
          <p className="mt-1 text-sm text-muted">
            Open a gem on the radar and pin it. Most prints do not deserve a pin.
          </p>
          <Button asChild className="mt-4">
            <Link to="/">Back to radar</Link>
          </Button>
        </div>
      ) : (
        <ul className="grid gap-2">
          {items.map((item) => {
            const gem = live.get(item.id);
            return (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3"
              >
                <TokenMark src={gem?.imageUrl} symbol={item.symbol} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.symbol}</span>
                    {gem ? (
                      <span className="font-mono text-sm tabular-nums text-signal">
                        {formatScore(gem.score)}
                      </span>
                    ) : (
                      <span className="text-xs text-faint">Off this scan</span>
                    )}
                  </div>
                  <div className="truncate text-xs text-muted">
                    {item.name} · {shortAddr(item.mint)}
                    {gem ? ` · ${formatUsd(gem.mcapUsd)} · ${formatAge(gem.ageMs)}` : ""}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => remove(item.id)}>
                  Drop
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
