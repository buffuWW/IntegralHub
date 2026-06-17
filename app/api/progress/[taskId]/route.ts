import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/user-auth";
import { upsertTaskProgress } from "@/lib/user-progress-service";
import { progressUpdateSchema } from "@/lib/user-schemas";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const user = await requireUser(request);
    const parsed = progressUpdateSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return fail("INVALID_PROGRESS", "Некорректные данные прогресса", 400);
    const { taskId } = await params;
    return ok(await upsertTaskProgress({ userId: user.id, taskId, ...parsed.data }));
  } catch (error) {
    if (error instanceof Error && error.message === "USER_UNAUTHORIZED") return fail("UNAUTHORIZED", "Требуется вход в аккаунт", 401);
    return fail("PROGRESS_UPDATE_FAILED", error instanceof Error ? error.message : "Не удалось сохранить прогресс", 400);
  }
}
