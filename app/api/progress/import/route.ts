import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/user-auth";
import { importGuestProgress } from "@/lib/user-progress-service";
import { progressImportSchema } from "@/lib/user-schemas";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const parsed = progressImportSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return fail("INVALID_PROGRESS_IMPORT", "Некорректные данные прогресса", 400);
    return ok(await importGuestProgress(user.id, parsed.data.tasks));
  } catch (error) {
    if (error instanceof Error && error.message === "USER_UNAUTHORIZED") return fail("UNAUTHORIZED", "Требуется вход в аккаунт", 401);
    return fail("PROGRESS_IMPORT_FAILED", "Не удалось перенести прогресс", 400);
  }
}
