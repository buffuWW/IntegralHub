import { TaskStatus } from "@prisma/client";
import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const taskNumber = Number(number);
  const task = await prisma.task.findFirst({
    where: { number: taskNumber, status: TaskStatus.PUBLISHED },
    include: { category: true, images: true }
  });
  if (!task) return fail("NOT_FOUND", "Задание не найдено", 404);

  const [previous, next] = await Promise.all([
    prisma.task.findFirst({ where: { status: TaskStatus.PUBLISHED, number: { lt: taskNumber } }, orderBy: { number: "desc" }, select: { number: true } }),
    prisma.task.findFirst({ where: { status: TaskStatus.PUBLISHED, number: { gt: taskNumber } }, orderBy: { number: "asc" }, select: { number: true } })
  ]);
  return ok({ task, previousNumber: previous?.number ?? null, nextNumber: next?.number ?? null });
}
