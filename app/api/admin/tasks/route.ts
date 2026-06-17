import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTask } from "@/lib/task-service";

export async function GET(request: NextRequest) {
  await requireAdmin(request);
  const tasks = await prisma.task.findMany({ orderBy: { number: "asc" }, include: { category: true } });
  return ok({ tasks });
}

export async function POST(request: NextRequest) {
  await requireAdmin(request);
  try {
    return ok(await createTask(await request.json()), { status: 201 });
  } catch (error) {
    return fail("TASK_SAVE_FAILED", error instanceof Error ? error.message : "Не удалось создать задание", 400);
  }
}
