import { ok } from "@/lib/api";
import { appendActivity, findOverdueProjects, markOverdueProjects } from "@/server/services/project-service";
import { sendMail } from "@/server/mailer";

export async function POST() {
  const overdueProjects = await findOverdueProjects();
  const updatedCount = await markOverdueProjects();

  for (const project of overdueProjects) {
    await appendActivity(project.id, project.updatedById, "PROJECT_OVERDUE", {
      deadline: project.deadline,
    });
    await sendMail({
      to: project.customer?.email ?? process.env.EMAIL_FROM,
      from: process.env.EMAIL_FROM,
      subject: `Project ${project.name} is overdue`,
      text: `Project ${project.name} for ${project.customer?.name ?? "unknown"} is overdue. Deadline was ${project.deadline?.toISOString()}`,
    });
  }

  return ok({ overdueProjects: overdueProjects.length, updatedCount });
}
