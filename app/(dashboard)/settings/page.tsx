import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { SettingsView } from "@/components/settings/settings-view";

// Belt-and-suspenders: Settings is already hidden from the Cashier's sidebar
// (see components/layout/nav-items + sidebar.tsx), but a Cashier could still
// type the URL directly, so it's enforced again here server-side.
export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/dashboard");

  return <SettingsView />;
}
