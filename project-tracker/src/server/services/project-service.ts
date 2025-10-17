import crypto from "crypto";
import { prisma } from "@/server/db";
import { getRedis, invalidate } from "@/server/redis";
import type { Prisma, ProjectStatus, ProjectPriority, Role, EstimateType, EstimateStatus, Customer, Project } from "@prisma/client";
import type { ProjectCreateInput, ProjectUpdateInput } from "@/lib/validators/project";
import type { CommentCreateInput } from "@/lib/validators/comment";
import type { EstimateCreateInput, EstimateUpdateInput } from "@/lib/validators/estimate";
import type { OrderCreateInput, OrderUpdateInput } from "@/lib/validators/order";
import type { CustomerCreateInput } from "@/lib/validators/customer";
import type { ProjectListEntry, ProjectWithRelations } from "@/types/project";
import { attachmentCreateSchema } from "@/lib/validators/attachment";
import { assertCan } from "@/lib/rbac";

interface ListParams {
  search?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  tag?: string;
  customerId?: string;
  cursor?: string;
  limit?: number;
}

type ProjectListItem = ProjectListEntry;

export type ProjectListResult = { grouped: Record<ProjectStatus, ProjectListItem[]>; nextCursor: string | null };

function listCacheKey(userId: string, params: ListParams) {
  const hash = crypto.createHash("sha1").update(JSON.stringify(params)).digest("hex");
  return `proj:list:${userId}:${hash}`;
}

async function invalidateProjectLists(userId: string) {
  const redis = getRedis();
  const keys = await redis.keys(`proj:list:${userId}:*`);
  if (keys.length) {
    await redis.del(...keys);
  }
}

export async function listProjects(userId: string, params: ListParams): Promise<ProjectListResult> {
  const redis = getRedis();
  const key = listCacheKey(userId, params);
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached) as Awaited<ReturnType<typeof listProjects>>;
  }

  const { search, status, priority, tag, customerId, cursor, limit = 20 } = params;
  const where: Record<string, unknown> = { archivedAt: null };

  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (customerId) where.customerId = customerId;
  if (tag) where.tags = { some: { tag } };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { customer: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const records = await prisma.project.findMany({
    where,
    include: {
      customer: true,
      tags: true,
      _count: { select: { attachments: true, comments: true } },
      estimates: true,
      orders: true,
    },
    orderBy: [{ updatedAt: "desc" }],
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
  });

  let nextCursor: string | null = null;
  if (records.length > limit) {
    const nextItem = records.pop();
    nextCursor = nextItem?.id ?? null;
  }

  const items: ProjectListItem[] = records.map((project) => ({
    id: project.id,
    name: project.name,
    status: project.status,
    priority: project.priority,
    deadline: project.deadline ? project.deadline.toISOString() : null,
    customer: project.customer ? { id: project.customer.id, name: project.customer.name } : null,
    tags: project.tags.map((tag) => ({ id: tag.id, tag: tag.tag })),
    _count: {
      attachments: project._count?.attachments ?? 0,
      comments: project._count?.comments ?? 0,
    },
  }));

  const grouped = items.reduce(
    (acc, item) => {
      acc[item.status].push(item);
      return acc;
    },
    {
      TO_DO: [] as ProjectListItem[],
      IN_PROGRESS: [] as ProjectListItem[],
      DONE: [] as ProjectListItem[],
    }
  );

  const payload = { grouped, nextCursor };
  await redis.set(key, JSON.stringify(payload), "EX", 60);
  return payload;
}

export async function getProject(userId: string, id: string): Promise<ProjectWithRelations | null> {
  const redis = getRedis();
  const key = `proj:detail:${userId}:${id}`;
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached) as ProjectWithRelations;

  const project = (await prisma.project.findUnique({
    where: { id },
    include: {
      customer: true,
      tags: true,
      attachments: { orderBy: { createdAt: "desc" } },
      comments: { include: { author: true }, orderBy: { createdAt: "asc" } },
      estimates: { orderBy: { createdAt: "desc" } },
      orders: { orderBy: { createdAt: "desc" } },
      activity: { orderBy: { createdAt: "desc" }, take: 50, include: { actor: true } },
    },
  })) as ProjectWithRelations | null;
  if (!project) return null;
  await redis.set(key, JSON.stringify(project), "EX", 120);
  return project;
}

export async function createProject(
  userId: string,
  role: Role,
  input: ProjectCreateInput
): Promise<ProjectWithRelations> {
  assertCan(role, "write");

  const { customer, tags = [], ...rest } = input;
  const project = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    let customerId = input.customerId;
    if (!customerId && customer) {
      const created = await tx.customer.create({
        data: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          company: customer.company,
          notes: null,
          ownerId: userId,
        },
      });
      customerId = created.id;
    }

    const createdProject = await tx.project.create({
      data: {
        ...rest,
        createdById: userId,
        updatedById: userId,
        customerId,
        tags: {
          createMany: { data: tags.map((tag) => ({ tag })) },
        },
      },
      include: { tags: true, customer: true },
    });

    await tx.activity.create({
      data: {
        projectId: createdProject.id,
        action: "PROJECT_CREATED",
        payload: rest,
        actorId: userId,
      },
    });

    return createdProject as ProjectWithRelations;
  });

  await invalidate([`proj:detail:${userId}:${project.id}`]);
  await invalidateProjectLists(userId);
  return project;
}

export async function updateProject(
  userId: string,
  role: Role,
  id: string,
  input: ProjectUpdateInput
): Promise<ProjectWithRelations> {
  assertCan(role, "write");
  const { tags, customer, ...rest } = input;

  const project = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const current = await tx.project.findUnique({ where: { id }, select: { customerId: true, status: true } });
    if (customer) {
      if (current?.customerId) {
        await tx.customer.update({ where: { id: current.customerId }, data: customer });
      } else {
        const createdCustomer = await tx.customer.create({
          data: {
            ...customer,
            ownerId: userId,
          },
        });
        rest.customerId = createdCustomer.id;
      }
    }

    if (tags) {
      await tx.projectTag.deleteMany({ where: { projectId: id } });
    }

    const updated = await tx.project.update({
      where: { id },
      data: {
        ...rest,
        updatedById: userId,
        ...(tags
          ? {
              tags: {
                createMany: {
                  data: tags.map((tag) => ({ tag })),
                },
              },
            }
          : {}),
      },
      include: { tags: true, customer: true },
    });

    if (rest.status && rest.status !== current?.status) {
      await tx.projectStatusHistory.create({
        data: {
          projectId: id,
          from: current?.status,
          to: rest.status as ProjectStatus,
          changedBy: userId,
        },
      });
    }

    await tx.activity.create({
      data: {
        projectId: id,
        actorId: userId,
        action: "PROJECT_UPDATED",
        payload: rest,
      },
    });

    return updated as ProjectWithRelations;
  });

  await invalidate([`proj:detail:${userId}:${id}`]);
  await invalidateProjectLists(userId);
  return project;
}

export async function deleteProject(userId: string, role: Role, id: string) {
  assertCan(role, "admin");
  await prisma.project.update({
    where: { id },
    data: { archivedAt: new Date(), updatedById: userId },
  });
  await invalidate([`proj:detail:${userId}:${id}`]);
  await invalidateProjectLists(userId);
}

export async function createComment(userId: string, role: Role, projectId: string, input: CommentCreateInput) {
  assertCan(role, "comment");
  const comment = await prisma.comment.create({
    data: {
      body: input.body,
      parentId: input.parentId,
      projectId,
      authorId: userId,
    },
    include: { author: true },
  });

  await prisma.activity.create({
    data: {
      projectId,
      actorId: userId,
      action: "COMMENT_ADDED",
      payload: { commentId: comment.id },
    },
  });

  await invalidate([`proj:detail:${userId}:${projectId}`]);
  return comment;
}

export async function createEstimate(userId: string, role: Role, projectId: string, input: EstimateCreateInput) {
  assertCan(role, "write");
  const estimate = await prisma.estimate.create({
    data: {
      projectId,
      type: input.type as EstimateType,
      title: input.title,
      vendor: input.vendor,
      amount: input.amount,
      currency: input.currency,
      status: input.status as EstimateStatus,
      validUntil: input.validUntil ? new Date(input.validUntil) : null,
      notes: input.notes,
      createdById: userId,
      updatedById: userId,
    },
  });
  await prisma.activity.create({
    data: {
      projectId,
      actorId: userId,
      action: "ESTIMATE_CREATED",
      payload: estimate,
    },
  });
  await invalidate([`proj:detail:${userId}:${projectId}`]);
  return estimate;
}

export async function updateEstimate(userId: string, role: Role, projectId: string, estimateId: string, input: EstimateUpdateInput) {
  assertCan(role, "write");
  const estimate = await prisma.estimate.update({
    where: { id: estimateId },
    data: {
      ...input,
      updatedById: userId,
      validUntil: input.validUntil ? new Date(input.validUntil) : undefined,
    },
  });
  await prisma.activity.create({
    data: {
      projectId,
      actorId: userId,
      action: "ESTIMATE_UPDATED",
      payload: { estimateId, changes: input },
    },
  });
  await invalidate([`proj:detail:${userId}:${projectId}`]);
  return estimate;
}

export async function deleteEstimate(userId: string, role: Role, projectId: string, estimateId: string) {
  assertCan(role, "write");
  await prisma.estimate.delete({ where: { id: estimateId } });
  await prisma.activity.create({
    data: {
      projectId,
      actorId: userId,
      action: "ESTIMATE_DELETED",
      payload: { estimateId },
    },
  });
  await invalidate([`proj:detail:${userId}:${projectId}`]);
}

export async function createOrder(userId: string, role: Role, projectId: string, input: OrderCreateInput) {
  assertCan(role, "write");
  const order = await prisma.order.create({
    data: {
      projectId,
      vendor: input.vendor,
      reference: input.reference,
      subtotal: input.subtotal,
      tax: input.tax,
      total: input.total,
      notes: input.notes,
      status: input.status,
      createdById: userId,
      updatedById: userId,
    },
  });
  await prisma.activity.create({
    data: {
      projectId,
      actorId: userId,
      action: "ORDER_CREATED",
      payload: order,
    },
  });
  await invalidate([`proj:detail:${userId}:${projectId}`]);
  return order;
}

export async function updateOrder(userId: string, role: Role, projectId: string, orderId: string, input: OrderUpdateInput) {
  assertCan(role, "write");
  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      ...input,
      updatedById: userId,
    },
  });
  await prisma.activity.create({
    data: {
      projectId,
      actorId: userId,
      action: "ORDER_UPDATED",
      payload: { orderId, changes: input },
    },
  });
  await invalidate([`proj:detail:${userId}:${projectId}`]);
  return order;
}

export async function deleteOrder(userId: string, role: Role, projectId: string, orderId: string) {
  assertCan(role, "write");
  await prisma.order.delete({ where: { id: orderId } });
  await prisma.activity.create({
    data: {
      projectId,
      actorId: userId,
      action: "ORDER_DELETED",
      payload: { orderId },
    },
  });
  await invalidate([`proj:detail:${userId}:${projectId}`]);
}

export async function createAttachment(
  userId: string,
  role: Role,
  projectId: string,
  input: { fileName: string; fileSize: number; mimeType: string; url: string }
) {
  assertCan(role, "write");
  const parsed = attachmentCreateSchema.parse(input);
  const attachment = await prisma.attachment.create({
    data: {
      ...parsed,
      url: input.url,
      projectId,
      uploadedById: userId,
    },
  });
  await prisma.activity.create({
    data: {
      projectId,
      actorId: userId,
      action: "ATTACHMENT_ADDED",
      payload: { attachmentId: attachment.id },
    },
  });
  await invalidate([`proj:detail:${userId}:${projectId}`]);
  return attachment;
}

export async function deleteAttachment(userId: string, role: Role, attachmentId: string) {
  assertCan(role, "write");
  const attachment = await prisma.attachment.delete({ where: { id: attachmentId } });
  await prisma.activity.create({
    data: {
      projectId: attachment.projectId,
      actorId: userId,
      action: "ATTACHMENT_DELETED",
      payload: { attachmentId },
    },
  });
  await invalidate([`proj:detail:${userId}:${attachment.projectId}`]);
  return attachment;
}

export async function createCustomer(userId: string, role: Role, input: CustomerCreateInput) {
  assertCan(role, "write");
  return prisma.customer.create({
    data: {
      ...input,
      ownerId: userId,
    },
  });
}

export async function listCustomers(userId: string): Promise<Customer[]> {
  return prisma.customer.findMany({
    where: { ownerId: userId },
    orderBy: { name: "asc" },
  });
}

export async function appendActivity(
  projectId: string,
  actorId: string,
  action: string,
  payload: Prisma.InputJsonValue
) {
  await prisma.activity.create({
    data: {
      projectId,
      actorId,
      action,
      payload,
    },
  });
}

export async function markOverdueProjects(): Promise<number> {
  const now = new Date();
  const overdue = await prisma.project.updateMany({
    where: {
      deadline: { lt: now },
      status: { not: "DONE" },
      archivedAt: null,
    },
    data: {
      overdueNotifiedAt: now,
    },
  });
  return overdue?.count ?? 0;
}

export async function findOverdueProjects(): Promise<(Project & { customer: Customer | null })[]> {
  const projects = await prisma.project.findMany({
    where: {
      deadline: { lt: new Date() },
      status: { not: "DONE" },
      archivedAt: null,
    },
    include: { customer: true },
  });
  return projects as (Project & { customer: Customer | null })[];
}
