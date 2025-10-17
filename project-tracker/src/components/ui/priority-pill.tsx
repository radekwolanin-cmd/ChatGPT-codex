import type { ProjectPriority } from "@prisma/client";
import { Badge, type BadgeVariant } from "@/components/ui/badge";

const priorityStyles: Record<ProjectPriority, { label: string; variant: BadgeVariant }> = {
  LOW: { label: "Low", variant: "outline" },
  MEDIUM: { label: "Medium", variant: "default" },
  HIGH: { label: "High", variant: "warning" },
  URGENT: { label: "Urgent", variant: "danger" },
};

export function PriorityBadge({ priority }: { priority: ProjectPriority }) {
  const config = priorityStyles[priority];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
