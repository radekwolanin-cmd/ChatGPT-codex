import { getCurrentUser } from "@/lib/auth";
import { fail } from "@/lib/api";

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw fail(401, "Unauthorized");
  }
  return user;
}
