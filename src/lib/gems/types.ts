export type ChainId = "solana" | "base" | "bsc" | "ethereum";

export type GemSource = "pump" | "pool";

export type PlaybookId =
  | "sniper"
  | "narrative"
  | "tape"
  | "insider"
  | "risk"
  | "conviction";

export type RiskFlag =
  | "no-socials"
  | "one-sided-tape"
  | "thin-liquidity"
  | "too-new"
  | "already-ran"
  | "single-wallet"
  | "no-activity";

export type ScoreBreak = {
  freshness: number;
  size: number;
  flow: number;
  social: number;
  quality: number;
};

export type FlowWindow = {
  buys: number;
  sells: number;
  buyers: number;
  sellers: number;
};

export type Gem = {
  id: string;
  mint: string;
  pairAddress?: string;
  chain: ChainId;
  name: string;
  symbol: string;
  imageUrl?: string;
  source: GemSource;
  dex?: string;
  createdAt: number;
  ageMs: number;
  priceUsd?: number;
  mcapUsd: number;
  liquidityUsd: number;
  volume: { m5: number; h1: number; h24: number };
  txns: { m5: FlowWindow; h1: FlowWindow };
  priceChange: { m5: number; h1: number; h24: number };
  socials: { twitter?: string; telegram?: string; website?: string };
  replies: number;
  live: boolean;
  liveViewers?: number;
  liveTitle?: string;
  graduated: boolean;
  creator?: string;
  username?: string;
  boost?: string;
  score: number;
  playbookScores: Record<PlaybookId, number>;
  breakdown: ScoreBreak;
  flags: RiskFlag[];
  thesis: string;
  links: { pump?: string; dex?: string; explorer?: string };
};

export type ScanMeta = {
  scannedAt: number;
  counts: {
    total: number;
    pump: number;
    pool: number;
    live: number;
    hot: number;
  };
  sources: string[];
  warnings: string[];
};

export type ScanResult = {
  gems: Gem[];
  meta: ScanMeta;
};
