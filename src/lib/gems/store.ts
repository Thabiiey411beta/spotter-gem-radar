import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Gem } from "./types";

export type WatchItem = {
  id: string;
  mint: string;
  symbol: string;
  name: string;
  chain: string;
  addedAt: number;
};

type WatchState = {
  items: WatchItem[];
  hydrated: boolean;
  setHydrated: () => void;
  toggle: (gem: Pick<Gem, "id" | "mint" | "symbol" | "name" | "chain">) => void;
  has: (id: string) => boolean;
  remove: (id: string) => void;
};

export const useWatchlist = create<WatchState>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      has: (id) => get().items.some((i) => i.id === id),
      toggle: (gem) =>
        set((state) => {
          const exists = state.items.some((i) => i.id === gem.id);
          if (exists) return { items: state.items.filter((i) => i.id !== gem.id) };
          const next: WatchItem = {
            id: gem.id,
            mint: gem.mint,
            symbol: gem.symbol,
            name: gem.name,
            chain: gem.chain,
            addedAt: Date.now(),
          };
          return { items: [next, ...state.items].slice(0, 80) };
        }),
      remove: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
    }),
    {
      name: "spotter-watchlist",
      partialize: (s) => ({ items: s.items }),
      onRehydrateStorage: () => () => {
        useWatchlist.getState().setHydrated();
      },
    },
  ),
);
