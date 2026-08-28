import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Bookmark, Radar, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Radar", icon: Radar },
  { to: "/playbooks", label: "Playbooks", icon: ScrollText },
  { to: "/watchlist", label: "Watchlist", icon: Bookmark },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="relative grid size-8 place-items-center overflow-hidden rounded-md border border-border bg-surface">
              <span className="radar-disc absolute inset-1 rounded-full" />
              <span className="radar-sweep absolute inset-1 rounded-full" />
            </span>
            <span className="leading-none">
              <span className="block font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-muted">
                Night desk
              </span>
              <span className="block font-medium tracking-tight">Spotter</span>
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV.map((item) => {
              const active =
                item.to === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "inline-flex h-11 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors duration-150",
                    active ? "bg-surface-2 text-fg" : "text-muted hover:text-fg",
                  )}
                >
                  <Icon className="size-4" strokeWidth={1.75} />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6">{children}</div>
    </div>
  );
}
