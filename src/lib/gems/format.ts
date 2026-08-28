const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatUsd(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "—";
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (abs >= 10_000) return `$${(value / 1_000).toFixed(1)}k`;
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(2)}k`;
  if (abs >= 1) return USD.format(value);
  if (abs >= 0.0001) return `$${value.toPrecision(3)}`;
  return `$${value.toExponential(1)}`;
}

export function formatAge(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) ms = 0;
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

export function formatPct(value: number): string {
  if (!Number.isFinite(value) || value === 0) return "0%";
  const abs = Math.abs(value);
  const digits = abs >= 100 ? 0 : abs >= 10 ? 1 : 1;
  const n = value.toFixed(digits);
  return `${value > 0 ? "+" : ""}${n}%`;
}

export function formatScore(value: number): string {
  return Math.round(value).toString().padStart(2, "0");
}

export function shortAddr(value: string, size = 4): string {
  if (!value) return "—";
  if (value.length <= size * 2 + 1) return value;
  return `${value.slice(0, size)}…${value.slice(-size)}`;
}

export function chainLabel(chain: string): string {
  if (chain === "solana") return "Sol";
  if (chain === "base") return "Base";
  if (chain === "bsc") return "BSC";
  if (chain === "ethereum") return "ETH";
  return chain;
}
