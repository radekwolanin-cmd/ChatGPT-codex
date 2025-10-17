import type { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { estimateCreateSchema } from "@/lib/validators/estimate";
import { createEstimate, getProject } from "@/server/services/project-service";

type RouteParams = Promise<{ projectId: string }>;

export async function GET(_request: NextRequest, context: { params: RouteParams }) {
  const user = await getCurrentUser();
  if (!user) return fail(401, "Unauthorized");
  const { projectId } = await context.params;
  const project = await getProject(user.id, projectId);
  if (!project) return fail(404, "Not found");
  return ok(project.estimates);
}

export async function POST(request: NextRequest, context: { params: RouteParams }) {
  const user = await getCurrentUser();
  if (!user) return fail(401, "Unauthorized");
  const { projectId } = await context.params;
  const json = await request.json();
  const parsed = estimateCreateSchema.safeParse(json);
  if (!parsed.success) {
    return fail(400, "Invalid body", parsed.error.flatten());
  }
  const estimate = await createEstimate(user.id, user.role, projectId, parsed.data);
  return ok(estimate);
}
