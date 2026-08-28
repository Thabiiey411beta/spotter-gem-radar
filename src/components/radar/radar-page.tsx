import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Radio, RefreshCw, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { PLAYBOOKS } from "@/lib/gems/playbooks";
import { rankScore } from "@/lib/gems/score";
import { scanGems } from "@/lib/gems/scan";
import type { Gem, PlaybookId } from "@/lib/gems/types";
import { cn } from "@/lib/utils";
import { GemDetail } from "./gem-detail";
import { GemRow } from "./gem-row";
import { RelativeTime } from "./relative-time";

const DESKS: { id: PlaybookId | "all"; label: string }[] = [
  { id: "all", label: "All desks" },
  ...PLAYBOOKS.map((p) => ({ id: p.id, label: p.name })),
];

export function RadarPage({
  desk,
  onDesk,
}: {
  desk: PlaybookId | "all";
  onDesk: (id: PlaybookId | "all") => void;
}) {
  const [query, setQuery] = useState("");
  const [freshOnly, setFreshOnly] = useState(false);
  const [liveOnly, setLiveOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const scan = useQuery({
    queryKey: ["scan"],
    queryFn: () => scanGems(),
    refetchInterval: 30_000,
  });

  const gems = scan.data?.gems ?? [];
  const meta = scan.data?.meta;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return gems
      .filter((g) => {
        if (freshOnly && g.ageMs > 2 * 3_600_000) return false;
        if (liveOnly && !g.live) return false;
        if (!q) return true;
        return (
          g.symbol.toLowerCase().includes(q) ||
          g.name.toLowerCase().includes(q) ||
          g.mint.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => rankScore(b, desk) - rankScore(a, desk));
  }, [gems, query, freshOnly, liveOnly, desk]);

  const selected =
    filtered.find((g) => g.id === selectedId) ?? filtered[0] ?? null;

  function pick(gem: Gem) {
    setSelectedId(gem.id);
    if (window.matchMedia("(max-width: 767px)").matches) setMobileOpen(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-xl border border-border bg-surface p-5 md:p-6">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-40 overflow-hidden md:block">
          <div className="scan-line absolute inset-x-0 h-24" />
          <div className="relative mx-auto mt-6 size-28">
            <div className="radar-disc absolute inset-0 rounded-full opacity-80" />
            <div className="radar-sweep absolute inset-0 rounded-full" />
          </div>
        </div>
        <div className="relative max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal">
            Early gem radar
          </p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
            The bot reads the tape. You still make the call.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted md:text-base">
            Spotter watches new Pump.fun prints and fresh Solana pools, then ranks
            them with desks distilled from how elite memecoin traders actually hunt:
            snipers, narrative holders, tape readers, wallet watchers, and the
            desks that survived.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-signal">
              <span className="size-1.5 rounded-full bg-signal live-dot" />
              {scan.isFetching ? "Scanning" : "Live"}
            </span>
            {meta ? (
              <>
                <span className="text-muted">
                  {meta.counts.total} on tape · {meta.counts.hot} hot · {meta.counts.live} live
                </span>
                <span className="text-faint">
                  <RelativeTime at={meta.scannedAt} />
                </span>
              </>
            ) : (
              <span className="text-muted">Warming the desk…</span>
            )}
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-1.5">
          {DESKS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => onDesk(d.id)}
              className={cn(
                "h-11 rounded-full px-3.5 text-sm font-medium transition-colors duration-150",
                desk === d.id
                  ? "bg-accent text-accent-fg"
                  : "bg-surface text-muted hover:text-fg",
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ticker, name, or contract"
              className="pl-10"
            />
          </div>
          <div className="flex gap-1.5">
            <Button
              variant={freshOnly ? "default" : "secondary"}
              size="sm"
              className="h-11"
              onClick={() => setFreshOnly((v) => !v)}
            >
              First 2h
            </Button>
            <Button
              variant={liveOnly ? "default" : "secondary"}
              size="sm"
              className="h-11"
              onClick={() => setLiveOnly((v) => !v)}
            >
              <Radio className="size-4" />
              Live
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Scan now"
              onClick={() => scan.refetch()}
              disabled={scan.isFetching}
            >
              <RefreshCw className={scan.isFetching ? "animate-spin" : ""} />
            </Button>
          </div>
        </div>
      </div>

      {desk !== "all" ? (
        <p className="text-sm text-muted">
          Ranking with the {PLAYBOOKS.find((p) => p.id === desk)?.name} desk.{" "}
          {PLAYBOOKS.find((p) => p.id === desk)?.hunts}
        </p>
      ) : null}

      {scan.isError ? (
        <div className="rounded-xl border border-border bg-surface p-6 text-sm text-muted">
          The tape went dark. Retry in a moment — Pump and pool feeds are public and
          sometimes throttle.
          <div className="mt-3">
            <Button size="sm" onClick={() => scan.refetch()}>
              Scan again
            </Button>
          </div>
        </div>
      ) : null}

      {scan.isLoading ? <RadarSkeleton /> : null}

      {!scan.isLoading && filtered.length === 0 && !scan.isError ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <p className="font-medium">Nothing on this filter.</p>
          <p className="mt-1 text-sm text-muted">
            Widen the desk, drop “first 2h”, or wait for the next print.
          </p>
        </div>
      ) : null}

      {filtered.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]">
          <div className="rounded-xl border border-border bg-surface p-2">
            <div className="flex items-center justify-between px-2 py-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
                Ranked tape
              </span>
              <Badge>{filtered.length}</Badge>
            </div>
            <div className="flex flex-col">
              {filtered.slice(0, 60).map((gem) => (
                <GemRow
                  key={gem.id}
                  gem={gem}
                  desk={desk}
                  selected={selected?.id === gem.id}
                  onSelect={() => pick(gem)}
                />
              ))}
            </div>
          </div>
          <aside className="hidden rounded-xl border border-border bg-surface p-4 md:block">
            {selected ? <GemDetail gem={selected} desk={desk} /> : null}
          </aside>
        </div>
      ) : null}

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent title={selected?.symbol ?? "Gem"}>
          {selected ? <GemDetail gem={selected} desk={desk} /> : null}
        </SheetContent>
      </Sheet>

      <p className="text-xs leading-relaxed text-faint">
        Spotter is a research radar, not a broker. Scores are heuristics on public
        market data. Most new memecoins go to zero. This is not financial advice,
        not insider information, and not a promise that a “hot” print will print
        for you.
        {meta?.warnings.length ? ` Feed notes: ${meta.warnings.join(" · ")}.` : ""}
      </p>
    </div>
  );
}

function RadarSkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-lg" />
      ))}
    </div>
  );
}
