"use client";

import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ProjectStatus } from "@prisma/client";
import { useState, type CSSProperties } from "react";
import { PriorityBadge } from "@/components/ui/priority-pill";
import { StatusBadge } from "@/components/ui/status-pill";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { ProjectListEntry } from "@/types/project";

interface ProjectBoardProps {
  projects: Record<ProjectStatus, ProjectListEntry[]>;
}

const columns: { status: ProjectStatus; title: string }[] = [
  { status: "TO_DO", title: "To Do" },
  { status: "IN_PROGRESS", title: "In Progress" },
  { status: "DONE", title: "Done" },
];

export function ProjectBoard({ projects }: ProjectBoardProps) {
  const [data, setData] = useState(projects);
  const sensors = useSensors(useSensor(PointerSensor));

  async function handleStatusChange(projectId: string, status: ProjectStatus) {
    await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeStatus = active.data.current?.status as ProjectStatus | undefined;
    const newStatus = over.data.current?.status as ProjectStatus | undefined;
    if (!activeStatus || !newStatus || activeStatus === newStatus) return;
    setData((prev) => {
      const next = { ...prev };
      const activeColumn = [...next[activeStatus]];
      const movedIndex = activeColumn.findIndex((item) => item.id === active.id);
      if (movedIndex === -1) return prev;
      const [moved] = activeColumn.splice(movedIndex, 1);
      moved.status = newStatus;
      next[activeStatus] = activeColumn;
      next[newStatus] = [moved, ...next[newStatus]];
      handleStatusChange(moved.id, newStatus);
      return next;
    });
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {columns.map((column) => (
          <Column key={column.status} title={column.title} status={column.status} projects={data[column.status]} />
        ))}
      </div>
    </DndContext>
  );
}

function Column({ title, status, projects }: { title: string; status: ProjectStatus; projects: ProjectListEntry[] }) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
          {title} <span className="ml-2 text-xs text-slate-400">{projects.length}</span>
        </h3>
        <StatusBadge status={status} />
      </div>
      <SortableContext items={projects.map((project) => project.id)}>
        <div className="flex flex-col gap-3">
          {projects.map((project) => (
            <Card key={project.id} project={project} status={status} />
          ))}
          {!projects.length && (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-center text-xs text-slate-400">
              Drop projects here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

function Card({ project, status }: { project: ProjectListEntry; status: ProjectStatus }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
    data: { status },
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const deadline = project.deadline ? new Date(project.deadline) : null;
  const overdue = deadline && deadline < new Date();

  return (
    <article
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-sm text-white shadow-elevated"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold">{project.name}</h4>
          <p className="text-xs text-slate-400">{project.customer?.name ?? "No customer"}</p>
        </div>
        <PriorityBadge priority={project.priority} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-300">
        {project.tags.map((tag) => (
          <Badge key={tag.tag} variant="outline">
            #{tag.tag}
          </Badge>
        ))}
        {deadline && (
          <span className={overdue ? "text-rose-300" : "text-slate-300"}>{format(deadline, "MMM d")}</span>
        )}
        <span className="text-slate-400">{project._count?.attachments ?? 0} files</span>
      </div>
    </article>
  );
}
