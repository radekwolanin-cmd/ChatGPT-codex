import { projectCreateSchema } from "@/lib/validators/project";
import { describe, expect, it } from "vitest";

describe("projectCreateSchema", () => {
  it("requires name", () => {
    const result = projectCreateSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts valid payload", () => {
    const result = projectCreateSchema.safeParse({ name: "Test", tags: ["alpha"], status: "TO_DO" });
    expect(result.success).toBe(true);
  });
});
