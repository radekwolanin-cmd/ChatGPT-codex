import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginCard } from "@/components/auth/login-card";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/projects");
  }
  return (
    <div className="relative flex min-h-screen items-center justify-center px-6 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(76,93,255,0.2),_transparent_60%)]" />
      <div className="relative z-10 flex max-w-4xl flex-col items-center gap-8 text-center text-slate-100">
        <h1 className="text-4xl font-bold tracking-tight">Project Tracker</h1>
        <p className="max-w-xl text-lg text-slate-200/80">
          Stay ahead of deadlines, keep clients informed, and orchestrate vendors with a workspace built for small business
          project teams.
        </p>
        <LoginCard />
        <p className="text-xs text-slate-400">
          Need an account? Contact your workspace admin or email <Link href="mailto:support@projecttracker.local" className="text-brand-300">support@projecttracker.local</Link>.
        </p>
      </div>
    </div>
  );
}
