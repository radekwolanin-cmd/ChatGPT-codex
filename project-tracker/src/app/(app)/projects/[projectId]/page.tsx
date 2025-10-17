import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getProject } from "@/server/services/project-service";
import { ProjectDetail } from "@/components/projects/project-detail";

type ProjectPageProps = {
  params?: Promise<{ projectId: string }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    notFound();
  }
  const routeParams = (await params) ?? {};
  const projectId = routeParams.projectId;
  if (!projectId) {
    notFound();
  }
  const project = await getProject(user.id, projectId);
  if (!project) {
    notFound();
  }
  return <ProjectDetail project={project} />;
}
