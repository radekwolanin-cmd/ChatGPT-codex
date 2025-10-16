import type { Project, Customer, ProjectTag, Estimate, Order, Attachment, Comment, Activity } from "@prisma/client";

export type ProjectWithRelations = Project & {
  customer: Customer | null;
  tags: ProjectTag[];
  attachments: Attachment[];
  comments: (Comment & { author: { name: string | null; email: string | null } })[];
  estimates: Estimate[];
  orders: Order[];
  activity: (Activity & { actor: { name: string | null } })[];
  _count?: {
    attachments: number;
    comments: number;
  };
};

export type ProjectListEntry = Pick<
  ProjectWithRelations,
  "id" | "name" | "status" | "priority" | "deadline" | "customer" | "tags" | "_count"
>;
