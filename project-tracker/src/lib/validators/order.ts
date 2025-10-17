import { z } from "zod";

export const orderStatusEnum = z.enum(["DRAFT", "SENT", "FULFILLED", "CANCELLED"]);

export const orderCreateSchema = z.object({
  vendor: z.string().min(1),
  reference: z.string().min(1),
  subtotal: z.number().min(0),
  tax: z.number().min(0).default(0),
  total: z.number().min(0),
  notes: z.string().optional(),
  status: orderStatusEnum.default("DRAFT"),
});

export const orderUpdateSchema = orderCreateSchema.partial();

export type OrderCreateInput = z.infer<typeof orderCreateSchema>;
export type OrderUpdateInput = z.infer<typeof orderUpdateSchema>;
