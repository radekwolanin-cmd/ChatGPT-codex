import type { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { orderCreateSchema } from "@/lib/validators/order";
import { createOrder, getProject } from "@/server/services/project-service";

type RouteParams = Promise<{ projectId: string }>;

export async function GET(_request: NextRequest, context: { params: RouteParams }) {
  const user = await getCurrentUser();
  if (!user) return fail(401, "Unauthorized");
  const { projectId } = await context.params;
  const project = await getProject(user.id, projectId);
  if (!project) return fail(404, "Not found");
  return ok(project.orders);
}

export async function POST(request: NextRequest, context: { params: RouteParams }) {
  const user = await getCurrentUser();
  if (!user) return fail(401, "Unauthorized");
  const { projectId } = await context.params;
  const json = await request.json();
  const parsed = orderCreateSchema.safeParse(json);
  if (!parsed.success) {
    return fail(400, "Invalid body", parsed.error.flatten());
  }
  const order = await createOrder(user.id, user.role, projectId, parsed.data);
  return ok(order);
}
