import { can } from "@/lib/rbac";
import { Role } from "@prisma/client";
import { describe, expect, it } from "vitest";

describe("RBAC", () => {
  it("allows owners to admin", () => {
    expect(can(Role.OWNER, "admin")).toBe(true);
  });

  it("prevents guests from writing", () => {
    expect(can(Role.GUEST, "write")).toBe(false);
  });
});
