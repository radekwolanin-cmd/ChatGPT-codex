import type { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { customerCreateSchema } from "@/lib/validators/customer";
import { createCustomer, listCustomers } from "@/server/services/project-service";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return fail(401, "Unauthorized");
  const customers = await listCustomers(user.id);
  return ok(customers);
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return fail(401, "Unauthorized");
  const json = await request.json();
  const parsed = customerCreateSchema.safeParse(json);
  if (!parsed.success) {
    return fail(400, "Invalid body", parsed.error.flatten());
  }
  const customer = await createCustomer(user.id, user.role, parsed.data);
  return ok(customer);
}
