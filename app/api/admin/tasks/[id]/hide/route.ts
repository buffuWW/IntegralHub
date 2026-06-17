import { TaskStatus } from "@prisma/client";
import { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { setTaskStatus } from "@/lib/task-service";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin(request);
  return ok(await setTaskStatus((await params).id, TaskStatus.HIDDEN));
}
