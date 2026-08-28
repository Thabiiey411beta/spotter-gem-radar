import { createFileRoute } from "@tanstack/react-router";
import { RadarPage } from "@/components/radar/radar-page";
import type { PlaybookId } from "@/lib/gems/types";
import { PLAYBOOK_BY_ID } from "@/lib/gems/playbooks";

type DeskSearch = { desk?: PlaybookId | "all" };

function parseDesk(value: unknown): PlaybookId | "all" {
  if (value === "all" || (typeof value === "string" && value in PLAYBOOK_BY_ID)) {
    return value as PlaybookId | "all";
  }
  return "all";
}

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): DeskSearch => {
    if (search.desk === undefined || search.desk === "all") return {};
    return { desk: parseDesk(search.desk) };
  },
  component: Home,
});

function Home() {
  const desk = parseDesk(Route.useSearch().desk);
  const navigate = Route.useNavigate();
  return (
    <RadarPage
      desk={desk}
      onDesk={(next) =>
        navigate({
          search: next === "all" ? {} : { desk: next },
        })
      }
    />
  );
}
