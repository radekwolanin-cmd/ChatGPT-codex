import "dotenv/config";
import { faker } from "@faker-js/faker";
import {
  PrismaClient,
  Prisma,
  ProjectPriority,
  ProjectStatus,
  Role,
  EstimateType,
  EstimateStatus,
  OrderStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");
  await prisma.activity.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.estimate.deleteMany();
  await prisma.order.deleteMany();
  await prisma.projectTag.deleteMany();
  await prisma.projectStatusHistory.deleteMany();
  await prisma.project.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const owner = await prisma.user.create({
    data: {
      name: "Demo Owner",
      email: "owner@example.com",
      role: Role.OWNER,
    },
  });

  const members = await Promise.all(
    Array.from({ length: 3 }).map(() =>
      prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          role: faker.helpers.arrayElement([Role.MEMBER, Role.GUEST]),
        },
      })
    )
  );

  const customers = await Promise.all(
    Array.from({ length: 10 }).map(() =>
      prisma.customer.create({
        data: {
          name: faker.company.name(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
          company: faker.company.buzzNoun(),
          notes: faker.lorem.sentence(),
          ownerId: owner.id,
        },
      })
    )
  );

  for (let i = 0; i < 25; i++) {
    const status = faker.helpers.arrayElement(Object.values(ProjectStatus));
    const priority = faker.helpers.arrayElement(Object.values(ProjectPriority));
    const customer = customers[faker.number.int({ min: 0, max: customers.length - 1 })];
    const deadline = faker.date.soon({ days: 60 });

    const project = await prisma.project.create({
      data: {
        name: faker.commerce.productName(),
        description: faker.lorem.sentences({ min: 1, max: 3 }).slice(0, 180),
        status,
        priority,
        deadline,
        customerId: customer.id,
        createdById: owner.id,
        updatedById: owner.id,
        budgetVendor: new Prisma.Decimal(faker.number.float({ min: 1000, max: 5000, fractionDigits: 2 })),
        budgetInternal: new Prisma.Decimal(faker.number.float({ min: 500, max: 4000, fractionDigits: 2 })),
        budgetCustomer: new Prisma.Decimal(faker.number.float({ min: 1500, max: 8000, fractionDigits: 2 })),
        tags: {
          createMany: {
            data: Array.from({ length: faker.number.int({ min: 1, max: 4 }) }).map(() => ({
              tag: faker.commerce.department().toLowerCase(),
            })),
          },
        },
      },
    });

    await prisma.projectStatusHistory.create({
      data: {
        projectId: project.id,
        from: null,
        to: status,
        changedBy: owner.id,
      },
    });

    const attachments = await Promise.all(
      Array.from({ length: faker.number.int({ min: 1, max: 3 }) }).map(() =>
        prisma.attachment.create({
          data: {
            projectId: project.id,
            fileName: faker.system.fileName(),
            fileSize: faker.number.int({ min: 10_000, max: 5_000_000 }),
            mimeType: faker.system.mimeType(),
            url: faker.internet.url(),
            uploadedById: owner.id,
          },
        })
      )
    );

    const comments = await Promise.all(
      Array.from({ length: faker.number.int({ min: 2, max: 5 }) }).map(() =>
        prisma.comment.create({
          data: {
            projectId: project.id,
            body: faker.lorem.sentences({ min: 1, max: 2 }),
            authorId: faker.helpers.arrayElement([owner, ...members]).id,
          },
        })
      )
    );

    await Promise.all(
      Array.from({ length: 2 }).map((_, idx) =>
        prisma.estimate.create({
          data: {
            projectId: project.id,
            type: idx === 0 ? EstimateType.VENDOR : EstimateType.CUSTOMER,
            title: `${idx === 0 ? "Vendor" : "Customer"} Estimate ${faker.commerce.productAdjective()}`,
            vendor: faker.company.name(),
            amount: new Prisma.Decimal(faker.number.float({ min: 800, max: 6000, fractionDigits: 2 })),
            currency: "USD",
            status: faker.helpers.arrayElement(Object.values(EstimateStatus)),
            validUntil: faker.date.soon({ days: 45 }),
            notes: faker.lorem.sentence(),
            createdById: owner.id,
            updatedById: owner.id,
          },
        })
      )
    );

    await Promise.all(
      Array.from({ length: 2 }).map(() =>
        prisma.order.create({
          data: {
            projectId: project.id,
            vendor: faker.company.name(),
            reference: faker.string.alphanumeric(8).toUpperCase(),
            subtotal: new Prisma.Decimal(faker.number.float({ min: 1000, max: 8000, fractionDigits: 2 })),
            tax: new Prisma.Decimal(faker.number.float({ min: 80, max: 1200, fractionDigits: 2 })),
            total: new Prisma.Decimal(faker.number.float({ min: 1200, max: 9200, fractionDigits: 2 })),
            notes: faker.lorem.sentence(),
            status: faker.helpers.arrayElement(Object.values(OrderStatus)),
            createdById: owner.id,
            updatedById: owner.id,
          },
        })
      )
    );

    await prisma.activity.createMany({
      data: [
        {
          projectId: project.id,
          actorId: owner.id,
          action: "PROJECT_CREATED",
          payload: { projectId: project.id },
        },
        {
          projectId: project.id,
          actorId: owner.id,
          action: "COMMENT_ADDED",
          payload: { commentId: comments[0]?.id },
        },
        {
          projectId: project.id,
          actorId: owner.id,
          action: "ATTACHMENT_ADDED",
          payload: { attachmentId: attachments[0]?.id },
        },
      ],
    });
  }

  console.log("✅ Seed complete");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
