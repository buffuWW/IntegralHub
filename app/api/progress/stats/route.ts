import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/user-auth";
import { getProgressStats } from "@/lib/user-progress-service";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    return ok(await getProgressStats(user.id));
  } catch {
    return fail("UNAUTHORIZED", "Требуется вход в аккаунт", 401);
  }
}
