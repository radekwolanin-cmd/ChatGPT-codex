export const Role = {
  OWNER: "OWNER",
  MEMBER: "MEMBER",
  GUEST: "GUEST",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const ProjectStatus = {
  TO_DO: "TO_DO",
  IN_PROGRESS: "IN_PROGRESS",
  DONE: "DONE",
} as const;
export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

export const ProjectPriority = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  URGENT: "URGENT",
} as const;
export type ProjectPriority = (typeof ProjectPriority)[keyof typeof ProjectPriority];

export const EstimateType = {
  VENDOR: "VENDOR",
  CUSTOMER: "CUSTOMER",
} as const;
export type EstimateType = (typeof EstimateType)[keyof typeof EstimateType];

export const EstimateStatus = {
  DRAFT: "DRAFT",
  SENT: "SENT",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
} as const;
export type EstimateStatus = (typeof EstimateStatus)[keyof typeof EstimateStatus];

export const OrderStatus = {
  DRAFT: "DRAFT",
  SENT: "SENT",
  FULFILLED: "FULFILLED",
  CANCELLED: "CANCELLED",
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: Role;
}

export interface Customer {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  notes?: string | null;
}

export interface ProjectTag {
  id: string;
  projectId: string;
  tag: string;
}

export interface Attachment {
  id: string;
  projectId: string;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedById: string;
  createdAt: Date;
}

export interface Comment {
  id: string;
  projectId: string;
  authorId: string;
  parentId?: string | null;
  body: string;
  createdAt: Date;
}

export interface Estimate {
  id: string;
  projectId: string;
  type: EstimateType;
  title: string;
  vendor?: string | null;
  amount: number | string;
  currency: string;
  status: EstimateStatus;
  validUntil?: Date | null;
  notes?: string | null;
}

export interface Order {
  id: string;
  projectId: string;
  vendor: string;
  reference: string;
  subtotal: number | string;
  tax: number | string;
  total: number | string;
  status: OrderStatus;
  notes?: string | null;
}

export interface Activity {
  id: string;
  projectId: string;
  actorId: string;
  action: string;
  payload: unknown;
  createdAt: Date;
}

export interface ProjectStatusHistory {
  id: string;
  projectId: string;
  from: ProjectStatus | null;
  to: ProjectStatus;
  changedBy: string;
  changedAt: Date;
}

export interface Session {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
}

export interface Account {
  id: string;
  userId: string;
  provider: string;
  providerAccountId: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  deadline?: Date | null;
  customerId?: string | null;
  createdById: string;
  updatedById: string;
  budgetVendor?: number | string | null;
  budgetInternal?: number | string | null;
  budgetCustomer?: number | string | null;
}

export type ProjectWithRelations = Project & {
  customer: Customer | null;
  tags: ProjectTag[];
  attachments: Attachment[];
  comments: Comment[];
  estimates: Estimate[];
  orders: Order[];
  activity: Activity[];
  _count?: { attachments: number; comments: number };
};

export class PrismaClient {
  constructor(_options?: Record<string, unknown>) {}

  private static fail<T>(method: string): Promise<T> {
    return Promise.reject(
      new Error(`PrismaClient stub: ${method} is not implemented in the offline environment.`)
    );
  }

  project = PrismaClient.createDelegate<ProjectWithRelations>("project");
  customer = PrismaClient.createDelegate<Customer>("customer");
  comment = PrismaClient.createDelegate<Comment>("comment");
  estimate = PrismaClient.createDelegate<Estimate>("estimate");
  order = PrismaClient.createDelegate<Order>("order");
  attachment = PrismaClient.createDelegate<Attachment>("attachment");
  activity = PrismaClient.createDelegate<Activity>("activity");
  projectTag = PrismaClient.createDelegate<ProjectTag>("projectTag");
  projectStatusHistory = PrismaClient.createDelegate<ProjectStatusHistory>("projectStatusHistory");
  session = PrismaClient.createDelegate<Session>("session");
  account = PrismaClient.createDelegate<Account>("account");
  user = PrismaClient.createDelegate<User>("user");

  private static createDelegate<T>(name: string) {
    return {
      findMany: (..._args: unknown[]) => PrismaClient.fail<T[]>(`${name}.findMany`),
      findUnique: (..._args: unknown[]) => PrismaClient.fail<T | null>(`${name}.findUnique`),
      create: (..._args: unknown[]) => PrismaClient.fail<T>(`${name}.create`),
      createMany: (..._args: unknown[]) => PrismaClient.fail<{ count: number }>(`${name}.createMany`),
      update: (..._args: unknown[]) => PrismaClient.fail<T>(`${name}.update`),
      updateMany: (..._args: unknown[]) => PrismaClient.fail<{ count: number }>(`${name}.updateMany`),
      delete: (..._args: unknown[]) => PrismaClient.fail<T>(`${name}.delete`),
      deleteMany: (..._args: unknown[]) => PrismaClient.fail<{ count: number }>(`${name}.deleteMany`),
      count: (..._args: unknown[]) => PrismaClient.fail<number>(`${name}.count`),
    };
  }

  async $transaction<T>(fn: (tx: PrismaClient) => Promise<T>): Promise<T> {
    return fn(this);
  }

  async $disconnect(): Promise<void> {
    return Promise.resolve();
  }
}

export class PrismaDecimal {
  constructor(private readonly value: string | number) {}
  toNumber(): number {
    return typeof this.value === "number" ? this.value : Number(this.value);
  }
  valueOf(): number {
    return this.toNumber();
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type ProjectGetPayload<_T = unknown> = ProjectWithRelations;
export type TransactionClient = PrismaClient;

export const Prisma = {
  Decimal: PrismaDecimal,
};
