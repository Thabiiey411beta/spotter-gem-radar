import { createFileRoute } from "@tanstack/react-router";
import { PlaybooksPage } from "@/components/playbooks/playbooks-page";

export const Route = createFileRoute("/playbooks")({
  component: PlaybooksPage,
});
