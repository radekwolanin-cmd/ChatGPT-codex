import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return (
    <div className="flex min-h-screen text-slate-50">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar user={{ name: user.name, email: user.email }} />
        <div className="flex-1 overflow-y-auto bg-slate-950/80 p-6">{children}</div>
      </div>
    </div>
  );
}
