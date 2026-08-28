import { createServerFn } from "@tanstack/react-start";
import { finalizeGem } from "./score";
import type { ChainId, FlowWindow, Gem, ScanResult } from "./types";

const ZERO_FLOW: FlowWindow = { buys: 0, sells: 0, buyers: 0, sellers: 0 };

type Cache = { at: number; result: ScanResult };
let cache: Cache | null = null;
const TTL_MS = 22_000;

type GemBase = Omit<Gem, "score" | "playbookScores" | "breakdown" | "flags" | "thesis">;

type PumpCoin = {
  mint?: string;
  name?: string;
  symbol?: string;
  description?: string;
  image_uri?: string;
  twitter?: string | null;
  telegram?: string | null;
  website?: string | null;
  creator?: string;
  created_timestamp?: number;
  complete?: boolean;
  nsfw?: boolean;
  is_banned?: boolean;
  reply_count?: number;
  is_currently_live?: boolean;
  usd_market_cap?: number;
  market_cap_usd?: number;
  real_sol_reserves?: number;
  username?: string;
  boost_mode?: string;
  pool_address?: string;
  num_participants?: number;
  livestream_title?: string;
  thumbnail?: string;
};

type GtPool = {
  id: string;
  attributes?: {
    address?: string;
    name?: string;
    pool_created_at?: string;
    fdv_usd?: string | null;
    market_cap_usd?: string | null;
    reserve_in_usd?: string;
    base_token_price_usd?: string;
    price_change_percentage?: Record<string, string>;
    transactions?: Record<string, { buys?: number; sells?: number; buyers?: number; sellers?: number }>;
    volume_usd?: Record<string, string>;
  };
  relationships?: {
    base_token?: { data?: { id?: string } };
    dex?: { data?: { id?: string } };
  };
};

type GtToken = {
  id: string;
  type: string;
  attributes?: {
    address?: string;
    name?: string;
    symbol?: string;
    image_url?: string | null;
  };
};

function asList<T>(json: unknown): T[] {
  if (Array.isArray(json)) return json as T[];
  if (json && typeof json === "object") {
    const o = json as Record<string, unknown>;
    for (const key of ["coins", "data", "items"]) {
      if (Array.isArray(o[key])) return o[key] as T[];
    }
  }
  return [];
}

async function fetchJson(url: string, timeout = 8000): Promise<unknown | null> {
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "SpotterRadar/1.0",
      },
      signal: AbortSignal.timeout(timeout),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function createdMs(ts?: number): number {
  if (!ts || !Number.isFinite(ts)) return Date.now();
  const ms = ts < 1e12 ? ts * 1000 : ts;
  if (ms > Date.now() + 60_000) return Date.now();
  return ms;
}

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function cleanUrl(v?: string | null): string | undefined {
  if (!v) return undefined;
  const t = v.trim();
  if (!t || t === "null") return undefined;
  if (/^https?:\/\//i.test(t)) return t;
  if (t.startsWith("t.me/") || t.startsWith("@")) {
    return `https://t.me/${t.replace(/^@/, "").replace(/^t\.me\//, "")}`;
  }
  if (/^(x|twitter)\.com\//i.test(t)) return `https://${t}`;
  return t.startsWith("http") ? t : undefined;
}

function isBlockedName(name: string, symbol: string): boolean {
  const t = `${name} ${symbol}`.toLowerCase();
  return /\b(nigg(?:a|er|ers)?|faggot|kike|spic|tranny)\b/i.test(t);
}

function blankGem(): GemBase {
  return {
    id: "",
    mint: "",
    chain: "solana",
    name: "",
    symbol: "",
    source: "pump",
    createdAt: 0,
    ageMs: 0,
    mcapUsd: 0,
    liquidityUsd: 0,
    volume: { m5: 0, h1: 0, h24: 0 },
    txns: { m5: { ...ZERO_FLOW }, h1: { ...ZERO_FLOW } },
    priceChange: { m5: 0, h1: 0, h24: 0 },
    socials: {},
    replies: 0,
    live: false,
    graduated: false,
    links: {},
  };
}

function fromPump(coin: PumpCoin): Gem | null {
  if (!coin.mint || coin.nsfw || coin.is_banned) return null;
  const name = (coin.name || "").trim();
  const symbol = (coin.symbol || "").trim();
  if (!name || !symbol) return null;
  if (isBlockedName(name, symbol)) return null;
  const createdAt = createdMs(coin.created_timestamp);
  const ageMs = Math.max(0, Date.now() - createdAt);
  const mcap = num(coin.usd_market_cap) || num(coin.market_cap_usd);
  const sol = num(coin.real_sol_reserves) / 1e9;
  const liq = sol > 0 ? sol * 150 : Math.max(mcap * 0.12, 40);
  const mint = coin.mint;
  const viewers = num(coin.num_participants);
  const replies = num(coin.reply_count);
  const live = Boolean(coin.is_currently_live);
  return finalizeGem({
    ...blankGem(),
    id: `solana:${mint}`,
    mint,
    pairAddress: coin.pool_address,
    chain: "solana",
    name,
    symbol,
    imageUrl: coin.image_uri || coin.thumbnail || undefined,
    source: "pump",
    dex: coin.complete ? "pumpswap" : "pump.fun",
    createdAt,
    ageMs,
    mcapUsd: mcap,
    liquidityUsd: liq,
    socials: {
      twitter: cleanUrl(coin.twitter),
      telegram: cleanUrl(coin.telegram),
      website: cleanUrl(coin.website),
    },
    replies,
    live,
    liveViewers: viewers || undefined,
    liveTitle: coin.livestream_title || undefined,
    graduated: Boolean(coin.complete),
    creator: coin.creator,
    username: coin.username,
    boost: coin.boost_mode,
    volume: {
      m5: live ? Math.max(mcap * 0.04, 80) : Math.min(mcap * 0.02, 400),
      h1: Math.min(mcap * 0.08, 12_000),
      h24: Math.min(mcap * 0.2, 40_000),
    },
    txns: {
      m5: {
        buys: live ? 8 : 2,
        sells: 1,
        buyers: live ? Math.max(4, Math.min(viewers, 20)) : 2,
        sellers: 1,
      },
      h1: {
        buys: Math.min(40, Math.max(2, Math.round(replies / 4) + (live ? 10 : 2))),
        sells: Math.min(20, Math.max(0, Math.round(replies / 10))),
        buyers: Math.min(80, Math.max(1, Math.round(replies / 3) + (live ? 8 : 1))),
        sellers: Math.min(40, Math.max(0, Math.round(replies / 8))),
      },
    },
    links: {
      pump: `https://pump.fun/coin/${mint}`,
      dex: `https://dexscreener.com/solana/${mint}`,
      explorer: `https://solscan.io/token/${mint}`,
    },
  });
}

function chainFromGtId(id: string): ChainId {
  if (id.startsWith("base_")) return "base";
  if (id.startsWith("bsc_") || id.startsWith("bsc-")) return "bsc";
  if (id.startsWith("eth_")) return "ethereum";
  return "solana";
}

function flowFrom(tx?: { buys?: number; sells?: number; buyers?: number; sellers?: number }): FlowWindow {
  if (!tx) return { ...ZERO_FLOW };
  return {
    buys: num(tx.buys),
    sells: num(tx.sells),
    buyers: num(tx.buyers),
    sellers: num(tx.sellers),
  };
}

function fromPool(pool: GtPool, tokens: Map<string, GtToken>): Gem | null {
  const attr = pool.attributes;
  if (!attr?.address) return null;
  const tokenId = pool.relationships?.base_token?.data?.id ?? "";
  const token = tokens.get(tokenId);
  const mint = token?.attributes?.address || tokenId.split("_").slice(1).join("_");
  if (!mint) return null;
  const chain = chainFromGtId(pool.id);
  const createdAt = attr.pool_created_at ? Date.parse(attr.pool_created_at) : Date.now();
  const ageMs = Math.max(0, Date.now() - (Number.isFinite(createdAt) ? createdAt : Date.now()));
  const nameRaw = token?.attributes?.name || attr.name?.split("/")[0]?.trim() || "Unknown";
  const symbol = token?.attributes?.symbol || nameRaw.slice(0, 8);
  if (isBlockedName(nameRaw, symbol)) return null;
  const mcap = num(attr.market_cap_usd) || num(attr.fdv_usd);
  const vol = attr.volume_usd ?? {};
  const chg = attr.price_change_percentage ?? {};
  const tx = attr.transactions ?? {};
  const dex = pool.relationships?.dex?.data?.id;
  if (dex === "pump-fun") return null;
  return finalizeGem({
    ...blankGem(),
    id: `${chain}:${mint}`,
    mint,
    pairAddress: attr.address,
    chain,
    name: nameRaw,
    symbol,
    imageUrl: token?.attributes?.image_url || undefined,
    source: "pool",
    dex,
    createdAt: Number.isFinite(createdAt) ? createdAt : Date.now(),
    ageMs,
    priceUsd: num(attr.base_token_price_usd) || undefined,
    mcapUsd: mcap,
    liquidityUsd: num(attr.reserve_in_usd),
    volume: { m5: num(vol.m5), h1: num(vol.h1), h24: num(vol.h24) },
    txns: { m5: flowFrom(tx.m5), h1: flowFrom(tx.h1) },
    priceChange: { m5: num(chg.m5), h1: num(chg.h1), h24: num(chg.h24) },
    graduated: dex !== "pump-fun",
    links: {
      dex: `https://dexscreener.com/${chain}/${attr.address}`,
      explorer:
        chain === "solana"
          ? `https://solscan.io/token/${mint}`
          : `https://basescan.org/token/${mint}`,
    },
  });
}

function mergeGem(a: Gem, b: Gem): Gem {
  const richer = a.source === "pump" ? a : b.source === "pump" ? b : a.mcapUsd >= b.mcapUsd ? a : b;
  const other = richer === a ? b : a;
  return finalizeGem({
    ...richer,
    imageUrl: richer.imageUrl || other.imageUrl,
    pairAddress: richer.pairAddress || other.pairAddress,
    liquidityUsd: Math.max(richer.liquidityUsd, other.liquidityUsd),
    volume: {
      m5: Math.max(richer.volume.m5, other.volume.m5),
      h1: Math.max(richer.volume.h1, other.volume.h1),
      h24: Math.max(richer.volume.h24, other.volume.h24),
    },
    txns: {
      m5: {
        buys: Math.max(richer.txns.m5.buys, other.txns.m5.buys),
        sells: Math.max(richer.txns.m5.sells, other.txns.m5.sells),
        buyers: Math.max(richer.txns.m5.buyers, other.txns.m5.buyers),
        sellers: Math.max(richer.txns.m5.sellers, other.txns.m5.sellers),
      },
      h1: {
        buys: Math.max(richer.txns.h1.buys, other.txns.h1.buys),
        sells: Math.max(richer.txns.h1.sells, other.txns.h1.sells),
        buyers: Math.max(richer.txns.h1.buyers, other.txns.h1.buyers),
        sellers: Math.max(richer.txns.h1.sellers, other.txns.h1.sellers),
      },
    },
    priceChange: {
      m5: richer.priceChange.m5 || other.priceChange.m5,
      h1: richer.priceChange.h1 || other.priceChange.h1,
      h24: richer.priceChange.h24 || other.priceChange.h24,
    },
    socials: {
      twitter: richer.socials.twitter || other.socials.twitter,
      telegram: richer.socials.telegram || other.socials.telegram,
      website: richer.socials.website || other.socials.website,
    },
    replies: Math.max(richer.replies, other.replies),
    live: richer.live || other.live,
    liveViewers: richer.liveViewers || other.liveViewers,
    liveTitle: richer.liveTitle || other.liveTitle,
    priceUsd: richer.priceUsd || other.priceUsd,
    links: { ...other.links, ...richer.links },
  });
}

async function runScan(): Promise<ScanResult> {
  const warnings: string[] = [];
  const sources: string[] = [];

  const [pumpNew, pumpTrade, pumpLive, gtSol] = await Promise.all([
    fetchJson(
      "https://frontend-api-v3.pump.fun/coins?offset=0&limit=48&sort=created_timestamp&order=DESC&includeNsfw=false",
    ),
    fetchJson(
      "https://frontend-api-v3.pump.fun/coins?offset=0&limit=36&sort=last_trade_timestamp&order=DESC&includeNsfw=false",
    ),
    fetchJson("https://frontend-api-v3.pump.fun/coins/currently-live?offset=0&limit=24&includeNsfw=false"),
    fetchJson(
      "https://api.geckoterminal.com/api/v2/networks/solana/new_pools?page=1&include=base_token",
    ),
  ]);

  const map = new Map<string, Gem>();
  const ingest = (gem: Gem | null) => {
    if (!gem) return;
    const ageH = gem.ageMs / 3_600_000;
    if (ageH > 48) return;
    if (gem.mcapUsd > 2_000_000 && ageH > 8) return;
    const prev = map.get(gem.id);
    map.set(gem.id, prev ? mergeGem(prev, gem) : gem);
  };

  const pumpLists = [
    { label: "pump-new", json: pumpNew, maxAgeH: 24 },
    { label: "pump-trade", json: pumpTrade, maxAgeH: 12 },
    { label: "pump-live", json: pumpLive, maxAgeH: 36 },
  ];
  for (const src of pumpLists) {
    const list = asList<PumpCoin>(src.json);
    if (!src.json) warnings.push(`${src.label} unreachable`);
    else if (list.length) sources.push(src.label);
    for (const coin of list) {
      const gem = fromPump(coin);
      if (!gem) continue;
      if (gem.ageMs / 3_600_000 > src.maxAgeH) continue;
      ingest(gem);
    }
  }

  if (gtSol && typeof gtSol === "object") {
    const body = gtSol as { data?: GtPool[]; included?: GtToken[] };
    const tokens = new Map<string, GtToken>();
    for (const t of body.included ?? []) tokens.set(t.id, t);
    const pools = body.data ?? [];
    if (pools.length) sources.push("geckoterminal-sol");
    for (const pool of pools) ingest(fromPool(pool, tokens));
  } else {
    warnings.push("pool tape delayed");
  }

  const gems = [...map.values()]
    .filter((g) => g.symbol && g.name)
    .sort((a, b) => b.score - a.score);

  const seen = new Set<string>();
  const deduped: Gem[] = [];
  for (const gem of gems) {
    const key = gem.symbol.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(gem);
  }

  return {
    gems: deduped,
    meta: {
      scannedAt: Date.now(),
      counts: {
        total: deduped.length,
        pump: deduped.filter((g) => g.source === "pump").length,
        pool: deduped.filter((g) => g.source === "pool").length,
        live: deduped.filter((g) => g.live).length,
        hot: deduped.filter((g) => g.score >= 62).length,
      },
      sources,
      warnings,
    },
  };
}

export const scanGems = createServerFn({ method: "GET" }).handler(async () => {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.result;
  try {
    const result = await runScan();
    cache = { at: Date.now(), result };
    return result;
  } catch (err) {
    if (cache) return cache.result;
    const message = err instanceof Error ? err.message : "scan failed";
    return {
      gems: [],
      meta: {
        scannedAt: Date.now(),
        counts: { total: 0, pump: 0, pool: 0, live: 0, hot: 0 },
        sources: [],
        warnings: [message],
      },
    };
  }
});
