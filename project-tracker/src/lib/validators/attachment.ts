import { z } from "zod";

export const attachmentCreateSchema = z.object({
  fileName: z.string().min(1),
  fileSize: z.number().min(1),
  mimeType: z.string().min(1),
});

export type AttachmentCreateInput = z.infer<typeof attachmentCreateSchema>;
