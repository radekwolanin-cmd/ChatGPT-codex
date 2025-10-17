import type { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { projectUpdateSchema } from "@/lib/validators/project";
import { deleteProject, getProject, updateProject } from "@/server/services/project-service";

type RouteParams = Promise<{ projectId: string }>;

export async function GET(_request: NextRequest, context: { params: RouteParams }) {
  const user = await getCurrentUser();
  if (!user) return fail(401, "Unauthorized");
  const { projectId } = await context.params;
  const project = await getProject(user.id, projectId);
  if (!project) return fail(404, "Not found");
  return ok(project);
}

export async function PATCH(request: NextRequest, context: { params: RouteParams }) {
  const user = await getCurrentUser();
  if (!user) return fail(401, "Unauthorized");
  const { projectId } = await context.params;
  const json = await request.json();
  const parsed = projectUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return fail(400, "Invalid body", parsed.error.flatten());
  }
  const project = await updateProject(user.id, user.role, projectId, parsed.data);
  return ok(project);
}

export async function DELETE(_request: NextRequest, context: { params: RouteParams }) {
  const user = await getCurrentUser();
  if (!user) return fail(401, "Unauthorized");
  const { projectId } = await context.params;
  await deleteProject(user.id, user.role, projectId);
  return ok({ success: true });
}
