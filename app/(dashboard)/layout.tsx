import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { DashboardShell } from "@/components/layout/dashboard-shell";

// Server Component: every route under the (dashboard) group is gated here.
// Visiting e.g. /dashboard or /pos directly without a valid session cookie
// redirects to /login before any page code runs — this is real route
// protection, not just hiding nav links on the client.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return <DashboardShell>{children}</DashboardShell>;
}
