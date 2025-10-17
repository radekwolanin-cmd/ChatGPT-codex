import type { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { projectCreateSchema, projectListQuerySchema } from "@/lib/validators/project";
import { createProject, listProjects } from "@/server/services/project-service";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return fail(401, "Unauthorized");
  const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = projectListQuerySchema.safeParse({
    ...searchParams,
    limit: searchParams.limit ?? undefined,
  });
  if (!parsed.success) {
    return fail(400, "Invalid query", parsed.error.flatten());
  }
  const data = await listProjects(user.id, {
    search: parsed.data.q,
    status: parsed.data.status,
    priority: parsed.data.priority,
    tag: parsed.data.tag,
    customerId: parsed.data.customerId,
    cursor: parsed.data.cursor,
    limit: parsed.data.limit,
  });
  return ok(data);
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return fail(401, "Unauthorized");
  const json = await request.json();
  const parsed = projectCreateSchema.safeParse(json);
  if (!parsed.success) {
    return fail(400, "Invalid body", parsed.error.flatten());
  }
  const project = await createProject(user.id, user.role, parsed.data);
  return ok(project);
}
