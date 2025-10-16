import { ok } from "@/lib/api";
import { prisma } from "@/server/db";

export async function POST() {
  const upcoming = await prisma.project.findMany({
    where: {
      deadline: { gte: new Date(), lte: new Date(Date.now() + 1000 * 60 * 60 * 24) },
      status: { not: "DONE" },
      archivedAt: null,
    },
    select: { id: true, name: true, deadline: true },
  });
  return ok({ upcoming });
}
