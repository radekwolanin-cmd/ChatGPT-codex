import { z } from "zod";

export const estimateTypeEnum = z.enum(["VENDOR", "CUSTOMER"]);
export const estimateStatusEnum = z.enum(["DRAFT", "SENT", "ACCEPTED", "REJECTED"]);

export const estimateCreateSchema = z.object({
  type: estimateTypeEnum,
  title: z.string().min(1),
  vendor: z.string().optional(),
  amount: z.number().min(0),
  currency: z.string().length(3).default("USD"),
  validUntil: z.string().datetime().optional(),
  status: estimateStatusEnum.default("DRAFT"),
  notes: z.string().optional(),
});

export const estimateUpdateSchema = estimateCreateSchema.partial();

export type EstimateCreateInput = z.infer<typeof estimateCreateSchema>;
export type EstimateUpdateInput = z.infer<typeof estimateUpdateSchema>;
