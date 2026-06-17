import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { purgeTask, updateTask } from "@/lib/task-service";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin(request);
  const { id } = await params;
  const task = await prisma.task.findUnique({ where: { id }, include: { category: true, images: true } });
  return task ? ok(task) : fail("NOT_FOUND", "Задание не найдено", 404);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin(request);
  const { id } = await params;
  try {
    return ok(await updateTask(id, await request.json()));
  } catch (error) {
    return fail("TASK_SAVE_FAILED", error instanceof Error ? error.message : "Не удалось сохранить задание", 400);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin(request);
  const { id } = await params;
  return ok(await purgeTask(id));
}
