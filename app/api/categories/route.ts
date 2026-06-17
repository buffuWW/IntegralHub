import { TaskStatus } from "@prisma/client";
import { ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { tasks: { where: { status: TaskStatus.PUBLISHED } } } } }
  });
  return ok(categories.map((category) => ({ ...category, publishedCount: category._count.tasks })));
}
