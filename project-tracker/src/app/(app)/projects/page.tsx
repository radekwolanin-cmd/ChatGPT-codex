import Link from "next/link";
import { redirect } from "next/navigation";
import type { ProjectPriority, ProjectStatus } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { listProjects } from "@/server/services/project-service";
import { ProjectListSection } from "@/components/projects/project-list-section";
import { ProjectBoard } from "@/components/projects/project-board";
import { Card } from "@/components/ui/card";

type ProjectsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const params = (await searchParams) ?? {};

  const view = (typeof params.view === "string" ? params.view : "list") as "list" | "board";
  const q = typeof params.q === "string" ? params.q : undefined;

  const statusParam = typeof params.status === "string" ? params.status : undefined;
  const statusValues: ProjectStatus[] = ["TO_DO", "IN_PROGRESS", "DONE"];
  const status = statusValues.includes(statusParam as ProjectStatus) ? (statusParam as ProjectStatus) : undefined;

  const priorityParam = typeof params.priority === "string" ? params.priority : undefined;
  const priorityValues: ProjectPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
  const priority = priorityValues.includes(priorityParam as ProjectPriority)
    ? (priorityParam as ProjectPriority)
    : undefined;

  const data = await listProjects(user.id, {
    search: q,
    status,
    priority,
    limit: 50,
  });

  const grouped = data.grouped;
  const totalProjects = Object.values(grouped).reduce<number>((acc, items) => acc + items.length, 0);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Projects</h1>
          <p className="text-sm text-slate-400">Monitor deadlines, drag to update status, and keep customers informed.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={{ pathname: "/projects", query: { ...params, view: view === "list" ? "board" : "list" } }}
            className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
          >
            Switch to {view === "list" ? "Board" : "List"} view
          </Link>
          <Link
            href="/projects/new"
            className="rounded-full bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-card hover:bg-brand-400"
          >
            New project
          </Link>
        </div>
      </header>

      <Card className="flex flex-wrap gap-3 text-xs text-slate-300">
        <span className="rounded-full bg-white/10 px-3 py-1">Total: {totalProjects}</span>
        {q && <span className="rounded-full bg-white/5 px-3 py-1">Search: {q}</span>}
        {status && <span className="rounded-full bg-white/5 px-3 py-1">Status: {status.replace("_", " ")}</span>}
        {priority && <span className="rounded-full bg-white/5 px-3 py-1">Priority: {priority}</span>}
      </Card>

      {view === "board" ? (
        <ProjectBoard projects={grouped} />
      ) : (
        <div className="space-y-6">
          <ProjectListSection title="To Do" projects={grouped.TO_DO} />
          <ProjectListSection title="In Progress" projects={grouped.IN_PROGRESS} />
          <ProjectListSection title="Done" projects={grouped.DONE} />
        </div>
      )}
    </div>
  );
}
