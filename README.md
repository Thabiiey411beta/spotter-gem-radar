# Spotter

Early memecoin radar. A live desk bot watches new Pump.fun prints and fresh Solana pools, then ranks them with playbooks distilled from how elite memecoin traders actually hunt.

Spotter is a research terminal. It does not auto-buy, it does not claim insider fills, and it is not financial advice. Most new memecoins go to zero.

## What it does

- **Bot scan** every ~30s: new Pump.fun coins, live rooms, recently traded prints, and new Solana pools.
- **Six desks**: Sniper, Narrative, Tape, Insider watch, Risk, Conviction. Each re-weights the same tape.
- **Desk brief**: on demand, a skeptical write-up of a single gem.
- **Watchlist**: saved on-device.

## Playbooks

The desks encode public craft, not anyone’s private wallet:

| Desk | School | Hunts |
| --- | --- | --- |
| Sniper | Launch-pad hunters | First two hours, real unique buyers |
| Narrative | Conviction / Murad school | Community, sayable meme, a room that talks |
| Tape | CT flow readers | Volume vs liquidity, live rooms, reply velocity |
| Insider watch | On-chain hunters | Clustered ignition vs organic discovery |
| Risk | Desks that survived | Two-sided tape, real liquidity, survivability |
| Conviction | Multi-day runners | Hours-to-days old, still small, room still growing |

## Stack

TanStack Start, React 19, Tailwind v4, TanStack Query. Market data from Pump.fun and GeckoTerminal public endpoints. Optional desk briefs via xAI.

## Run

```bash
npm install
npm run dev
```
