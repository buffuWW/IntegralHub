import { Difficulty, TaskStatus } from "@prisma/client";
import { ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [total, categories, easy, medium, hard] = await Promise.all([
    prisma.task.count({ where: { status: TaskStatus.PUBLISHED } }),
    prisma.category.count(),
    prisma.task.count({ where: { status: TaskStatus.PUBLISHED, difficulty: Difficulty.EASY } }),
    prisma.task.count({ where: { status: TaskStatus.PUBLISHED, difficulty: Difficulty.MEDIUM } }),
    prisma.task.count({ where: { status: TaskStatus.PUBLISHED, difficulty: Difficulty.HARD } })
  ]);
  return ok({ total, categories, easy, medium, hard });
}
