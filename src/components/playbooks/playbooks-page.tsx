import { Link } from "@tanstack/react-router";
import { PLAYBOOKS } from "@/lib/gems/playbooks";
import { Button } from "@/components/ui/button";

export function PlaybooksPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal">
          How the desks think
        </p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
          Playbooks from traders who actually lasted.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">
          Spotter does not copy anyone’s private wallet. It encodes the public
          craft: first-print snipers, Murad-style cultural conviction, CT tape
          readers, on-chain cluster hunters, and the risk desks that are still
          standing. Each playbook re-weights the same tape. Switch desks on the
          radar to see the board change.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {PLAYBOOKS.map((p) => (
          <article
            key={p.id}
            className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5"
          >
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
                {p.desk} · {p.school}
              </p>
              <h2 className="mt-1 text-xl font-medium tracking-tight">{p.name}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.summary}</p>
            </div>
            <p className="text-sm text-fg">
              <span className="font-medium">Hunts: </span>
              <span className="text-muted">{p.hunts}</span>
            </p>
            <div>
              <h3 className="font-mono text-[11px] uppercase tracking-wider text-muted">
                Rules
              </h3>
              <ul className="mt-2 grid gap-1.5 text-sm text-muted">
                {p.rules.map((r) => (
                  <li key={r} className="border-l border-border pl-3">
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-mono text-[11px] uppercase tracking-wider text-muted">
                Kill the trade
              </h3>
              <ul className="mt-2 grid gap-1.5 text-sm text-muted">
                {p.kill.map((r) => (
                  <li key={r} className="border-l border-danger/40 pl-3">
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Button asChild variant="secondary" size="sm">
                <Link to="/" search={{ desk: p.id }}>
                  Rank the tape with {p.name}
                </Link>
              </Button>
            </div>
          </article>
        ))}
      </div>

      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="text-lg font-medium tracking-tight">What the bot actually does</h2>
        <ol className="mt-3 grid gap-2 text-sm leading-relaxed text-muted">
          <li>1. Pulls brand-new Pump.fun coins, live rooms, and recently traded prints.</li>
          <li>2. Adds fresh Solana pools so graduated / Raydium-style tape is not invisible.</li>
          <li>3. Scores freshness, size band, flow, social velocity, and survivability.</li>
          <li>4. Re-ranks that same object through six desks so you can see disagreement.</li>
          <li>5. On request, writes a skeptical desk brief. It will tell you to pass often.</li>
        </ol>
        <p className="mt-4 text-sm text-faint">
          There is no private mempool, no guaranteed insider wallet list, and no
          auto-buy. If a product promises those, it is selling you something else.
        </p>
      </section>
    </div>
  );
}
