import type {
  FlowWindow,
  Gem,
  PlaybookId,
  RiskFlag,
  ScoreBreak,
} from "./types";
import { PLAYBOOKS } from "./playbooks";

const clamp = (n: number, min = 0, max = 100) => Math.min(max, Math.max(min, n));

function ratio(a: number, b: number): number {
  if (b <= 0) return a > 0 ? 8 : 0;
  return a / b;
}

function uniqueBuyers(tx: FlowWindow): number {
  return Math.max(tx.buyers, 0);
}

type GemInput = Omit<Gem, "score" | "playbookScores" | "breakdown" | "flags" | "thesis">;

export function scoreDimensions(gem: GemInput): {
  breakdown: ScoreBreak;
  flags: RiskFlag[];
} {
  const ageH = gem.ageMs / 3_600_000;
  const ageM = gem.ageMs / 60_000;
  const flags: RiskFlag[] = [];

  let freshness = 0;
  if (ageM < 3) freshness = 11;
  else if (ageM < 12) freshness = 20;
  else if (ageM < 30) freshness = 19;
  else if (ageM < 60) freshness = 17;
  else if (ageM < 120) freshness = 15;
  else if (ageH < 6) freshness = 12;
  else if (ageH < 18) freshness = 8;
  else if (ageH < 36) freshness = 5;
  else if (ageH < 72) freshness = 3;
  else freshness = gem.live ? 4 : 1;

  const mcap = gem.mcapUsd;
  let size = 0;
  if (mcap <= 0) size = 4;
  else if (mcap < 4_000) size = 7;
  else if (mcap < 12_000) size = 14;
  else if (mcap < 40_000) size = 17;
  else if (mcap < 90_000) size = 18;
  else if (mcap < 180_000) size = 16;
  else if (mcap < 400_000) size = 13;
  else if (mcap < 1_200_000) size = 8;
  else if (mcap < 4_000_000) size = 4;
  else size = 1;

  const buyers = Math.max(uniqueBuyers(gem.txns.m5), uniqueBuyers(gem.txns.h1));
  const buys = gem.txns.h1.buys + gem.txns.m5.buys;
  const sells = gem.txns.h1.sells + gem.txns.m5.sells;
  const volH1 = gem.volume.h1 || gem.volume.m5;
  const liq = gem.liquidityUsd;
  const volLiq = ratio(volH1, Math.max(liq, 1));
  const buyRatio = buys + sells > 0 ? buys / (buys + sells) : 0.5;
  const replyVel = gem.replies / Math.sqrt(Math.max(ageH, 0.08));

  let flow = 0;
  flow += clamp(buyers * 2.2, 0, 8);
  flow += clamp(volLiq * 3.5, 0, 5);
  if (buyRatio >= 0.52 && buyRatio <= 0.78) flow += 4;
  else if (buyRatio > 0.78 && buyRatio < 0.92) flow += 2;
  else if (buyRatio >= 0.92 && buys > 8) flow += 0.5;
  else if (buyRatio < 0.4) flow += 1;
  flow += clamp(replyVel / 8, 0, 3);
  if (gem.live) flow += 3;
  flow += clamp((gem.liveViewers ?? 0) / 25, 0, 3);
  if (volH1 > 500 && buyers >= 6) flow += 2;
  flow = clamp(flow, 0, 22);

  let social = 0;
  if (gem.socials.twitter) social += 4;
  if (gem.socials.telegram) social += 3;
  if (gem.socials.website) social += 2;
  if (gem.username) social += 2;
  social += clamp(gem.replies / 12, 0, 5);
  if (gem.live) social += 5;
  if (gem.liveTitle) social += 1;
  if (gem.boost && gem.boost !== "NONE") social += 2;
  const name = `${gem.name} ${gem.symbol}`.toLowerCase();
  const generic =
    /^(pepe|doge|shib|inu|moon|elon|trump|cat|dog|ai|meme|coin)\d*$/i.test(
      gem.symbol,
    ) || name.includes("unknown");
  if (!generic && gem.symbol.length <= 8) social += 1;
  social = clamp(social, 0, 20);

  let quality = 10;
  if (liq >= 8_000 || (!gem.graduated && liq >= 400)) quality += 4;
  if (liq >= 25_000) quality += 2;
  if (buyers >= 8) quality += 3;
  if (sells > 0 && buys > 0) quality += 3;
  if (gem.graduated && liq < 4_000) quality -= 8;
  if (liq < 200 && gem.graduated) quality -= 6;
  if (buyers <= 1 && volH1 > 400) quality -= 7;
  if (buyRatio > 0.97 && buys >= 6) quality -= 4;
  if (ageM < 2 && gem.replies === 0 && !gem.live) quality -= 2;
  if (mcap > 5_000_000) quality -= 4;
  quality = clamp(quality, 0, 20);

  const hasSocial = Boolean(
    gem.socials.twitter || gem.socials.telegram || gem.socials.website || gem.live,
  );
  if (!hasSocial) flags.push("no-socials");
  if (buys >= 6 && sells === 0 && volH1 > 400) flags.push("one-sided-tape");
  if ((gem.graduated && liq < 3_000) || liq < 80) flags.push("thin-liquidity");
  if (ageM < 3) flags.push("too-new");
  if (mcap > 2_500_000 || (ageH > 6 && (gem.priceChange.h24 ?? 0) > 400)) {
    flags.push("already-ran");
  }
  if (buyers > 0 && buyers <= 2 && volH1 > 800) flags.push("single-wallet");
  if (volH1 < 20 && gem.replies === 0 && !gem.live) flags.push("no-activity");

  return {
    breakdown: { freshness, size, flow, social, quality },
    flags,
  };
}

function weightedScore(breakDown: ScoreBreak, weights: Record<keyof ScoreBreak, number>): number {
  const max =
    20 * weights.freshness +
    18 * weights.size +
    22 * weights.flow +
    20 * weights.social +
    20 * weights.quality;
  const raw =
    breakDown.freshness * weights.freshness +
    breakDown.size * weights.size +
    breakDown.flow * weights.flow +
    breakDown.social * weights.social +
    breakDown.quality * weights.quality;
  return clamp((raw / max) * 100);
}

export function thesisFor(
  gem: Pick<Gem, "live" | "ageMs" | "replies" | "mcapUsd" | "flags" | "txns" | "socials" | "graduated" | "symbol">,
  breakdown: ScoreBreak,
): string {
  const ageM = gem.ageMs / 60_000;
  const buyers = Math.max(gem.txns.m5.buyers, gem.txns.h1.buyers);
  if (gem.live && ageM < 90) {
    return `Live room on a ${Math.round(ageM)}m print — attention is leading cap.`;
  }
  if (gem.live) {
    return `Livestream is still on. Treat as attention flow, not a birth.`;
  }
  if (breakdown.freshness >= 17 && buyers >= 8) {
    return `First-hour ignition with ${buyers} unique buyers. Classic sniper tape.`;
  }
  if (breakdown.social >= 12 && gem.replies >= 20) {
    return `Room is talking (${gem.replies} replies). Narrative desk would keep this on the board.`;
  }
  if (gem.flags.includes("single-wallet")) {
    return `Clustered early size. Could be a bundle — insider desk says wait for a second wallet.`;
  }
  if (gem.flags.includes("one-sided-tape")) {
    return `Buys print, sells do not. Risk desk would pass until the tape is two-sided.`;
  }
  if (breakdown.flow >= 12 && ageM < 180) {
    return `Volume is ahead of age. Tape desk ping — confirm unique buyers before sizing.`;
  }
  if (gem.graduated && gem.mcapUsd < 400_000) {
    return `Off the curve, still small. Conviction desk looks for the room to follow.`;
  }
  if (!gem.socials.twitter && !gem.socials.telegram) {
    return `Silent launch. Only the sniper desk cares, and only with flow.`;
  }
  if (ageM < 20) {
    return `Fresh print. Most of these die — wait for a second burst of buyers.`;
  }
  return `On the tape, but no single desk is shouting. Keep it watched, not loved.`;
}

export function finalizeGem(base: GemInput): Gem {
  const { breakdown, flags } = scoreDimensions(base);
  const playbookScores = Object.fromEntries(
    PLAYBOOKS.map((p) => [p.id, Math.round(weightedScore(breakdown, p.weights))]),
  ) as Record<PlaybookId, number>;
  const score = Math.round(
    weightedScore(breakdown, {
      freshness: 1.45,
      size: 1,
      flow: 1.15,
      social: 0.9,
      quality: 1.1,
    }),
  );
  const next: Gem = { ...base, score, playbookScores, breakdown, flags, thesis: "" };
  next.thesis = thesisFor(next, breakdown);
  return next;
}

export function rankScore(gem: Gem, desk: PlaybookId | "all"): number {
  if (desk === "all") return gem.score;
  return gem.playbookScores[desk] ?? gem.score;
}
