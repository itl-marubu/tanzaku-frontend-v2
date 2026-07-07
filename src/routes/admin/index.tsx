import { AdminDashboard } from "@/features/admin/AdminDashboard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});
