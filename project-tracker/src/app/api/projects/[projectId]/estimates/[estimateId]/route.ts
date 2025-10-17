import type { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { estimateUpdateSchema } from "@/lib/validators/estimate";
import { deleteEstimate, updateEstimate } from "@/server/services/project-service";

type RouteParams = Promise<{ projectId: string; estimateId: string }>;

export async function PATCH(request: NextRequest, context: { params: RouteParams }) {
  const user = await getCurrentUser();
  if (!user) return fail(401, "Unauthorized");
  const { projectId, estimateId } = await context.params;
  const json = await request.json();
  const parsed = estimateUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return fail(400, "Invalid body", parsed.error.flatten());
  }
  const estimate = await updateEstimate(user.id, user.role, projectId, estimateId, parsed.data);
  return ok(estimate);
}

export async function DELETE(_request: NextRequest, context: { params: RouteParams }) {
  const user = await getCurrentUser();
  if (!user) return fail(401, "Unauthorized");
  const { projectId, estimateId } = await context.params;
  await deleteEstimate(user.id, user.role, projectId, estimateId);
  return ok({ success: true });
}
