import type { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { createAttachment } from "@/server/services/project-service";
import { createSignedUploadUrl } from "@/server/blob";

type RouteParams = Promise<{ projectId: string }>;

export async function POST(request: NextRequest, context: { params: RouteParams }) {
  const user = await getCurrentUser();
  if (!user) return fail(401, "Unauthorized");
  const { projectId } = await context.params;
  const json = await request.json();

  if (!json.url) {
    const signed = await createSignedUploadUrl({
      pathname: `projects/${projectId}/${Date.now()}-${json.fileName ?? "upload"}`,
      contentType: json.mimeType,
      checksum: json.checksum,
    });
    return ok({ uploadUrl: signed.url, pathname: signed.pathname });
  }

  const attachment = await createAttachment(user.id, user.role, projectId, {
    fileName: json.fileName,
    fileSize: json.fileSize,
    mimeType: json.mimeType,
    url: json.url,
  });
  return ok(attachment);
}
