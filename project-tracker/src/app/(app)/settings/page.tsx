import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="text-sm text-slate-400">Workspace preferences and integrations.</p>
      </header>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card text-sm text-slate-200">
        <p>Settings management is coming soon. Configure authentication providers, cron schedules, and feature flags here.</p>
      </div>
    </div>
  );
}
