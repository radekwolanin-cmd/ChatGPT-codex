import { z } from "zod";

export const projectStatusEnum = z.enum(["TO_DO", "IN_PROGRESS", "DONE"]);
export const projectPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

export const projectCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().default(""),
  status: projectStatusEnum.default("TO_DO"),
  priority: projectPriorityEnum.default("MEDIUM"),
  deadline: z.string().datetime().optional(),
  tags: z.array(z.string().max(24)).max(10).optional().default([]),
  customerId: z.string().optional(),
  customer: z
    .object({
      name: z.string().min(1),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      company: z.string().optional(),
    })
    .optional(),
  budgetVendor: z.number().min(0).optional(),
  budgetInternal: z.number().min(0).optional(),
  budgetCustomer: z.number().min(0).optional(),
});

export const projectUpdateSchema = projectCreateSchema.partial();

export const projectListQuerySchema = z.object({
  status: projectStatusEnum.optional(),
  priority: projectPriorityEnum.optional(),
  tag: z.string().optional(),
  customerId: z.string().optional(),
  q: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(5).max(50).default(20),
});

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
export type ProjectListQuery = z.infer<typeof projectListQuerySchema>;
