import type { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { estimateUpdateSchema } from "@/lib/validators/estimate";
import { deleteEstimate, updateEstimate } from "@/server/services/project-service";

interface Params {
  params: { projectId: string; estimateId: string };
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return fail(401, "Unauthorized");
  const json = await request.json();
  const parsed = estimateUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return fail(400, "Invalid body", parsed.error.flatten());
  }
  const estimate = await updateEstimate(user.id, user.role, params.projectId, params.estimateId, parsed.data);
  return ok(estimate);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return fail(401, "Unauthorized");
  await deleteEstimate(user.id, user.role, params.projectId, params.estimateId);
  return ok({ success: true });
}
