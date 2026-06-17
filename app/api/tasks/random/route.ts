import { TaskStatus } from "@prisma/client";
import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { buildPublicTaskWhere } from "@/lib/task-query";
import { getCurrentUser } from "@/lib/user-auth";

async function pick(request: NextRequest) {
  const body = request.method === "POST" ? await request.json().catch(() => ({})) as { solvedNumbers?: number[] } : {};
  const where = buildPublicTaskWhere(request.nextUrl.searchParams);
  const user = await getCurrentUser(request);
  const serverSolved = user
    ? await prisma.userTaskProgress.findMany({
      where: { userId: user.id, status: "SOLVED", task: { status: TaskStatus.PUBLISHED } },
      select: { task: { select: { number: true } } }
    })
    : [];
  const solvedNumbers = user
    ? serverSolved.map((item) => item.task.number)
    : Array.isArray(body.solvedNumbers) ? body.solvedNumbers.filter(Number.isInteger) : [];
  if (solvedNumbers.length > 0) where.number = { notIn: solvedNumbers };
  where.status = TaskStatus.PUBLISHED;
  const count = await prisma.task.count({ where });
  if (count === 0) return fail("NO_RANDOM_TASK", "Подходящих нерешённых заданий не найдено", 404);
  const skip = Math.floor(Math.random() * count);
  const task = await prisma.task.findFirst({ where, skip, orderBy: { number: "asc" }, select: { number: true } });
  return task ? ok(task) : fail("NO_RANDOM_TASK", "Подходящих заданий не найдено", 404);
}

export async function GET(request: NextRequest) {
  return pick(request);
}

export async function POST(request: NextRequest) {
  return pick(request);
}
