import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { purgeExpiredArchivedTasks } from "@/lib/archive";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? request.nextUrl.searchParams.get("secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) return fail("UNAUTHORIZED", "Неверный секрет cron", 401);
  return ok(await purgeExpiredArchivedTasks());
}
