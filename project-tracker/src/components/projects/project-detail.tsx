import type { ProjectWithRelations } from "@/types/project";
import { ProjectDetailClient } from "@/components/projects/project-detail-client";

export function ProjectDetail({ project }: { project: ProjectWithRelations }) {
  return <ProjectDetailClient project={JSON.parse(JSON.stringify(project))} />;
}
