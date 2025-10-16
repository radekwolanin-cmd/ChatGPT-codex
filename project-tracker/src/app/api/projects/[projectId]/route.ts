import type { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { projectUpdateSchema } from "@/lib/validators/project";
import { deleteProject, getProject, updateProject } from "@/server/services/project-service";

interface Params {
  params: { projectId: string };
}

export async function GET(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return fail(401, "Unauthorized");
  const project = await getProject(user.id, params.projectId);
  if (!project) return fail(404, "Not found");
  return ok(project);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return fail(401, "Unauthorized");
  const json = await request.json();
  const parsed = projectUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return fail(400, "Invalid body", parsed.error.flatten());
  }
  const project = await updateProject(user.id, user.role, params.projectId, parsed.data);
  return ok(project);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return fail(401, "Unauthorized");
  await deleteProject(user.id, user.role, params.projectId);
  return ok({ success: true });
}
