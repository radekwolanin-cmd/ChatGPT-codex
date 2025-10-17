import type { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { deleteAttachment } from "@/server/services/project-service";

type RouteParams = Promise<{ attachmentId: string }>;

export async function DELETE(_request: NextRequest, context: { params: RouteParams }) {
  const user = await getCurrentUser();
  if (!user) return fail(401, "Unauthorized");
  const { attachmentId } = await context.params;
  const attachment = await deleteAttachment(user.id, user.role, attachmentId);
  return ok({ success: true, attachment });
}
