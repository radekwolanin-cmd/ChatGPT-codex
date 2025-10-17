import type { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { orderUpdateSchema } from "@/lib/validators/order";
import { deleteOrder, updateOrder } from "@/server/services/project-service";

type RouteParams = Promise<{ projectId: string; orderId: string }>;

export async function PATCH(request: NextRequest, context: { params: RouteParams }) {
  const user = await getCurrentUser();
  if (!user) return fail(401, "Unauthorized");
  const { projectId, orderId } = await context.params;
  const json = await request.json();
  const parsed = orderUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return fail(400, "Invalid body", parsed.error.flatten());
  }
  const order = await updateOrder(user.id, user.role, projectId, orderId, parsed.data);
  return ok(order);
}

export async function DELETE(_request: NextRequest, context: { params: RouteParams }) {
  const user = await getCurrentUser();
  if (!user) return fail(401, "Unauthorized");
  const { projectId, orderId } = await context.params;
  await deleteOrder(user.id, user.role, projectId, orderId);
  return ok({ success: true });
}
