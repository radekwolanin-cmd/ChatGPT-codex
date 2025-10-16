import type { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { estimateCreateSchema } from "@/lib/validators/estimate";
import { createEstimate, getProject } from "@/server/services/project-service";

interface Params {
  params: { projectId: string };
}

export async function GET(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return fail(401, "Unauthorized");
  const project = await getProject(user.id, params.projectId);
  if (!project) return fail(404, "Not found");
  return ok(project.estimates);
}

export async function POST(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return fail(401, "Unauthorized");
  const json = await request.json();
  const parsed = estimateCreateSchema.safeParse(json);
  if (!parsed.success) {
    return fail(400, "Invalid body", parsed.error.flatten());
  }
  const estimate = await createEstimate(user.id, user.role, params.projectId, parsed.data);
  return ok(estimate);
}
