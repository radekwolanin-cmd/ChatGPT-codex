import { z } from "zod";

export const commentCreateSchema = z.object({
  body: z.string().min(1).max(2000),
  parentId: z.string().optional(),
});

export type CommentCreateInput = z.infer<typeof commentCreateSchema>;
