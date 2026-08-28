import type { PlaybookId } from "./types";

export type Playbook = {
  id: PlaybookId;
  name: string;
  desk: string;
  school: string;
  summary: string;
  hunts: string;
  weights: {
    freshness: number;
    size: number;
    flow: number;
    social: number;
    quality: number;
  };
  rules: string[];
  kill: string[];
};

export const PLAYBOOKS: Playbook[] = [
  {
    id: "sniper",
    name: "Sniper",
    desk: "First print",
    school: "Launch-pad hunters",
    summary:
      "Live in the first hour. The edge is speed plus a hard no — not every new ticker. Elite snipers wait for ignition (unique buyers, replies, a live room) before they size, then they are gone if the tape dies.",
    hunts: "Coins younger than two hours, still on the curve, with actual flow.",
    weights: { freshness: 2.3, size: 1.3, flow: 1.5, social: 0.7, quality: 0.8 },
    rules: [
      "Age under 2 hours, market cap still in the early band.",
      "More than a handful of unique buyers — one wallet is a bundle, not a launch.",
      "Replies or a livestream beating silence. Dead rooms do not reverse.",
      "Cut in minutes if volume and buyers stall. No thesis, no hold.",
    ],
    kill: [
      "Zero unique buyers after the first prints.",
      "Name is a copied ticker with no socials.",
      "Buy tape is 100% and size is huge — usually a wash or a trap.",
    ],
  },
  {
    id: "narrative",
    name: "Narrative",
    desk: "Culture",
    school: "Conviction desks (Murad school)",
    summary:
      "Memecoins that print wealth are cultural objects, not charts. This desk hunts names that can become a tribe: a clear joke, a live community, a story people retell. Size is smaller, hold is longer, and most tickers are ignored on purpose.",
    hunts: "Coins with socials, a readable meme, and a room that talks back.",
    weights: { freshness: 0.6, size: 1.0, flow: 1.0, social: 2.4, quality: 1.3 },
    rules: [
      "Ticker and name have to be sayable. If you cannot repeat it, neither can CT.",
      "Twitter / Telegram / a live stream is the product. Chart is the lagging print.",
      "Prefer fewer, better names. Overtrading is how this desk dies.",
      "Hold through noise only if the community is still adding people, not just price.",
    ],
    kill: [
      "Generic animal + number tickers with no voice.",
      "Paid raid energy, no organic replies.",
      "Dev doxxed-as-a-brand that has rugged the same story twice.",
    ],
  },
  {
    id: "tape",
    name: "Tape",
    desk: "Attention",
    school: "CT flow readers (Ansem school)",
    summary:
      "Price follows attention. This desk reads velocity: five-minute volume versus liquidity, buy/sell imbalance, livestream viewers, reply rate versus age. They refresh the board, they do not marry bags. When the room leaves, so do they.",
    hunts: "Unusual volume, live rooms, and reply velocity that is ahead of market cap.",
    weights: { freshness: 1.2, size: 1.1, flow: 2.2, social: 1.6, quality: 0.9 },
    rules: [
      "Volume / liquidity spikes are the ping. Confirm with unique buyers, not just dollars.",
      "Livestreams and reply velocity are leading. Market cap is lagging.",
      "Ride the attention, do not argue with it. Fade when the tape goes quiet.",
      "Never size a silent chart because a call channel screamed.",
    ],
    kill: [
      "Volume with no buyers — bots printing a fake tape.",
      "Attention already migrated (old coin, leftover chat).",
      "You are late to a 20x and calling it early.",
    ],
  },
  {
    id: "insider",
    name: "Insider watch",
    desk: "Wallets",
    school: "On-chain hunters",
    summary:
      "Real insiders do not announce. This desk does not claim private information — it scores public tells that wallet hunters actually use: clustered early size, a creator who keeps shipping socials, ignition that is too clean, or a live room that appeared with the first buys. Treat every hit as a hypothesis, never a leak.",
    hunts: "Fast ignition with more than one buyer, fresh socials, or a suspiciously tidy launch.",
    weights: { freshness: 1.6, size: 1.2, flow: 1.8, social: 1.3, quality: 1.1 },
    rules: [
      "Many unique buyers in the first minutes is discovery. One buyer is a bundle.",
      "Socials going live with the first prints is a tell. Socials with zero flow is decoration.",
      "Creator wallet reuse is the real insider signal — we flag clustered tape as a proxy.",
      "If it looks too clean and the name is generic, assume a farm, not a gift.",
    ],
    kill: [
      "Single-wallet launches with polished sites.",
      "Same meta as yesterday’s rug, new ticker.",
      "You convincing yourself that a bundle is ‘smart money’.",
    ],
  },
  {
    id: "risk",
    name: "Risk",
    desk: "Survival",
    school: "Desks that are still alive",
    summary:
      "The best traders are the ones who did not blow up. This desk inverts the usual gem hunt: penalize thin liquidity, one-sided tapes, brand-new silent coins, and anything that already ran. You will miss rockets. You will also still have a bankroll next month.",
    hunts: "Tradeable liquidity, two-sided flow, and coins that have survived the first hour.",
    weights: { freshness: 0.5, size: 1.1, flow: 1.2, social: 0.9, quality: 2.6 },
    rules: [
      "Liquidity has to be real enough to exit. If you cannot sell, the entry is a vanity fill.",
      "Two-sided tape. All-buy prints are usually wash or a trap.",
      "Wait out the first minutes. Most rugs do their work immediately.",
      "Hard cap size. Memecoins are lottery tickets with a bid, not a salary.",
    ],
    kill: [
      "Sub-min liquidity on a graduated pair.",
      "Honeypot-shaped tape: buys print, sells do not.",
      "Already-ran caps dressed up as ‘early’.",
    ],
  },
  {
    id: "conviction",
    name: "Conviction",
    desk: "Stayers",
    school: "Multi-day runners",
    summary:
      "Not every winner is a five-minute snipe. Some names grind from a small cap into a multi-day run because the room keeps growing. This desk wants age with staying power: sustained volume, socials that are not abandoned, a market cap that is still early in the grand scheme — and the discipline to ignore the rest.",
    hunts: "Hours to a few days old, still sub-mid-cap, with persistent flow and a community.",
    weights: { freshness: 0.7, size: 1.4, flow: 1.4, social: 1.7, quality: 1.8 },
    rules: [
      "Survived more than a few hours. Intraday rugs have already happened.",
      "Volume is still printing, not a one-candle ghost.",
      "Community metrics (replies, live, socials) are up, not leftover.",
      "Add on strength of the room, not on a green candle you missed.",
    ],
    kill: [
      "Dead volume after the first spike.",
      "Market cap already implying the end of the story.",
      "You holding because you are down, not because the desk still likes it.",
    ],
  },
];

export const PLAYBOOK_BY_ID: Record<PlaybookId, Playbook> = Object.fromEntries(
  PLAYBOOKS.map((p) => [p.id, p]),
) as Record<PlaybookId, Playbook>;

export const FLAG_LABEL: Record<
  import("./types").RiskFlag,
  { label: string; tone: "warn" | "danger" }
> = {
  "no-socials": { label: "No socials", tone: "warn" },
  "one-sided-tape": { label: "One-sided tape", tone: "danger" },
  "thin-liquidity": { label: "Thin liquidity", tone: "danger" },
  "too-new": { label: "Too new to read", tone: "warn" },
  "already-ran": { label: "Already ran", tone: "warn" },
  "single-wallet": { label: "Single-wallet flow", tone: "danger" },
  "no-activity": { label: "No activity", tone: "warn" },
};
