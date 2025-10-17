import type {
  Project,
  Customer,
  ProjectTag,
  Estimate,
  Order,
  Attachment,
  Comment,
  Activity,
  ProjectStatus,
  ProjectPriority,
} from "@prisma/client";

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

export type ProjectListEntry = {
  id: string;
  name: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  deadline: string | null;
  customer: { id: string; name: string | null } | null;
  tags: { id: string; tag: string }[];
  _count: {
    attachments: number;
    comments: number;
  };
};
