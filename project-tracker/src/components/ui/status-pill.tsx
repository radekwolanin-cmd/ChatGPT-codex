"use client";

import type { ProjectStatus } from "@prisma/client";
import { Badge, type BadgeVariant } from "@/components/ui/badge";

const statusCopy: Record<ProjectStatus, { label: string; variant: BadgeVariant }> = {
  TO_DO: { label: "To Do", variant: "outline" },
  IN_PROGRESS: { label: "In Progress", variant: "warning" },
  DONE: { label: "Done", variant: "success" },
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const config = statusCopy[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
