import { createFileRoute } from "@tanstack/react-router";
import Sangam from "@/components/Sangam";

export const Route = createFileRoute("/sangam")({
  component: Sangam,
});
