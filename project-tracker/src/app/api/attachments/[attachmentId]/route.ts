import type { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { deleteAttachment } from "@/server/services/project-service";

interface Params {
  params: { attachmentId: string };
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return fail(401, "Unauthorized");
  const attachment = await deleteAttachment(user.id, user.role, params.attachmentId);
  return ok({ success: true, attachment });
}
