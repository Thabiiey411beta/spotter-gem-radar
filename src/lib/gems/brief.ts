import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  name: z.string().max(80),
  symbol: z.string().max(24),
  mint: z.string().max(80),
  age: z.string().max(16),
  mcap: z.string().max(24),
  liquidity: z.string().max(24),
  score: z.number(),
  live: z.boolean(),
  replies: z.number(),
  thesis: z.string().max(240),
  flags: z.array(z.string()).max(8),
  socials: z.string().max(200),
  desk: z.string().max(24),
});

export const deskBrief = createServerFn({ method: "POST" })
  .validator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "Desk brief is offline in this environment." };

    const prompt = `You are the night desk at Spotter, a memecoin radar. Write a skeptical, specific brief for a trader. Not financial advice. No hype, no emojis, no promises of profit. Short sentences.

Token: ${data.name} (${data.symbol})
Mint: ${data.mint}
Age: ${data.age}
Market cap: ${data.mcap}
Liquidity: ${data.liquidity}
Spotter score: ${data.score}/100
Desk: ${data.desk}
Live stream: ${data.live ? "yes" : "no"}
Replies: ${data.replies}
Flags: ${data.flags.join(", ") || "none"}
Socials: ${data.socials || "none"}
Internal thesis: ${data.thesis}

Return three labeled sections only:
SETUP — what the tape actually shows
WHY IT MIGHT WORK — the honest bull case, one paragraph
WHY IT DIES — the honest kill case, one paragraph
Then one line: DESK CALL — Pass / Watch / Probe (tiny size), with a six-word reason.

Assume most new memecoins go to zero.`;

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 420,
        temperature: 0.4,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) return { ok: false as const, error: `Desk brief failed (${res.status}).` };
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = body.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) return { ok: false as const, error: "Empty brief." };
    return { ok: true as const, text };
  });
