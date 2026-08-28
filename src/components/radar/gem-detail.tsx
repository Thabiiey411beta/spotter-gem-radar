import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Bookmark,
  BookmarkCheck,
  Copy,
  ExternalLink,
  LoaderCircle,
  Radio,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { deskBrief } from "@/lib/gems/brief";
import { FLAG_LABEL, PLAYBOOK_BY_ID, PLAYBOOKS } from "@/lib/gems/playbooks";
import {
  chainLabel,
  formatAge,
  formatPct,
  formatScore,
  formatUsd,
  shortAddr,
} from "@/lib/gems/format";
import { rankScore } from "@/lib/gems/score";
import { useWatchlist } from "@/lib/gems/store";
import type { Gem, PlaybookId } from "@/lib/gems/types";
import { ScoreBars } from "./score-bars";
import { TokenMark } from "./token-mark";

export function GemDetail({
  gem,
  desk,
}: {
  gem: Gem;
  desk: PlaybookId | "all";
}) {
  const hydrated = useWatchlist((s) => s.hydrated);
  const watched = useWatchlist((s) => s.items.some((i) => i.id === gem.id));
  const toggle = useWatchlist((s) => s.toggle);
  const [brief, setBrief] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: () =>
      deskBrief({
        data: {
          name: gem.name,
          symbol: gem.symbol,
          mint: gem.mint,
          age: formatAge(gem.ageMs),
          mcap: formatUsd(gem.mcapUsd),
          liquidity: formatUsd(gem.liquidityUsd),
          score: rankScore(gem, desk),
          live: gem.live,
          replies: gem.replies,
          thesis: gem.thesis,
          flags: gem.flags,
          socials: [
            gem.socials.twitter && "twitter",
            gem.socials.telegram && "telegram",
            gem.socials.website && "website",
          ]
            .filter(Boolean)
            .join(", "),
          desk: desk === "all" ? "combined" : PLAYBOOK_BY_ID[desk].name,
        },
      }),
    onSuccess: (res) => {
      if (res.ok) setBrief(res.text);
      else toast.error(res.error);
    },
    onError: () => toast.error("Desk brief failed."),
  });

  const score = rankScore(gem, desk);
  const isWatched = hydrated && watched;

  async function copyMint() {
    try {
      await navigator.clipboard.writeText(gem.mint);
      toast.success("Contract copied");
    } catch {
      toast.error("Could not copy");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-3">
        <TokenMark src={gem.imageUrl} symbol={gem.symbol} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-xl font-medium tracking-tight">{gem.symbol}</h2>
              <p className="truncate text-sm text-muted">{gem.name}</p>
            </div>
            <div className="text-right">
              <div
                className={
                  score >= 70
                    ? "font-mono text-3xl font-medium tabular-nums leading-none text-signal"
                    : "font-mono text-3xl font-medium tabular-nums leading-none"
                }
              >
                {formatScore(score)}
              </div>
              <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted">
                {desk === "all" ? "Desk score" : PLAYBOOK_BY_ID[desk].name}
              </div>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge>{chainLabel(gem.chain)}</Badge>
            <Badge>{formatAge(gem.ageMs)}</Badge>
            {gem.live ? (
              <Badge tone="signal">
                <Radio className="size-3" /> Live
                {gem.liveViewers ? ` · ${gem.liveViewers}` : ""}
              </Badge>
            ) : null}
            {gem.graduated ? <Badge>Graduated</Badge> : <Badge tone="accent">On curve</Badge>}
            {gem.flags.map((f) => (
              <Badge key={f} tone={FLAG_LABEL[f].tone}>
                {FLAG_LABEL[f].label}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-muted">{gem.thesis}</p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Market cap" value={formatUsd(gem.mcapUsd)} />
        <Stat label="Liquidity" value={formatUsd(gem.liquidityUsd)} />
        <Stat label="1h vol" value={formatUsd(gem.volume.h1 || gem.volume.m5)} />
        <Stat
          label="1h change"
          value={formatPct(gem.priceChange.h1 || gem.priceChange.m5)}
          hot={(gem.priceChange.h1 || gem.priceChange.m5) > 0}
        />
      </div>

      <ScoreBars breakdown={gem.breakdown} />

      <div>
        <div className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted">
          Playbook scores
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {PLAYBOOKS.map((p) => (
            <div
              key={p.id}
              className="rounded-md border border-border bg-surface-2 px-2 py-1.5"
            >
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted">
                {p.name}
              </div>
              <div className="font-mono text-sm tabular-nums">
                {formatScore(gem.playbookScores[p.id])}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={isWatched ? "secondary" : "default"}
          size="sm"
          onClick={() => toggle(gem)}
        >
          {isWatched ? <BookmarkCheck /> : <Bookmark />}
          {isWatched ? "Watching" : "Watch"}
        </Button>
        <Button variant="secondary" size="sm" onClick={copyMint}>
          <Copy />
          {shortAddr(gem.mint)}
        </Button>
        {gem.links.pump ? (
          <Button variant="outline" size="sm" asChild>
            <a href={gem.links.pump} target="_blank" rel="noreferrer">
              <ExternalLink /> Pump
            </a>
          </Button>
        ) : null}
        {gem.links.dex ? (
          <Button variant="outline" size="sm" asChild>
            <a href={gem.links.dex} target="_blank" rel="noreferrer">
              <ExternalLink /> Chart
            </a>
          </Button>
        ) : null}
        {gem.socials.twitter ? (
          <Button variant="outline" size="sm" asChild>
            <a href={gem.socials.twitter} target="_blank" rel="noreferrer">
              X
            </a>
          </Button>
        ) : null}
        {gem.socials.telegram ? (
          <Button variant="outline" size="sm" asChild>
            <a href={gem.socials.telegram} target="_blank" rel="noreferrer">
              TG
            </a>
          </Button>
        ) : null}
      </div>

      <Separator />

      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="font-mono text-[11px] uppercase tracking-wider text-muted">
            Desk brief
          </div>
          <Button
            size="sm"
            variant="secondary"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? <LoaderCircle className="animate-spin" /> : null}
            {brief ? "Re-run" : "Ask the desk"}
          </Button>
        </div>
        {brief ? (
          <pre className="whitespace-pre-wrap rounded-lg border border-border bg-bg p-3 font-sans text-sm leading-relaxed text-fg">
            {brief}
          </pre>
        ) : (
          <p className="text-sm text-muted">
            A skeptical one-pager from the night desk. User-triggered, not a trading signal.
          </p>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hot,
}: {
  label: string;
  value: string;
  hot?: boolean;
}) {
  return (
    <div className="rounded-md border border-border bg-surface-2 px-3 py-2">
      <div className="font-mono text-[10px] uppercase tracking-wider text-muted">{label}</div>
      <div className={hot ? "font-mono text-sm tabular-nums text-signal" : "font-mono text-sm tabular-nums"}>
        {value}
      </div>
    </div>
  );
}
