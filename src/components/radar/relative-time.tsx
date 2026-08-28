import { useEffect, useState } from "react";
import { formatAge } from "@/lib/gems/format";

export function RelativeTime({ at }: { at: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return <span className="tabular-nums">{formatAge(Math.max(0, now - at))} ago</span>;
}
