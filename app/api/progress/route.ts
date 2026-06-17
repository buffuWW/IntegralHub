import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/user-auth";
import { getProgressList } from "@/lib/user-progress-service";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    return ok(await getProgressList(user.id, request.nextUrl.searchParams));
  } catch {
    return fail("UNAUTHORIZED", "Требуется вход в аккаунт", 401);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const body = await request.json().catch(() => ({})) as { confirm?: string };
    if (body.confirm !== "RESET_PROGRESS") return fail("CONFIRMATION_REQUIRED", "Нужно подтвердить сброс прогресса", 400);
    await prisma.userTaskProgress.deleteMany({ where: { userId: user.id } });
    return ok({ deleted: true });
  } catch {
    return fail("UNAUTHORIZED", "Требуется вход в аккаунт", 401);
  }
}
