"use client";

import { useState, useTransition } from "react";
import type { ProjectPriority, ProjectStatus } from "@prisma/client";
import type { ProjectListEntry } from "@/types/project";
import { StatusBadge } from "@/components/ui/status-pill";
import { PriorityBadge } from "@/components/ui/priority-pill";
import { TagInput } from "@/components/ui/tag-input";
import { format } from "date-fns";

interface ProjectRowProps {
  project: ProjectListEntry;
}

async function patchProject(id: string, data: Record<string, unknown>) {
  await fetch(`/api/projects/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

const statuses = ["TO_DO", "IN_PROGRESS", "DONE"] satisfies ProjectStatus[];
const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] satisfies ProjectPriority[];

export function ProjectRow({ project }: ProjectRowProps) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [priority, setPriority] = useState<ProjectPriority>(project.priority);
  const [tags, setTags] = useState<string[]>(project.tags.map((t) => t.tag));

  const deadline = project.deadline ? new Date(project.deadline) : null;
  const overdue = deadline && deadline < new Date();

  return (
    <tr className="border-b border-slate-200/60 text-sm text-slate-800 dark:border-white/5 dark:text-slate-100">
      <td className="py-4">
        <div className="font-medium text-slate-900 dark:text-white">{project.name}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400">{project.customer?.name ?? "No customer"}</div>
      </td>
      <td className="py-4">
        <select
          value={status}
          disabled={pending}
          onChange={(event) => {
            const next = event.target.value as ProjectStatus;
            setStatus(next);
            startTransition(() => patchProject(project.id, { status: next }));
          }}
          className="rounded-lg border border-slate-200/70 bg-white px-2 py-1 text-xs text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-white"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
        <div className="mt-2">
          <StatusBadge status={status} />
        </div>
      </td>
      <td className="py-4">
        <select
          value={priority}
          disabled={pending}
          onChange={(event) => {
            const next = event.target.value as ProjectPriority;
            setPriority(next);
            startTransition(() => patchProject(project.id, { priority: next }));
          }}
          className="rounded-lg border border-slate-200/70 bg-white px-2 py-1 text-xs text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-white"
        >
          {priorities.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <div className="mt-2">
          <PriorityBadge priority={priority} />
        </div>
      </td>
      <td className="py-4">
        {deadline ? (
          <div className={`text-xs ${overdue ? "text-rose-500 dark:text-rose-300" : "text-slate-500 dark:text-slate-300"}`}>
            {format(deadline, "MMM d, yyyy")}
          </div>
        ) : (
          <div className="text-xs text-slate-500 dark:text-slate-400">No deadline</div>
        )}
      </td>
      <td className="py-4">
        <TagInput
          value={tags}
          onChange={(next) => {
            setTags(next);
            startTransition(() => patchProject(project.id, { tags: next }));
          }}
        />
      </td>
      <td className="py-4 text-center text-xs text-slate-500 dark:text-slate-300">
        {project._count?.attachments ?? 0} files / {project._count?.comments ?? 0} notes
      </td>
    </tr>
  );
}
