"use client";

import { useState } from "react";
import type { ProjectListEntry } from "@/types/project";
import { ProjectRow } from "@/components/projects/project-row";

interface ListSectionProps {
  title: string;
  projects: ProjectListEntry[];
}

export function ProjectListSection({ title, projects }: ListSectionProps) {
  const [open, setOpen] = useState(true);
  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white shadow-card dark:border-white/10 dark:bg-white/5">
      <header
        className="flex cursor-pointer items-center justify-between px-5 py-4"
        onClick={() => setOpen((o) => !o)}
      >
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
          {title} <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">{projects.length} projects</span>
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">{open ? "Hide" : "Show"}</span>
      </header>
      {open ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left dark:divide-white/5">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <th className="px-5 py-3">Project</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Priority</th>
                <th className="px-5 py-3">Deadline</th>
                <th className="px-5 py-3">Tags</th>
                <th className="px-5 py-3">Activity</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <ProjectRow key={project.id} project={project} />
              ))}
              {!projects.length && (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                    No projects in this status yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
