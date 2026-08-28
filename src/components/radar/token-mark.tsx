import { cn } from "@/lib/utils";

export function TokenMark({
  symbol,
  size = "md",
}: {
  src?: string;
  symbol: string;
  size?: "sm" | "md" | "lg";
}) {
  const dim = size === "lg" ? "size-14" : size === "sm" ? "size-8" : "size-10";
  const letter = (symbol || "?").slice(0, 1).toUpperCase();

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-md border border-border bg-surface-2 font-mono text-signal",
        dim,
        size === "lg" ? "text-xl" : "text-sm",
      )}
    >
      {letter}
    </span>
  );
}
